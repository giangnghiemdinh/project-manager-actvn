import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SemesterDto, SemesterRequestDto } from './dtos';
import { SemesterEntity } from './models';
import moment from 'moment';
import { ProjectQueueService } from '../../shared/services';
import {
  PROJECT_STATUS_PROCESS,
  ProjectProgressType,
  ProjectStatus,
} from '../../common/constants';
import { UserEntity } from '../user/models';

@Injectable()
export class SemesterService {
  private readonly logger = new Logger(SemesterService.name);

  constructor(
    @InjectRepository(SemesterEntity)
    private readonly semesterRepository: Repository<SemesterEntity>,

    private readonly projectQueueService: ProjectQueueService,
  ) {}

  findById(id: number) {
    return this.semesterRepository.findOne({
      where: { id },
    });
  }

  async validateLockedSemester(id: number) {
    const semester = await this.findById(id);
    if (semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã khoá!');
    }
    return semester;
  }

  getCurrentSemester() {
    const current = new Date();
    return this.semesterRepository.findOne({
      where: { start: LessThanOrEqual(current), end: MoreThanOrEqual(current) },
    });
  }

  async getSemesters(): Promise<SemesterDto[]> {
    const semesters = await this.semesterRepository
      .createQueryBuilder('semester')
      .getMany();
    return semesters.map((d) => d.toDto());
  }

  async getSemester(id: number): Promise<SemesterDto> {
    const semester = await this.findById(id);
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }
    return semester.toDto();
  }

  async createSemester(
    request: SemesterRequestDto,
    currentUser: UserEntity,
  ): Promise<SemesterDto> {
    await this.validateDate(request.start, request.end);
    const semester = this.semesterRepository.create(request);
    await this.semesterRepository.insert(semester);
    this.logger.log(
      `${currentUser.fullName} đã thêm mới học kỳ ${semester.name}`,
    );
    return semester.toDto();
  }

  async updateSemester(
    id: number,
    request: SemesterRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    const semester = await this.findById(id);
    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }
    if (semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã bị khoá!');
    }
    await this.validateDate(request.start, request.end);

    await this.semesterRepository.update(
      { id },
      {
        name: request.name,
        start: request.start,
        end: request.end,
      },
    );

    this.logger.log(
      `${currentUser.fullName} đã cập nhật học kỳ ${semester.name}`,
    );
  }

  async deleteSemester(id: number, currentUser: UserEntity): Promise<void> {
    const semester = await this.semesterRepository
      .createQueryBuilder('semester')
      .where({ id })
      .loadRelationCountAndMap(
        'semester.projectCount',
        'semester.projects',
        'project',
      )
      .getOne();

    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }

    if (semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã bị khoá!');
    }

    if (semester.projectCount > 0) {
      throw new NotAcceptableException(
        'Xoá không thành công do học kỳ đã có đề tài',
      );
    }

    this.logger.log(`${currentUser.fullName} đã xoá học kỳ ${semester.name}`);

    await this.semesterRepository.delete({ id });
  }

  async lockSemester(id: number, currentUser: UserEntity): Promise<void> {
    const semester = await this.semesterRepository
      .createQueryBuilder('semester')
      .where({ id })
      .leftJoin('semester.projects', 'project')
      .loadRelationCountAndMap(
        'project.reportedCount',
        'project.progresses',
        'progress',
        (qb) =>
          qb.andWhere('progress.type = :type', {
            type: ProjectProgressType.COMPLETED,
          }),
      )
      .addSelect(['project.id', 'project.status', 'project.conclusionScore'])
      .getOne();

    if (!semester) {
      throw new NotFoundException('Học kỳ không tồn tại!');
    }

    if (semester.isLocked) {
      throw new NotAcceptableException('Học kỳ đã bị khoá!');
    }

    for (const project of semester.projects) {
      await this.projectQueueService.add(PROJECT_STATUS_PROCESS, {
        id: project.id,
        status:
          project.status !== ProjectStatus.PROPOSE
            ? ProjectStatus.IN_PRESENTATION === project.status &&
              project.conclusionScore > 4 &&
              project.reportedCount > 0
              ? ProjectStatus.COMPLETED
              : ProjectStatus.NOT_COMPLETED
            : ProjectStatus.EXPIRED,
      });
    }

    this.logger.log(`${currentUser.fullName} đã khoá học kỳ ${semester.name}`);

    await this.semesterRepository.update({ id }, { isLocked: true });
  }

  private async validateDate(start: Date, end: Date) {
    if (moment(end).isSameOrBefore(start)) {
      throw new BadRequestException('Ngày bắt đầu phải lớn hơn ngày kết thúc!');
    }
    const isExistDate = await this.semesterRepository.exist({
      where: [
        { start: LessThanOrEqual(start), end: MoreThanOrEqual(start) },
        { start: LessThanOrEqual(end), end: MoreThanOrEqual(end) },
      ],
    });
    if (isExistDate) {
      throw new BadRequestException(
        'Ngày bắt đầu hoặc ngày kết thúc không được thuộc học kỳ khác!',
      );
    }
  }
}
