import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotAcceptableException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './services';
import {
  UserChange2faRequestDto,
  UserChangeEmailRequestDto,
  UserChangeStatusRequestDto,
  UserDto,
  UserImportRequestDto,
  UserPageRequestDto,
  UserRequestDto,
  UserSessionDto,
  UserVerifyEmailRequestDto,
} from './dtos';
import { Auth, AuthUser, ReqExtra } from '../../common/decorators';
import { UserEntity } from './models';
import { Pagination } from '../../common/dtos';
import { Role } from '../../common/constants';
import { UserChangePasswordRequestDto } from './dtos/user-change-password.dto';
import { UserSessionPageRequestDto } from './dtos/user-session-page.dto';
import { UserEventPageRequestDto } from './dtos/user-event-page.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('user')
@ApiTags('Người dùng')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: 'Lấy thông tin tài khoản' })
  @Auth()
  @SkipThrottle()
  async getProfile(@AuthUser() currentUser: UserEntity): Promise<UserDto> {
    return this.userService.getUser(currentUser.id);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Lấy mã xác thực thay đổi email' })
  @Auth()
  async verifyEmail(
    @Body() request: UserVerifyEmailRequestDto,
    @AuthUser() currentUser: UserEntity,
    @ReqExtra() reqExtra: { deviceName: string },
  ): Promise<void> {
    request.deviceName = reqExtra.deviceName;
    await this.userService.verifyEmail(request, currentUser);
  }

  @Post('change-email')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Thay đổi email' })
  @Auth()
  async changeEmail(
    @Body() request: UserChangeEmailRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.userService.changeEmail(request, currentUser);
  }

  @Post('change-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UserDto,
    description: 'Thay đổi phương thức xác thực',
  })
  @Auth()
  async change2FA(
    @Body() request: UserChange2faRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.userService.change2FA(request, currentUser);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UserDto,
    description: 'Thay đổi mật khẩu',
  })
  @Auth()
  async changePassword(
    @Body() request: UserChangePasswordRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.userService.changePassword(request, currentUser);
  }

  @Post('change-status')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UserDto,
    description: 'Thay đổi trạng thái người dùng',
  })
  @Auth(Role.ADMINISTRATOR)
  async changeStatus(
    @Body() request: UserChangeStatusRequestDto,
  ): Promise<void> {
    await this.userService.changeStatus(request);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: UserDto,
    description: 'Cập nhật thông tin',
  })
  @Auth()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatarFile', maxCount: 1 }], {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|png|jpeg)$/)) cb(null, true);
        else {
          cb(new NotAcceptableException('Vui lòng đính kèm hình ảnh!'), false);
        }
      },
      limits: { fileSize: 5242880 },
    }),
  ) // Max 5MB
  async updateProfile(
    @UploadedFiles() files: { avatarFile },
    @Body() request: UserRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<UserDto> {
    files?.avatarFile &&
      files.avatarFile.length &&
      (request.avatarFile = files.avatarFile[0]);
    return this.userService.updateUser(currentUser.id, request, currentUser);
  }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Lấy danh sách người dùng',
    type: Pagination,
  })
  getUsers(
    @Query()
    pageOptionsDto: UserPageRequestDto,
  ): Promise<Pagination<UserDto>> {
    return this.userService.getUsers(pageOptionsDto);
  }

  @Get('events')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Lấy danh sách lịch sử hoạt động',
    type: Pagination,
  })
  getEvents(
    @Query() pageOptionsDto: UserEventPageRequestDto,
    @AuthUser() currentUser: UserEntity,
  ) {
    const userId =
      pageOptionsDto.userId && currentUser.role === Role.ADMINISTRATOR
        ? pageOptionsDto.userId
        : currentUser.id;
    return this.userService.getEvents(userId, pageOptionsDto);
  }

  @Get('sessions')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Lấy danh sách phiên hoạt động',
    type: Pagination,
  })
  getSessions(
    @Query() pageOptionsDto: UserSessionPageRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<Pagination<UserSessionDto>> {
    const userId =
      pageOptionsDto.userId && currentUser.role === Role.ADMINISTRATOR
        ? pageOptionsDto.userId
        : currentUser.id;
    return this.userService.getSessions(userId, pageOptionsDto);
  }

  @Get(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy thông tin người dùng',
    type: UserDto,
  })
  getUser(@Param('id', ParseIntPipe) userId: number): Promise<UserDto> {
    return this.userService.getUser(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: UserDto, description: 'Thêm mới người dùng' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatarFile', maxCount: 1 }], {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|png|jpeg)$/)) cb(null, true);
        else {
          cb(new NotAcceptableException('Vui lòng đính kèm hình ảnh!'), false);
        }
      },
      limits: { fileSize: 5242880 },
    }),
  ) // Max 5MB
  async createUser(
    @UploadedFiles() files: { avatarFile },
    @Body() request: UserRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<UserDto> {
    files?.avatarFile &&
      files.avatarFile.length &&
      (request.avatarFile = files.avatarFile[0]);
    return this.userService.createUser(request, currentUser);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ description: 'Nhập danh sách người dùng' })
  async importUser(
    @Body() request: UserImportRequestDto,
    @AuthUser() currentUser: UserEntity,
  ) {
    return this.userService.importUser(request, currentUser);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: UserDto, description: 'Cập nhật người dùng' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatarFile', maxCount: 1 }], {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|png|jpeg)$/)) cb(null, true);
        else {
          cb(new NotAcceptableException('Vui lòng đính kèm hình ảnh!'), false);
        }
      },
      limits: { fileSize: 5242880 },
    }),
  ) // Max 5MB
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { avatarFile },
    @Body() request: UserRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<UserDto> {
    files?.avatarFile &&
      files.avatarFile.length &&
      (request.avatarFile = files.avatarFile[0]);
    return this.userService.updateUser(id, request, currentUser);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Delete('session/:id')
  @Auth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.userService.deleteSession(sessionId, currentUser);
  }
}
