import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEventEntity } from '../models';
import { Repository } from 'typeorm';
import { PaginationMetaDto } from '../../../common/dtos';
import {
  UserEventPageRequestDto,
  UserEventPageResponseDto,
} from '../dtos/user-event-page.dto';

@Injectable()
export class UserEventService {
  private readonly logger = new Logger(UserEventService.name);

  constructor(
    @InjectRepository(UserEventEntity)
    private userEventRepository: Repository<UserEventEntity>, // @Inject(REQUEST) private readonly request: Request,
  ) {}

  async findAll(userId: number, pageOptionsDto: UserEventPageRequestDto) {
    const queryBuilder = this.userEventRepository
      .createQueryBuilder('userEvent')
      .where('userEvent.userId = :id', { id: userId })
      .orderBy('userEvent.createdAt', pageOptionsDto.order)
      .select(['userEvent.createdAt', 'userEvent.message', 'userEvent.params'])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });

    return new UserEventPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  insert(event: { message: string; params: string; userId: number }) {
    const userEvent = this.userEventRepository.create({ ...event });
    return this.userEventRepository.insert(userEvent);
  }
}
