import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth, AuthUser } from '../../common/decorators';
import { Role } from '../../common/constants';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../common/dtos';
import { ManagerStaffService } from './manager-staff.service';
import {
  ManagerPageRequestDto,
  ManagerRequestDto,
  ManagerStaffDto,
} from './dtos';
import { UserEntity } from '../user/models';

@Controller('manager-staff')
@ApiTags('Cán bộ quản lý')
export class ManagerStaffController {
  constructor(private readonly managerStaffService: ManagerStaffService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    type: ManagerStaffDto,
    description: 'Thêm hội đồng quản lý',
  })
  async createManagerStaff(
    @Body() managerStaffDto: ManagerRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ManagerStaffDto> {
    return this.managerStaffService.createManagerStaff(
      managerStaffDto,
      currentUser,
    );
  }

  @Post('/multiple')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    description: 'Thêm danh sách hội đồng quản lý',
  })
  async createMultipleManagerStaff(
    @Body(new ParseArrayPipe({ items: ManagerRequestDto }))
    managerStaffDtos: ManagerRequestDto[],
    @AuthUser() currentUser: UserEntity,
  ): Promise<ManagerStaffDto[]> {
    return this.managerStaffService.createMultipleManagerStaff(
      managerStaffDtos,
      currentUser,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    type: ManagerStaffDto,
    description: 'Cập nhật hội đồng quản lý',
  })
  async updateManagerStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() managerStaffDto: ManagerRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.managerStaffService.updateManagerStaff(
      id,
      managerStaffDto,
      currentUser,
    );
  }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách hội đồng quản lý',
    type: Pagination,
  })
  async getManagerStaffs(
    @Query()
    pageOptionsDto: ManagerPageRequestDto,
  ): Promise<Pagination<ManagerStaffDto>> {
    return this.managerStaffService.getManagerStaffs(pageOptionsDto);
  }

  @Get(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin hội đồng quản lý',
    type: ManagerStaffDto,
  })
  async getManagerStaff(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ManagerStaffDto> {
    return this.managerStaffService.getManagerStaff(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteManagerStaff(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.managerStaffService.deleteManagerStaff(id, currentUser);
  }
}
