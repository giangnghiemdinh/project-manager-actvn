import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ProjectPagePayloadDto } from '../project/dtos';
import { Pagination, PaginationMetaDto } from '../../common/dtos';
import { ProgressEntity } from './models';
import {
  ProgressDto,
  ProgressPageResponseDto,
  ProgressPayloadDto,
} from './dtos';
import moment from 'moment';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    @InjectRepository(ProgressEntity)
    private progressRepository: Repository<ProgressEntity>,
  ) {}

  findBySemester(departmentId: number, semesterId: number) {
    return this.progressRepository.findOne({
      where: { departmentId, semesterId },
    });
  }

  async getProgresses(
    pageOptionsDto: ProjectPagePayloadDto,
  ): Promise<Pagination<ProgressDto>> {
    const queryBuilder = this.progressRepository.createQueryBuilder('progress');

    if (pageOptionsDto.q) {
      queryBuilder.where('UCASE(progress.name) LIKE :q', {
        q: `${pageOptionsDto.q.toUpperCase()}`,
      });
    }

    queryBuilder
      .orderBy('progress.createdAt', pageOptionsDto.order)
      .leftJoin('progress.department', 'department')
      .leftJoin('progress.semester', 'semester')
      .addSelect(['department.name', 'semester.name'])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });
    this.logger.log(`Lấy danh sách tiến độ`);
    return new ProgressPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  async createProgress(progressDto: ProgressPayloadDto): Promise<ProgressDto> {
    const isExistInSemester = this.progressRepository.exist({
      where: {
        departmentId: progressDto.departmentId,
        semesterId: progressDto.semesterId,
      },
    });
    if (isExistInSemester) {
      throw new NotAcceptableException('Học kỳ này đã lên tiến độ!');
    }
    const progress = this.progressRepository.create(progressDto);
    await this.progressRepository.save(progress);
    this.logger.log(`Thêm mới tiến độ ${progress.id}`);
    return progress.toDto();
  }

  async getProgress(id: number): Promise<ProgressDto> {
    const progress = await this.progressRepository.findOne({
      where: { id },
    });
    if (!progress) {
      throw new NotFoundException('Tiến độ không tồn tại');
    }
    return progress.toDto();
  }

  async updateProgress(
    id: number,
    progressDto: ProgressPayloadDto,
  ): Promise<void> {
    const progress = await this.progressRepository.findOne({
      where: { id },
    });
    if (!progress) {
      throw new NotFoundException('Tiến độ không tồn tại');
    }
    const isExistInSemester = this.progressRepository.exist({
      where: {
        departmentId: progressDto.departmentId,
        semesterId: progressDto.semesterId,
        id: Not(id),
      },
    });
    if (isExistInSemester) {
      throw new NotAcceptableException('Học kỳ này đã lên tiến độ!');
    }

    this.progressRepository.merge(progress, progressDto);

    await this.progressRepository.save(progress);
  }

  async deleteProgress(id: number): Promise<void> {
    const queryBuilder = this.progressRepository
      .createQueryBuilder('progress')
      .where('progress.id = :id', { id });

    const progress = await queryBuilder.getOne();

    if (!progress) {
      throw new NotFoundException('Tiến độ không tồn tại');
    }

    await this.progressRepository.remove(progress);
  }

  getProgressStartToday() {
    const today = moment();
    today.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    return this.progressRepository
      .createQueryBuilder('progress')
      .where('progress.start BETWEEN :start AND :end', {
        start: today.subtract(1, 'second').toISOString(),
        end: today.add(1, 'day').toISOString(),
      })
      .getMany();
  }
}
