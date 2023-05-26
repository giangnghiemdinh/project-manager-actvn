import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination, PaginationMetaDto } from '../../common/dtos';
import { ProjectEntity } from './models';
import {
  ProjectApprovePayloadDto,
  ProjectCouncilReviewRequestDto,
  ProjectDto,
  ProjectImportRequestDto,
  ProjectPagePayloadDto,
  ProjectPageResponseDto,
  ProjectPayloadDto,
  ProjectReviewRequestDto,
} from './dtos';
import { UserEntity } from '../user/models';
import { ProjectProgressEntity } from './models/project-progress.entity';
import {
  PROJECT_DUPLICATE_NAME,
  PROJECT_FOLDER_PROCESS,
  PROJECT_INSTR_NOT_EXIST,
  PROJECT_STUDENT_NOT_EXIST,
  ProjectProgress,
  ProjectProgressType,
  ProjectQueryState,
  ProjectStatus,
  Role,
} from '../../common/constants';
import { DriverQueueService, DriverService } from '../../shared/services';
import { StudentService } from '../student/student.service';
import { Transactional } from 'typeorm-transactional';
import { StudentDto } from '../student/dtos';
import { UserEventService, UserService } from '../user/services';
import { SemesterService } from '../semester/semester.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,

    @InjectRepository(ProjectProgressEntity)
    private readonly projectProgressRepository: Repository<ProjectProgressEntity>,

    private readonly userService: UserService,

    private readonly studentService: StudentService,

    private readonly userEventService: UserEventService,

    private readonly driverQueueService: DriverQueueService,

    private readonly driverService: DriverService,

    private readonly semesterService: SemesterService,
  ) {}

  async getProjects(
    pageOptionsDto: ProjectPagePayloadDto,
    user: UserEntity,
  ): Promise<Pagination<ProjectDto>> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');

    queryBuilder
      .select([
        'project.id',
        'project.name',
        'project.status',
        'project.semester',
        'project.reason',
        'project.createdAt',
      ])
      .leftJoin('project.department', 'department')
      .leftJoin('project.instructor', 'instructor')
      .leftJoinAndSelect('project.students', 'student')
      .leftJoin('project.semester', 'semester')
      .leftJoin('project.reviewedBy', 'reviewedBy')
      .leftJoin('project.managerStaff', 'managerStaff')
      .leftJoin('project.reviewerStaff', 'reviewerStaff')
      .leftJoin('reviewerStaff.user', 'reviewerStaffUser')
      .leftJoin('project.examinerCouncil', 'examinerCouncil')
      .leftJoin(
        'examinerCouncil.users',
        'examinerCouncilUsers',
        'examinerCouncilUsers.userId = :userId',
        { userId: user.id },
      )
      .addSelect([
        'instructor.fullName',
        'instructor.id',
        'department.name',
        'semester.name',
        'reviewedBy.id',
        'reviewedBy.fullName',
        'managerStaff.id',
        'managerStaff.userId',
        'reviewerStaff.id',
        'reviewerStaff.userId',
        'reviewerStaffUser.fullName',
        'examinerCouncil.id',
        'examinerCouncilUsers.position',
      ]);

    if (pageOptionsDto.extra?.includes('d')) {
      queryBuilder.addSelect(['project.description', 'project.requirement']);
    }

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(project.name) LIKE :q', {
        q: `${pageOptionsDto.q.toUpperCase()}`,
      });
    }

    if (pageOptionsDto.departmentId) {
      queryBuilder.andWhere('project.department_id = :departmentId', {
        departmentId: pageOptionsDto.departmentId,
      });
    }

    if (pageOptionsDto.semesterId) {
      queryBuilder.andWhere('project.semesterId = :semesterId', {
        semesterId: pageOptionsDto.semesterId,
      });
    }

    if (pageOptionsDto.status) {
      const statuses = pageOptionsDto.status.split(',');
      queryBuilder.andWhere('project.status IN (:...statuses)', {
        statuses,
      });
    } else {
      queryBuilder.andWhere('project.status NOT IN (:...statuses)', {
        statuses: [ProjectStatus.REFUSE, ProjectStatus.PROPOSE],
      });
    }

    switch (pageOptionsDto.state) {
      case ProjectQueryState.MANAGER_NOT_EXIST:
        queryBuilder.andWhere('project.managerStaff IS NULL');
        break;
      case ProjectQueryState.REVIEWER_NOT_EXIST:
        queryBuilder
          .andWhere('project.reviewerStaff IS NULL')
          .leftJoin('project.progresses', 'progresses')
          .andWhere('progresses.type = :type AND progresses.isApproval = 1', {
            type: ProjectProgressType.INSTRUCTOR_REVIEW,
          });
        break;
      case ProjectQueryState.COUNCIL_NOT_EXIST:
        queryBuilder
          .andWhere('project.examinerCouncil IS NULL')
          .leftJoin('project.progresses', 'progresses')
          .andWhere('progresses.type = :type AND progresses.isApproval = 1', {
            type: ProjectProgressType.REVIEWER_REVIEW,
          });
        break;
      case ProjectQueryState.INSTRUCTOR:
        queryBuilder.andWhere('project.instructorId = :userId', {
          userId: user.id,
        });
        break;
      case ProjectQueryState.MANAGER:
        queryBuilder.andWhere('managerStaff.userId = :userId', {
          userId: user.id,
        });
        break;
      case ProjectQueryState.REVIEWER:
        queryBuilder.andWhere('reviewerStaff.userId = :userId', {
          userId: user.id,
        });
        break;
      case ProjectQueryState.COUNCIL:
        queryBuilder.andWhere('examinerCouncilUsers.userId = :userId', {
          userId: user.id,
        });
        break;
    }

    const [entities, itemCount] = await queryBuilder
      .orderBy('project.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit)
      .getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    this.logger.log(`Lấy danh sách đề tài`);
    return new ProjectPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  async createProject(
    projectDto: ProjectPayloadDto,
    user: UserEntity,
  ): Promise<ProjectDto> {
    const project = this.projectRepository.create(projectDto);
    this.logger.log(`Thêm mới đề tài ${project.id}`);
    await this.projectRepository.save(project);

    await this.driverQueueService.add(
      PROJECT_FOLDER_PROCESS,
      {
        id: project.id,
        folderName: project.name,
      },
      { delay: 2000 },
    );

    // Create event
    // this.userEventService.insert({
    //   message: 'Thêm mới đề tài {projectName}',
    //   params: JSON.stringify({
    //     projectName: project.name,
    //     projectId: project.id,
    //   }),
    //   userId: user.id,
    // }).then();
    return project.toDto();
  }

  updateFolderId(id: number, folderId: string) {
    return this.projectRepository.update({ id }, { folderId });
  }

  updateStatus(id: number, status: ProjectStatus) {
    return this.projectRepository.update({ id }, { status });
  }

  async getProject(id: number, query?: { extra: string }): Promise<ProjectDto> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.id = :id', { id })
      .leftJoinAndSelect('project.instructor', 'instructor')
      .leftJoinAndSelect('project.students', 'students')
      .leftJoinAndSelect('project.department', 'department')
      .leftJoinAndSelect('project.semester', 'semester');

    if (query && query.extra) {
      if (query.extra?.includes('pg')) {
        queryBuilder.leftJoinAndSelect('project.progresses', 'progresses');
      }
      if (query.extra?.includes('rv')) {
        queryBuilder.leftJoinAndSelect('project.reviewedBy', 'reviewedBy');
      }
    }

    const project = await queryBuilder.getOne();
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }
    return project.toDto();
  }

  async approveProject(
    projectApproveDto: ProjectApprovePayloadDto,
    user: UserEntity,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectApproveDto.id },
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }
    if (project.status !== ProjectStatus.PROPOSE) {
      throw new ForbiddenException();
    }

    const currentSemester = await this.semesterService.getCurrentSemester();
    if (!currentSemester && projectApproveDto.status !== ProjectStatus.REFUSE) {
      throw new BadRequestException(
        'Học kỳ hiện tại không xác định! Vui lòng liên hệ quản trị viên để được xử lý.',
      );
    }

    await this.projectRepository.update(
      { id: project.id },
      {
        status: projectApproveDto.status,
        reason: projectApproveDto.reason,
        reviewedBy: user,
        semester: currentSemester || null,
      },
    );

    // Create event
    this.userEventService
      .insert({
        message: `${
          projectApproveDto.status === ProjectStatus.REFUSE
            ? 'Từ chối'
            : 'Phê duyệt'
        } đề tài {projectName}`,
        params: JSON.stringify({
          projectName: project.name,
          projectId: project.id,
        }),
        userId: user.id,
      })
      .then();

    return project.toDto();
  }

  async updateProject(
    id: number,
    projectDto: ProjectPayloadDto,
    user: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }
    this.projectRepository.merge(project, projectDto);
    await this.projectRepository.save(project);

    // Create event
    this.userEventService
      .insert({
        message: `Cập nhật đề tài {projectName}`,
        params: JSON.stringify({
          projectName: project.name,
          projectId: project.id,
        }),
        userId: user.id,
      })
      .then();
  }

  async deleteProject(id: number, user: UserEntity): Promise<void> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.id = :id', { id });

    const project = await queryBuilder.getOne();

    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }

    await this.projectRepository.remove(project);

    // Create event
    this.userEventService
      .insert({
        message: `Xoá đề tài {projectName}`,
        params: JSON.stringify({ projectName: project.name }),
        userId: user.id,
      })
      .then();
  }

  @Transactional()
  async importProject(request: ProjectImportRequestDto, user: UserEntity) {
    for (let i = 0; i < request.projects.length; i++) {
      const project = request.projects[i];
      const existProject = await this.projectRepository.findOne({
        where: { name: project.name },
        relations: ['students', 'instructor'],
      });

      // Get student
      const students: StudentDto[] = [];
      if (project.requirement) {
        const regex =
          /Sinh viên:\s*(.*?)\s*\n(.*?)\s*\n(.*?)\s*\n(.*?)\s*(?:\n|$)/g;
        let match;
        while ((match = regex.exec(project.requirement))) {
          const [, fullName, code, email, phone] = match;
          if (!code) {
            continue;
          }
          const student = await this.studentService.findByCode(
            (code || '').trim(),
          );
          if (!student) {
            switch (request.studentNotExist) {
              case PROJECT_STUDENT_NOT_EXIST.INSERT:
                const newStudent = await this.studentService.createStudent({
                  fullName: (fullName || '').trim(),
                  code: (code || '').trim(),
                  email: (email || '').trim().toLowerCase(),
                  phone: (phone || '').trim(),
                  departmentId: request.departmentId,
                });
                students.push(newStudent);
                break;
              default:
                throw new BadRequestException(
                  `Sinh viên dòng ${i + 2} không tồn tại!`,
                );
            }
          } else {
            students.push(student.toDto());
          }
        }
        project.requirement = project.requirement.replace(regex, '').trim();
      }

      // Get instructor
      let instructorId: number;
      if (project.instructor) {
        const array = project.instructor.split('\n');
        if (!array || array.length < 4) {
          throw new BadRequestException(
            `Thông tin người hướng dẫn dòng ${i + 2} không hợp lệ!`,
          );
        }
        const [fullName, workPlace, email, phone] = array;
        const instructor = await this.userService.findByEmail(email?.trim());
        if (!instructor) {
          switch (request.instrNotExist) {
            case PROJECT_INSTR_NOT_EXIST.INSERT:
              const newInstr = await this.userService.createUser({
                email: (email || '').trim().toLowerCase(),
                fullName: (fullName || '').trim(),
                workPlace: (workPlace || '').trim(),
                phone: (phone || '').trim(),
                role: Role.LECTURER,
              });
              instructorId = newInstr.id;
              break;
            default:
              throw new BadRequestException(
                `Người hướng dẫn dòng ${i + 2} không tồn tại!`,
              );
          }
        } else {
          instructorId = instructor.id;
        }
      }

      if (!existProject) {
        await this.createProject(
          {
            departmentId: request.departmentId,
            semesterId: request.semesterId,
            name: project.name,
            description: project.description,
            requirement: project.requirement,
            instructorId: instructorId,
            status: students.length
              ? ProjectStatus.IN_PROGRESS
              : ProjectStatus.PENDING,
            students,
          },
          user,
        );
        continue;
      }
      switch (request.duplicateName) {
        case PROJECT_DUPLICATE_NAME.REPLACE:
          this.projectRepository.merge(existProject, {
            description: project.description,
            requirement: project.requirement,
            instructorId,
            students,
          });
          await this.projectRepository.save(existProject);
          break;
        case PROJECT_DUPLICATE_NAME.MERGE:
          this.projectRepository.merge(existProject, {
            description: `${existProject.description}\n${project.description}`,
            requirement: `${existProject.requirement}\n${project.requirement}`,
            instructorId: instructorId,
            students: [...existProject.students, ...students],
          });
          await this.projectRepository.save(existProject);
          break;
        default:
          throw new ConflictException(`Đề tài ${project.name} đã tồn tại!`);
      }
    }
  }

  async report(
    id: number,
    request: { type: ProjectProgressType },
    files: { wordFile; reportFile; otherFile },
    user: UserEntity,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }

    const progress = await this.projectProgressRepository.findOne({
      where: { projectId: project.id, type: request.type },
    });

    let folderId;
    const uploadedFile: { [key: string]: string } = {};
    try {
      if (progress) {
        folderId = progress.folderId;
      } else {
        const { id } = await this.driverService.createFolder(
          ProjectProgress[request.type],
          project.folderId,
        );
        folderId = id;
      }

      for (const key of Object.keys(files)) {
        if (!files[key] || !files[key].length) {
          continue;
        }
        const data = await this.driverService.uploadFile(
          files[key][0],
          folderId,
        );
        uploadedFile[key] = JSON.stringify({
          id: data.id,
          name: data.name,
          webViewLink: data.webViewLink,
          webContentLink: data.webContentLink,
        });
      }
    } catch (e) {
      throw new BadRequestException('Có lỗi xảy ra! Vui lòng thử lại sau');
    }

    if (!progress) {
      // Create event
      this.userEventService
        .insert({
          message: `Cập nhật ${
            ProjectProgress[request.type]
          } cho đề tài {projectName}`,
          params: JSON.stringify({
            projectName: project.name,
            projectId: project.id,
          }),
          userId: user.id,
        })
        .then();

      return this.projectProgressRepository.insert({
        folderId,
        ...uploadedFile,
        projectId: project.id,
        type: request.type,
      });
    }
    return await this.projectProgressRepository.update(
      { id: progress.id },
      uploadedFile,
    );
  }

  async review(id: number, request: ProjectReviewRequestDto, user: UserEntity) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }

    const progress = await this.projectProgressRepository.findOne({
      where: { projectId: project.id, type: request.type },
    });

    if (!progress) {
      // Create event
      this.userEventService
        .insert({
          message: `Cập nhật ${
            ProjectProgress[request.type]
          } cho đề tài {projectName}`,
          params: JSON.stringify({
            projectName: project.name,
            projectId: project.id,
          }),
          userId: user.id,
        })
        .then();
      return this.projectProgressRepository.insert({
        ...request,
        projectId: project.id,
      });
    }
    return await this.projectProgressRepository.update(
      { id: progress.id },
      request,
    );
  }

  async councilReview(
    id: number,
    request: ProjectCouncilReviewRequestDto,
    user: UserEntity,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }
    // Create event
    this.userEventService
      .insert({
        message: `Cập nhật Điểm hội đồng cho đề tài {projectName}`,
        params: JSON.stringify({
          projectName: project.name,
          projectId: project.id,
        }),
        userId: user.id,
      })
      .then();
    return this.projectRepository.update({ id: project.id }, request);
  }

  async getReport(id: number, type: ProjectProgressType) {
    let progress = await this.projectProgressRepository.findOne({
      where: { projectId: id, type },
    });
    if (!progress) {
      progress = this.projectProgressRepository.create({ projectId: id, type });
    }
    return progress.toDto();
  }
}
