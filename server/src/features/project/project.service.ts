import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination, PaginationMetaDto, PointGrade } from '../../common/dtos';
import { ProjectEntity } from './models';
import {
  ProjectApproveRequestDto,
  ProjectCouncilReviewRequestDto,
  ProjectDto,
  ProjectImportRequestDto,
  ProjectPageRequestDto,
  ProjectPageResponseDto,
  ProjectRequestDto,
  ProjectReviewRequestDto,
  ProjectStatisticalRequestDto,
  ProjectStatisticalResponseDto,
} from './dtos';
import { UserEntity } from '../user/models';
import { ProjectProgressEntity } from './models/project-progress.entity';
import {
  CREATE_EVENT_PROCESS,
  ExaminerCouncilPosition,
  PROJECT_APPROVE_PROCESS,
  PROJECT_DUPLICATE_NAME,
  PROJECT_FOLDER_PROCESS,
  PROJECT_INSTR_NOT_EXIST,
  PROJECT_STUDENT_NOT_EXIST,
  ProjectApproveStatus,
  ProjectProgress,
  ProjectProgressType,
  ProjectQueryState,
  ProjectStatus,
  Rank,
  Role,
} from '../../common/constants';
import {
  ApiConfigService,
  DriverService,
  QueueService,
} from '../../shared/services';
import { StudentService } from '../student/student.service';
import { Transactional } from 'typeorm-transactional';
import { StudentDto } from '../student/dtos';
import { UserService } from '../user/services';
import { SemesterService } from '../semester/semester.service';
import moment from 'moment';
import {
  calculatePointGrade,
  randomScore,
  randomString,
} from '../../common/utilities';

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
    private readonly driverService: DriverService,
    private readonly semesterService: SemesterService,
    private readonly apiConfigService: ApiConfigService,
    private readonly queueService: QueueService,
  ) {}

  async getProjects(
    pageOptionsDto: ProjectPageRequestDto,
    user: UserEntity,
  ): Promise<Pagination<ProjectDto>> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');

    queryBuilder
      .select([
        'project.id',
        'project.name',
        'project.status',
        'project.semester',
        'project.description',
        'project.requirement',
        'project.reason',
        'project.createdAt',
      ])
      .leftJoin('project.department', 'department')
      .leftJoin('project.instructor', 'instructor')
      .leftJoin('project.students', 'student')
      .leftJoin('project.semester', 'semester')
      .leftJoin('project.reviewedBy', 'reviewedBy')
      .leftJoin('project.createdBy', 'createdBy')
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
        'student.id',
        'student.code',
        'student.fullName',
        'student.phone',
        'student.email',
        'instructor.fullName',
        'instructor.email',
        'instructor.workPlace',
        'instructor.phone',
        'instructor.id',
        'instructor.rank',
        'department.name',
        'semester.name',
        'reviewedBy.id',
        'reviewedBy.fullName',
        'reviewedBy.rank',
        'createdBy.id',
        'createdBy.fullName',
        'createdBy.rank',
        'managerStaff.id',
        'managerStaff.userId',
        'reviewerStaff.id',
        'reviewerStaff.userId',
        'reviewerStaffUser.fullName',
        'reviewerStaffUser.rank',
        'examinerCouncil.id',
        'examinerCouncilUsers.position',
      ]);

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(project.name) LIKE :q', {
        q: `%${pageOptionsDto.q.toUpperCase()}%`,
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
        statuses: [
          ProjectStatus.REFUSE,
          ProjectStatus.PROPOSE,
          ProjectStatus.EXPIRED,
        ],
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
    return new ProjectPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  async createProject(
    request: ProjectRequestDto,
    currentUser: UserEntity,
  ): Promise<ProjectDto> {
    request.createdById = currentUser.id;
    await this.validateProject(request);

    const project = this.projectRepository.create(request);
    await this.projectRepository.save(project);

    this.logger.log(`${currentUser.fullName} đã mới đề tài ${project.name}`);

    // Nếu không phải đề xuất thì sẽ tạo folder
    if (project.status !== ProjectStatus.PROPOSE) {
      await this.queueService.addProject(
        PROJECT_FOLDER_PROCESS,
        {
          id: project.id,
          folderName: project.name,
        },
        1000,
      );
    }

    await this.queueService.addEvent(
      CREATE_EVENT_PROCESS,
      {
        message: `${
          project.status === ProjectStatus.PROPOSE ? 'Đề xuất' : 'Thêm mới'
        } đề tài {projectName}`,
        params: {
          projectName: project.name,
          projectId: project.id,
        },
        userId: currentUser.id,
      },
      1000,
    );

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
      .leftJoin('project.instructor', 'instructor')
      .leftJoin('project.students', 'student')
      .leftJoin('project.department', 'department')
      .leftJoin('project.semester', 'semester')
      .leftJoin('project.createdBy', 'createdBy')
      .addSelect([
        'instructor.id',
        'instructor.fullName',
        'instructor.rank',
        'department.id',
        'department.name',
        'semester.id',
        'semester.name',
        'student.id',
        'student.code',
        'student.fullName',
        'student.email',
        'student.phone',
        'createdBy.id',
        'createdBy.fullName',
        'createdBy.rank',
      ]);

    if (query && query.extra?.includes('all')) {
      queryBuilder
        .leftJoin('project.progresses', 'progress')
        .leftJoin('project.reviewedBy', 'reviewedBy')
        .leftJoin('project.managerStaff', 'managerStaff')
        .leftJoin('managerStaff.user', 'managerStaffUser')
        .leftJoin('project.reviewerStaff', 'reviewerStaff')
        .leftJoin('reviewerStaff.user', 'reviewerStaffUser')
        .leftJoin('project.examinerCouncil', 'examinerCouncil')
        .addSelect([
          'reviewedBy.id',
          'reviewedBy.fullName',
          'reviewedBy.rank',
          'managerStaff.id',
          'managerStaffUser.id',
          'managerStaffUser.fullName',
          'managerStaffUser.rank',
          'reviewerStaff.id',
          'reviewerStaffUser.id',
          'reviewerStaffUser.fullName',
          'reviewerStaffUser.rank',
          'examinerCouncil.location',
          'progress.id',
          'progress.wordFile',
          'progress.reportFile',
          'progress.otherFile',
          'progress.type',
          'progress.comment1',
          'progress.comment2',
          'progress.comment3',
          'progress.comment4',
          'progress.comment5',
          'progress.score',
          'progress.isApproval',
        ]);
    }

    const project = await queryBuilder.getOne();
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }
    return project.toDto();
  }

  async approveProject(
    request: ProjectApproveRequestDto,
    currentUser: UserEntity,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: request.id },
      relations: [
        'semester',
        'department',
        'students',
        'instructor',
        'createdBy',
      ],
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }
    if (project.status !== ProjectStatus.PROPOSE) {
      throw new ForbiddenException();
    }

    const status =
      request.status === ProjectApproveStatus.REFUSE
        ? ProjectStatus.REFUSE
        : project.students.length
        ? ProjectStatus.IN_PROGRESS
        : ProjectStatus.PENDING;

    await this.projectRepository.update(
      { id: project.id },
      {
        status,
        reason: status === ProjectStatus.REFUSE ? request.reason : '',
        reviewedBy: currentUser,
      },
    );

    if (request.status === ProjectApproveStatus.ACCEPT) {
      await this.queueService.addProject(
        PROJECT_FOLDER_PROCESS,
        {
          id: project.id,
          folderName: project.name,
        },
        1000,
      );
    }

    await this.queueService.addMail(PROJECT_APPROVE_PROCESS, {
      email: project.createdBy.email,
      title: `Đề tài đã ${
        request.status === ProjectApproveStatus.REFUSE
          ? 'bị từ chối'
          : 'được phê duyệt'
      }`,
      content: `Đề tài do bạn đề xuất ${
        request.status === ProjectApproveStatus.REFUSE
          ? 'đã bị kiểm duyệt viên từ chối.'
          : 'được kiểm duyệt viên phê duyệt.'
      }`,
      name: project.name,
      description: project.description,
      requirement: project.requirement,
      students: project.students
        ?.map((s) => `${s.code} - ${s.fullName}`)
        .join(', '),
      instructor: project.instructor?.fullName,
      createdDate: moment(project.createdAt).format('DD/MM/YYYY HH:mm'),
      reviewedDate: moment().format('DD/MM/YYYY HH:mm'),
      reason: request.reason,
      isRefuse: request.status === ProjectApproveStatus.REFUSE,
    });

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message:
        request.status === ProjectApproveStatus.REFUSE
          ? `Từ chối đề tài {projectName} | ${request.reason} | ${project.semester?.name} | ${project.department?.name}`
          : `Phê duyệt đề tài {projectName} | ${project.semester?.name} | ${project.department?.name}`,
      params: {
        projectName: project.name,
        projectId:
          request.status === ProjectApproveStatus.REFUSE
            ? undefined
            : project.id,
      },
      userId: currentUser.id,
      shouldLoad: false,
    });

    this.logger.log(
      `${currentUser.fullName} đã ${
        request.status === ProjectApproveStatus.REFUSE ? 'từ chối' : 'phê duyệt'
      } đề tài ${project.name}`,
    );

    return project.toDto();
  }

  async updateProject(
    id: number,
    request: ProjectRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại');
    }

    await this.validateProject(request, id);

    this.projectRepository.merge(project, request);
    await this.projectRepository.save(project);

    this.logger.log(
      `${currentUser.fullName} đã cập nhật đề tài ${project.name}`,
    );

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Cập nhật thông tin đề tài {projectName}`,
      params: {
        projectName: project.name,
        projectId: project.id,
      },
      userId: currentUser.id,
    });
  }

  async deleteProject(id: number, currentUser: UserEntity): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['semester', 'department'],
    });

    if (!project) {
      throw new NotFoundException('Đề tài không tồn tại!');
    }

    if (project.semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã khoá!');
    }

    if (!!project.managerStaffId) {
      throw new NotAcceptableException(
        'Không được phép xoá đề tài đã được phân công quản lý!',
      );
    }

    await this.projectRepository.delete({ id });

    this.logger.log(`${currentUser.fullName} đã xoá đề tài ${project.name}`);

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Xoá đề tài {projectName} | ${project.semester?.name} | ${project.department?.name}`,
      params: { projectName: project.name },
      userId: currentUser.id,
    });
  }

  @Transactional()
  async importProject(
    request: ProjectImportRequestDto,
    currentUser: UserEntity,
  ) {
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
                const newStudent = await this.studentService.createStudent(
                  {
                    fullName: (fullName || '').trim(),
                    code: (code || '').trim(),
                    email: (email || '').trim().toLowerCase(),
                    phone: (phone || '').trim(),
                    departmentId: request.departmentId,
                  },
                  currentUser,
                );
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
              let rank = Rank.Other;
              let fullN = fullName || '';
              switch (true) {
                case fullN.includes(`${Rank.Doctor}.`):
                  rank = Rank.Doctor;
                  fullN = fullN.replace(`${Rank.Doctor}.`, '');
                  break;
                case fullN.includes(`${Rank.Master}.`):
                  rank = Rank.Master;
                  fullN = fullN.replace(`${Rank.Master}.`, '');
                  break;
                case fullN.includes(`${Rank.Engineer}.`):
                  rank = Rank.Engineer;
                  fullN = fullN.replace(`${Rank.Engineer}.`, '');
                  break;
              }
              const newInstr = await this.userService.createUser(
                {
                  email: (email || '').trim().toLowerCase(),
                  fullName: fullN.trim(),
                  workPlace: (workPlace || '').trim(),
                  phone: (phone || '').trim(),
                  role: Role.LECTURER,
                  rank,
                },
                currentUser,
              );
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
            students: students.map((s) => ({ id: s.id, fullName: s.fullName })),
          },
          currentUser,
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
    currentUser: UserEntity,
  ) {
    const project = await this.validateReportPermission(
      id,
      request.type,
      currentUser,
    );

    const progress = await this.projectProgressRepository.findOne({
      where: { projectId: id, type: request.type },
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
      await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
        message: `Cập nhật ${
          ProjectProgress[request.type]
        } cho đề tài {projectName} | ${project.semester?.name} | ${
          project.department?.name
        }`,
        params: {
          projectName: project.name,
          projectId: project.id,
        },
        userId: currentUser.id,
        shouldLoad: false,
      });

      return this.projectProgressRepository.insert({
        folderId,
        ...uploadedFile,
        projectId: project.id,
        type: request.type,
      });
    }
    this.logger.log(
      `${currentUser.fullName} đã cập nhật ${
        ProjectProgress[request.type]
      } cho đề tài ${project.name}`,
    );
    return await this.projectProgressRepository.update(
      { id: progress.id },
      uploadedFile,
    );
  }

  async review(
    id: number,
    request: ProjectReviewRequestDto,
    currentUser: UserEntity,
  ) {
    const project = await this.validateReportPermission(
      id,
      request.type,
      currentUser,
    );

    const progress = await this.projectProgressRepository.findOne({
      where: { projectId: project.id, type: request.type },
    });

    if (!progress) {
      await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
        message: `Cập nhật ${
          ProjectProgress[request.type]
        } cho đề tài {projectName} | ${project.semester?.name} | ${
          project.department?.name
        }`,
        params: {
          projectName: project.name,
          projectId: project.id,
        },
        userId: currentUser.id,
        shouldLoad: false,
      });
      return this.projectProgressRepository.insert({
        ...request,
        projectId: project.id,
      });
    }
    this.logger.log(
      `${currentUser.fullName} đã cập nhật ${
        ProjectProgress[request.type]
      } cho đề tài ${project.name}`,
    );
    return await this.projectProgressRepository.update(
      { id: progress.id },
      request,
    );
  }

  async councilReview(
    id: number,
    request: ProjectCouncilReviewRequestDto,
    currentUser: UserEntity,
  ) {
    const project = await this.validateReportPermission(
      id,
      ProjectProgressType.COUNCIL_REVIEW,
      currentUser,
    );

    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `Cập nhật Điểm hội đồng cho đề tài {projectName} | ${project.semester?.name} | ${project.department?.name}`,
      params: {
        projectName: project.name,
        projectId: project.id,
      },
      userId: currentUser.id,
      shouldLoad: false,
    });

    this.logger.log(
      `${currentUser.fullName} đã cập nhật điểm hội đồng cho đề tài ${project.name}`,
    );
    return this.projectRepository.update({ id: project.id }, request);
  }

  async getReport(id: number, type: ProjectProgressType, user: UserEntity) {
    await this.validateReportPermission(id, type, user);
    let progress = await this.projectProgressRepository.findOne({
      where: { projectId: id, type },
    });
    if (!progress) {
      progress = this.projectProgressRepository.create({ projectId: id, type });
    }
    return progress.toDto();
  }

  private async validateReportPermission(
    projectId: number,
    type: ProjectProgressType,
    user: UserEntity,
  ) {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.semester', 'semester')
      .leftJoin('project.department', 'department')
      .where('project.id = :id', {
        id: projectId,
      })
      .andWhere('semester.isLocked = :isLocked', { isLocked: false })
      .addSelect([
        'semester.id',
        'semester.name',
        'department.id',
        'department.name',
      ]);

    if (user.role !== Role.ADMINISTRATOR) {
      switch (type) {
        case ProjectProgressType.INSTRUCTOR_REVIEW:
          queryBuilder
            .andWhere('project.status = :status', {
              status: ProjectStatus.IN_PROGRESS,
            })
            .andWhere('project.instructorId = :userId', {
              userId: user.id,
            });
          break;
        case ProjectProgressType.REVIEWER_REVIEW:
          queryBuilder
            .andWhere('project.status = :status', {
              status: ProjectStatus.IN_REVIEW,
            })
            .leftJoin('project.reviewerStaff', 'reviewerStaff')
            .andWhere('reviewerStaff.userId = :userId', {
              userId: user.id,
            });
          break;
        case ProjectProgressType.COUNCIL_REVIEW:
        case ProjectProgressType.COMPLETED:
          queryBuilder
            .andWhere('project.status = :status', {
              status: ProjectStatus.IN_PRESENTATION,
            })
            .leftJoin('project.examinerCouncil', 'examinerCouncil')
            .leftJoin('examinerCouncil.users', 'examinerCouncilUsers')
            .andWhere(
              'examinerCouncilUsers.userId = :userId AND examinerCouncilUsers.position IN (:...positions)',
              {
                userId: user.id,
                positions: [
                  ExaminerCouncilPosition.CHAIRPERSON,
                  ExaminerCouncilPosition.SECRETARY,
                ],
              },
            );
          break;
        default:
          queryBuilder
            .andWhere('project.status = :status', {
              status: ProjectStatus.IN_PROGRESS,
            })
            .leftJoin('project.managerStaff', 'managerStaff')
            .andWhere('managerStaff.userId = :userId', {
              userId: user.id,
            });
      }
    }
    const project = await queryBuilder.getOne();
    if (!project) {
      throw new ForbiddenException(
        'Đề tài không tồn tại hoặc bạn không có quyền truy cập chức năng này!',
      );
    }

    return project;
  }

  private async validateProject(
    request: ProjectRequestDto,
    projectId?: number,
  ) {
    // Kiểm tra học kỳ có bị khoá không
    const semester = await this.semesterService.validateLockedSemester(
      request.semesterId,
    );

    // Kiểm tra người hướng dẫn đã nhận tối đa đồ án
    if (request.instructorId) {
      const maxProjectPerSemester =
        this.apiConfigService.maxProjectInstrPerSemester;
      const queryBuilder = this.projectRepository
        .createQueryBuilder('project')
        .where('project.semesterId = :semesterId', {
          semesterId: request.semesterId,
        })
        .andWhere('project.departmentId = :departmentId', {
          departmentId: request.departmentId,
        })
        .andWhere('project.instructorId = :instructorId', {
          instructorId: request.instructorId,
        })
        .andWhere('project.status NOT IN (:...statuses)', {
          statuses: [ProjectStatus.REFUSE, ProjectStatus.EXPIRED],
        });
      if (projectId) {
        queryBuilder.andWhere('project.id <> :id', { id: projectId });
      }
      const projectCount = await queryBuilder.getCount();
      if (projectCount >= maxProjectPerSemester) {
        throw new NotAcceptableException(
          `Người hướng dẫn đã nhận tối đa ${maxProjectPerSemester} đề tài trong học kỳ!`,
        );
      }
    }

    // Kiểm tra sinh viên đã thưc hiện đồ án khác
    for (const student of request.students) {
      const queryBuilder = this.projectRepository
        .createQueryBuilder('project')
        .where('project.semesterId = :semesterId', {
          semesterId: request.semesterId,
        })
        .andWhere('project.departmentId = :departmentId', {
          departmentId: request.departmentId,
        })
        .leftJoin('project.students', 'student')
        .andWhere('student.id = :studentId', {
          studentId: student.id,
        })
        .andWhere('project.status NOT IN (:...statuses)', {
          statuses: [ProjectStatus.REFUSE, ProjectStatus.EXPIRED],
        });
      if (projectId) {
        queryBuilder.andWhere('project.id <> :id', { id: projectId });
      }
      const projectCount = await queryBuilder.getCount();
      if (projectCount > 0) {
        throw new NotAcceptableException(
          `Sinh viên ${student.fullName} đang đang đề xuất hoặc thực hiện đề tài khác!`,
        );
      }
    }

    return semester;
  }

  async getStatistical(request: ProjectStatisticalRequestDto) {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.progresses', 'progress')
      .addSelect(['progress.id', 'progress.type', 'progress.score']);

    if (request.departmentId) {
      queryBuilder.andWhere('project.department_id = :departmentId', {
        departmentId: request.departmentId,
      });
    }

    if (request.semesterId) {
      queryBuilder.andWhere('project.semesterId = :semesterId', {
        semesterId: request.semesterId,
      });
    }

    const projects = await queryBuilder.getMany();

    const total = projects.length;
    let totalRefuse = 0;
    let totalExpired = 0;
    let totalCompleted = 0;
    let totalScore = 0;
    let totalReview = 0;
    let totalPresentation = 0;
    const scoreDistribution: { [key: number]: number } = {};
    const presentationPointGrade: PointGrade = {};
    const instructorPointGrade: PointGrade = {};
    const reviewerPointGrade: PointGrade = {};
    for (const project of projects) {
      switch (project.status) {
        case ProjectStatus.REFUSE:
          totalRefuse++;
          break;
        case ProjectStatus.EXPIRED:
          totalExpired++;
          break;
        case ProjectStatus.COMPLETED:
          totalCompleted++;
          break;
      }

      const instructorReport = project.progresses.find(
        (pg) => pg.type === ProjectProgressType.INSTRUCTOR_REVIEW,
      );
      if (instructorReport) {
        calculatePointGrade(instructorPointGrade, instructorReport.score);
      }

      const reviewerReport = project.progresses.find(
        (pg) => pg.type === ProjectProgressType.REVIEWER_REVIEW,
      );
      if (reviewerReport) {
        totalReview++;
        calculatePointGrade(reviewerPointGrade, reviewerReport.score);
      }

      if (project.conclusionScore !== null) {
        totalPresentation++;
        const score = project.conclusionScore;
        totalScore += score;
        if (score in scoreDistribution) {
          scoreDistribution[score]++;
        } else {
          scoreDistribution[score] = 1;
        }
        calculatePointGrade(presentationPointGrade, score);
      }
    }
    return new ProjectStatisticalResponseDto({
      total,
      totalRefuse,
      totalExpired,
      totalCompleted,
      totalReview,
      totalPresentation,
      scoreDistribution,
      presentationPointGrade,
      instructorPointGrade,
      reviewerPointGrade,
      averageScore: +(totalScore / totalPresentation).toFixed(1),
    });
  }

  async dumpReview(type: ProjectProgressType, currentUser: UserEntity) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.progresses', 'progress')
      .andWhere('project.managerStaff IS NOT NULL')
      .getMany();
    for (const project of projects) {
      try {
        if (type === ProjectProgressType.COUNCIL_REVIEW) {
          if (project.status !== ProjectStatus.IN_PRESENTATION) {
            continue;
          }
          const formScore = randomScore(10, 15);
          const contentScore = randomScore(15, 35);
          const summarizeScore = randomScore(10, 20);
          const answerScore = randomScore(20, 30);
          const conclusionScore = +(
            (formScore +
              contentScore +
              summarizeScore +
              answerScore +
              randomScore(0, 10)) /
            10
          ).toFixed(1);
          await this.councilReview(
            project.id,
            {
              formScore,
              contentScore,
              summarizeScore,
              answerScore,
              conclusionScore,
            },
            currentUser,
          );
        } else {
          if (project.progresses.some((pg) => pg.type == type)) {
            continue;
          }
          const score = randomScore();
          await this.review(
            project.id,
            {
              comment1: `${
                type != ProjectProgressType.INSTRUCTOR_REVIEW
                  ? 'Tính thực tiến cao'
                  : 'Đã hoàn thành tốt'
              } ${randomString(8)}`,
              comment2: `Đạt yêu cầu ${randomString(8)}`,
              comment3: `Tốt ${randomString(8)}`,
              comment4:
                type != ProjectProgressType.INSTRUCTOR_REVIEW
                  ? `Tốt ${randomString(8)}`
                  : '',
              comment5: '',
              score,
              isApproval: score > 4,
              type,
            },
            currentUser,
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  async dumpReport(
    type: ProjectProgressType,
    files: { wordFile; reportFile; otherFile },
    currentUser: UserEntity,
  ) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.progresses', 'progress')
      .andWhere('project.managerStaff IS NOT NULL')
      .getMany();
    for (const project of projects) {
      if (project.progresses.some((pg) => pg.type == type)) {
        continue;
      }
      try {
        await this.report(project.id, { type }, files, currentUser);
      } catch (e) {
        console.log(e);
      }
    }
  }
}
