import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserChange2faRequestDto,
  UserChangeEmailRequestDto,
  UserChangeStatusRequestDto,
  UserDto,
  UserImportRequestDto,
  UserPageRequestDto,
  UserPageResponseDto,
  UserRequestDto,
  UserVerifyEmailRequestDto,
} from '../dtos';
import { Pagination, PaginationMetaDto } from '../../../common/dtos';
import { UserEntity, UserSessionEntity } from '../models';
import { Transactional } from 'typeorm-transactional';
import {
  ApiConfigService,
  CacheService,
  DriverService,
  EmailQueueService,
  OtpService,
} from '../../../shared/services';
import {
  EMAIL_CRE_PROCESS,
  Role,
  USER_DUPLICATE_EMAIL,
  UserStatus,
  VERIFY_EMAIL_PROCESS,
} from '../../../common/constants';
import moment from 'moment/moment';
import { OtpInvalidException } from '../../../common/exceptions';
import { UserSessionService } from './user-session.service';
import { UserChangePasswordRequestDto } from '../dtos/user-change-password.dto';
import {
  generateHash,
  randomString,
  validateHash,
} from '../../../common/utilities';
import { UserEventService } from './user-event.service';
import {
  UserEventPageRequestDto,
  UserEventPageResponseDto,
} from '../dtos/user-event-page.dto';
import {
  UserSessionPageRequestDto,
  UserSessionPageResponseDto,
} from '../dtos/user-session-page.dto';
import { isUndefined } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userSessionService: UserSessionService,
    private readonly userEventService: UserEventService,
    private readonly otpService: OtpService,
    private readonly cacheService: CacheService,
    private readonly configService: ApiConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly driverService: DriverService,
  ) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async getUsers(
    pageOptionsDto: UserPageRequestDto,
  ): Promise<Pagination<UserDto>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.createdAt',
        'user.email',
        'user.phone',
        'user.avatar',
        'user.workPlace',
        'user.isActive',
        'user.lastLogin',
        'user.role',
      ]);

    if (pageOptionsDto.q) {
      queryBuilder.where(
        'UCASE(user.fullName) LIKE :q ' +
          'OR UCASE(user.email) LIKE :q ' +
          'OR UCASE(user.phone) LIKE :q ' +
          'OR UCASE(user.workPlace) LIKE :q',
        { q: `%${pageOptionsDto.q.toUpperCase()}%` },
      );
    }

    if (pageOptionsDto.role) {
      queryBuilder.andWhere('user.role = :role', {
        role: pageOptionsDto.role,
      });
    }

    if (!isUndefined(pageOptionsDto.isActive)) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: pageOptionsDto.isActive,
      });
    }

    if (pageOptionsDto.extra) {
      const extras = pageOptionsDto.extra.split('&');
      if (extras.includes('p')) {
        queryBuilder
          .leftJoin('user.projects', 'projects')
          .addSelect(['projects.semesterId']);
      }
    }

    queryBuilder
      .orderBy('user.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PaginationMetaDto({ itemCount, pageOptionsDto });

    this.logger.log(`Lấy danh sách người dùng`);
    return new UserPageResponseDto(
      entities.map((e) => e.toDto()),
      pageMetaDto,
    );
  }

  async getUser(userId: number): Promise<UserDto> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    return user.toDto();
  }

  getEvents(
    userId: number,
    pageOptionsDto: UserEventPageRequestDto,
  ): Promise<UserEventPageResponseDto> {
    return this.userEventService.findAll(userId, pageOptionsDto);
  }

  getSessions(
    userId: number,
    pageOptionsDto: UserSessionPageRequestDto,
  ): Promise<UserSessionPageResponseDto> {
    return this.userSessionService.findAllByUserWithPagination(
      userId,
      pageOptionsDto,
    );
  }

  async createUser(
    request: UserRequestDto,
    currentUser?: UserEntity,
  ): Promise<UserDto> {
    try {
      if (request.avatarFile) {
        const { id } = await this.driverService.uploadFile(
          request.avatarFile,
          this.configService.defaultFolderIds.avatars,
        );
        id && (request.avatar = id);
      }
    } catch (e) {
      throw new BadRequestException('Có lỗi xảy ra! Vui lòng thử lại sau.');
    }

    delete request.avatarFile;
    request.password = randomString(8);

    const user = this.userRepository.create(request);
    await this.userRepository.insert(user);
    currentUser &&
      (await this.userEventService.insert({
        message: `Thêm mới người dùng {userFullName}`,
        params: JSON.stringify({
          userFullName: user.fullName,
          userId: user.id,
        }),
        userId: currentUser.id,
      }));

    if (this.configService.isEmailCreNotification) {
      await this.emailQueueService.add(
        EMAIL_CRE_PROCESS,
        {
          email: request.email,
          password: request.password,
        },
        { removeOnComplete: true },
      );
    }

    return user.toDto();
  }

  @Transactional()
  async importUser(
    request: UserImportRequestDto,
    currentUser: UserEntity,
  ): Promise<void> {
    for (const user of request.users) {
      user.role = Role.LECTURER;
      const isExist = await this.userRepository.exist({
        where: { email: user.email },
      });
      if (!isExist) {
        await this.createUser(user, currentUser);
        continue;
      }
      switch (request.duplicateEmail) {
        case USER_DUPLICATE_EMAIL.STOP:
          throw new ConflictException(`Email ${user.email} đã tồn tại!`);
        default:
          await this.userRepository.update({ email: user.email }, { ...user });
      }
    }
  }

  async updateUser(
    id: number,
    request: UserRequestDto,
    currentUser: UserEntity,
  ) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }
    try {
      if (request.avatarFile) {
        if (request.avatar) {
          // Remove old file
          await this.driverService.deleteFile(request.avatar);
        }
        const { id } = await this.driverService.uploadFile(
          request.avatarFile,
          this.configService.defaultFolderIds.avatars,
        );
        id && (request.avatar = id);
      }
      if (!request.avatar && user.avatar) {
        // Remove old file
        await this.driverService.deleteFile(user.avatar);
      }
    } catch (e) {
      throw new BadRequestException('Có lỗi xảy ra! Vui lòng thử lại sau.');
    }
    delete request.avatarFile;
    await this.userRepository.update({ id }, request);
    this.userRepository.merge(user, request);
    if (user.id !== currentUser.id) {
      await this.userEventService.insert({
        message: `Cập nhật người dùng {userFullName}`,
        params: JSON.stringify({
          userFullName: user.fullName,
          userId: user.id,
        }),
        userId: currentUser.id,
      });
    }
    return user.toDto();
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }
    await this.userRepository.remove(user);
  }

  async verifyEmail(
    request: UserVerifyEmailRequestDto,
    currentUser: UserEntity,
  ) {
    if (request.email === currentUser.email) {
      throw new ConflictException(
        'Địa chỉ email mới phải khác email đang sử dụng!',
      );
    }
    const userExist = await this.findByEmail(request.email);
    if (!!userExist) {
      throw new ConflictException('Địa chỉ email đã tồn tại!');
    }
    const otp = await this.otpService.generateVerifyEmailOtp(request.email);
    await this.emailQueueService.add(
      VERIFY_EMAIL_PROCESS,
      {
        otp,
        email: request.email,
        requestDate: moment().format('DD/MM/YYYY HH:mm'),
        deviceName: request.deviceName,
      },
      { removeOnComplete: true },
    );
  }

  async changeEmail(
    request: UserChangeEmailRequestDto,
    currentUser: UserEntity,
  ) {
    const isValid = await this.otpService.verifyChangeEmailOtp(
      request.email,
      request.otp,
    );
    if (!isValid) {
      throw new OtpInvalidException();
    }
    await this.userRepository.update(
      { id: currentUser.id },
      { email: request.email },
    );
    await this.userEventService.insert({
      message: `Cập nhật email {userEmail}`,
      params: JSON.stringify({
        userEmail: request.email,
        userId: currentUser.id,
      }),
      userId: currentUser.id,
    });
    await this.logoutAllSections(currentUser.id);
  }

  async change2FA(request: UserChange2faRequestDto, currentUser: UserEntity) {
    await this.userRepository.update(
      { id: currentUser.id },
      { twoFactory: request.twoFactory },
    );
    await this.logoutAllSections(currentUser.id);
  }

  async changePassword(
    request: UserChangePasswordRequestDto,
    currentUser: UserEntity,
  ) {
    if (request.oldPassword) {
      const isPasswordMatch = await validateHash(
        request.oldPassword,
        currentUser.password,
      );
      if (!isPasswordMatch) {
        throw new BadRequestException('Mật khẩu cũ không chính xác!');
      }
    }
    await this.updatePassword(currentUser.id, request.password);
    await this.logoutAllSections(currentUser.id);
  }

  async changeStatus(request: UserChangeStatusRequestDto) {
    const user = await this.findById(request.id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }
    const isActive = request.status === UserStatus.ACTIVE;
    await this.userRepository.update({ id: user.id }, { isActive });
    await this.logoutAllSections(user.id);
  }

  async updateSecret(id: number, secret: string): Promise<void> {
    await this.userRepository.update({ id }, { optSecret: secret });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    await this.userRepository.update(
      { id },
      { password: await generateHash(password) },
    );
  }

  async updateLastLogin(id: number) {
    await this.userRepository.update({ id }, { lastLogin: new Date() });
  }

  async deleteSession(id: number, currentUser: UserEntity) {
    await this.userSessionService.delete(id, currentUser);
  }

  private async logoutAllSections(userId: number) {
    const sessions: UserSessionEntity[] =
      await this.userSessionService.findAllByUser(userId);
    for (const session of sessions) {
      await this.cacheService.set(
        `Blocked_${session.uid}`,
        true,
        this.configService.authConfig.refreshExpirationTime * 1000,
      );
      session.expired = new Date();
      session.refreshJwt = '';
      session.uid = '';
      session.isTrusted = false;
      await this.userSessionService.save(session);
    }
  }
}
