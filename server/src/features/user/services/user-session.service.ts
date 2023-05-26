import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserSessionEntity } from '../models';
import { Repository } from 'typeorm';
import { UserSessionDto } from '../dtos';
import { hashToken, reverseString } from '../../../common/utilities';
import { Role } from '../../../common/constants';
import { ApiConfigService, CacheService } from '../../../shared/services';
import { PaginationMetaDto } from '../../../common/dtos';
import {
  UserSessionPageRequestDto,
  UserSessionPageResponseDto,
} from '../dtos/user-session-page.dto';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly userSessionRepository: Repository<UserSessionEntity>,
    private readonly cacheService: CacheService,
    private readonly configService: ApiConfigService,
  ) {}

  find(deviceId: string, userId: number) {
    return this.userSessionRepository.findOne({ where: { deviceId, userId } });
  }

  findAllByUser(userId: number) {
    return this.userSessionRepository.find({ where: { userId } });
  }

  async findAllByUserWithPagination(
    userId: number,
    pageOptionsDto: UserSessionPageRequestDto,
  ) {
    const queryBuilder = this.userSessionRepository
      .createQueryBuilder('userSession')
      .where('userSession.userId = :id', { id: userId })
      .orderBy('userSession.createdAt', pageOptionsDto.order)
      .select([
        'userSession.createdAt',
        'userSession.updatedAt',
        'userSession.deviceName',
        'userSession.deviceId',
        'userSession.ipAddress',
        'userSession.expired',
        'userSession.id',
      ])
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });

    return new UserSessionPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  async save(userSession: UserSessionDto) {
    userSession.refreshJwt = userSession.refreshJwt
      ? hashToken(reverseString(userSession.refreshJwt))
      : '';
    const {
      deviceId,
      userId,
      deviceName,
      ipAddress,
      refreshJwt,
      uid,
      expired,
      isTrusted,
    } = userSession;
    const currentSession = await this.userSessionRepository.findOne({
      where: { deviceId, userId },
    });
    return !currentSession
      ? this.userSessionRepository.insert({
          deviceId,
          deviceName,
          ipAddress,
          refreshJwt,
          expired,
          isTrusted,
          uid,
          userId,
        })
      : this.userSessionRepository.update(currentSession.id, {
          ipAddress,
          refreshJwt,
          expired,
          isTrusted,
          uid,
        });
  }

  async delete(id: number, user: UserEntity) {
    const queryBuilder = this.userSessionRepository
      .createQueryBuilder('userSession')
      .where('userSession.id = :id', { id });

    if (user.role === Role.ADMINISTRATOR) {
      queryBuilder.andWhere('userSession.userId = :userId', {
        userId: user.id,
      });
    }
    const session = await queryBuilder.getOne();
    if (!session) {
      throw new NotFoundException('Phiên đăng nhập không tồn tại!');
    }
    await this.cacheService.set(
      `Blocked_${session.uid}`,
      true,
      this.configService.authConfig.refreshExpirationTime * 1000,
    );
    return this.userSessionRepository.remove(session);
  }
}
