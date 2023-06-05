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
  OtpService,
  QueueService,
} from '../../../shared/services';
import {
  CREATE_EVENT_PROCESS,
  EMAIL_CRE_PROCESS,
  Role,
  RoleName,
  TokenType,
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
import { JwtService } from '@nestjs/jwt';

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
    private readonly driverService: DriverService,
    private readonly queueService: QueueService,
    private readonly jwtService: JwtService,
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
        'user.rank',
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
    currentUser: UserEntity,
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
    const isRandomPass = this.configService.isRandomPass;
    request.password = isRandomPass ? randomString(8) : '123456';

    const user = this.userRepository.create(request);
    await this.userRepository.insert(user);

    await this.queueService.addEvent(
      CREATE_EVENT_PROCESS,
      {
        message: `Thêm mới người dùng {userFullName}`,
        params: {
          userFullName: user.fullName,
          userId: user.id,
        },
        userId: currentUser.id,
      },
      1000,
    );

    if (isRandomPass) {
      const expireTime = this.configService.authConfig.changePassExpirationTime;
      const code = await this.jwtService.signAsync(
        {
          email: user.email,
          type: TokenType.FORGOT_PASSWORD,
        },
        { expiresIn: expireTime },
      );

      // Save this code to cache
      await this.cacheService.set(
        `Reset_Pass_${code}`,
        true,
        expireTime * 1000,
      );

      await this.queueService.addMail(EMAIL_CRE_PROCESS, {
        email: request.email,
        url: `${this.configService.webHost}/public/reset-password?code=${code}&email=${user.email}`,
      });
    }

    this.logger.log(
      `${currentUser.fullName} đã thêm mới người dùng ${user.id} | ${user.fullName}`,
    );

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
    await this.userRepository.update({ id }, { ...request });
    if (user.id !== currentUser.id) {
      const changedDesc: string[] = [];
      if (request.fullName != user.fullName) {
        changedDesc.push(
          `Họ và tên ${user.fullName} thành ${request.fullName}`,
        );
      }
      if (request.email != user.email) {
        changedDesc.push(`Email ${user.email} thành ${request.email}`);
      }
      if (request.role != user.role) {
        changedDesc.push(
          `Vai trò ${RoleName[user.role]} thành ${RoleName[request.role]}`,
        );
      }
      if (!changedDesc.length) {
        changedDesc.push('Thông tin');
      }
      await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
        message: `Cập nhật ${changedDesc.join(
          ', ',
        )} cho người dùng {userFullName}`,
        params: {
          userFullName: user.fullName,
          userId: user.id,
        },
        userId: currentUser.id,
      });
    }

    this.logger.log(
      `${currentUser.fullName} đã cập nhật thông tin người dùng ${user.id} | ${user.fullName}`,
    );

    this.userRepository.merge(user, request);

    return user.toDto();
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
    await this.queueService.addMail(VERIFY_EMAIL_PROCESS, {
      otp,
      email: request.email,
      requestDate: moment().format('DD/MM/YYYY HH:mm'),
      deviceName: request.deviceName,
    });
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

    this.logger.log(
      `${currentUser.fullName} đã thay đổi địa chỉ email thành ${request.email}`,
    );
    await this.logoutAllSections(currentUser.id);
  }

  async change2FA(request: UserChange2faRequestDto, currentUser: UserEntity) {
    await this.userRepository.update(
      { id: request.id },
      { twoFactory: request.twoFactory, optSecret: null },
    );

    this.logger.log(
      `${currentUser.fullName} đã thay đổi 2FA người dùng ${request.id} thành ${request.twoFactory}`,
    );
    await this.logoutAllSections(request.id);
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
    this.logger.log(`${currentUser.fullName} đã thay đổi mật khẩu`);
    await this.logoutAllSections(currentUser.id);
  }

  async changeStatus(
    request: UserChangeStatusRequestDto,
    currentUser: UserEntity,
  ) {
    const user = await this.findById(request.id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }
    const isActive = request.status === UserStatus.ACTIVE;
    await this.userRepository.update({ id: user.id }, { isActive });
    await this.queueService.addEvent(CREATE_EVENT_PROCESS, {
      message: `${isActive ? 'Kích hoạt' : 'Khoá'} người dùng {userFullName}`,
      params: {
        userFullName: user.fullName,
        userId: user.id,
      },
      userId: currentUser.id,
    });
    this.logger.log(
      `${currentUser.fullName} đã ${
        isActive ? 'kích hoạt' : 'khoá'
      } người dùng ${user.fullName}`,
    );
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
