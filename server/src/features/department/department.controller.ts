import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../common/decorators';
import { DepartmentService } from './department.service';
import { DepartmentDto, DepartmentRequestDto } from './dtos';
import { Role } from '../../common/constants';
import { UserEntity } from '../user/models';

@Controller('department')
@ApiTags('Khoa')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách khoa',
    type: DepartmentDto,
  })
  async getDepartments(): Promise<DepartmentDto[]> {
    return this.departmentService.getDepartments();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: DepartmentDto, description: 'Thêm mới khoa' })
  async createDepartment(
    @Body() request: DepartmentRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<DepartmentDto> {
    return this.departmentService.createDepartment(request, currentUser);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: DepartmentDto, description: 'Cập nhật khoa' })
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: DepartmentRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.departmentService.updateDepartment(id, request, currentUser);
  }

  @Get(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin khoa',
    type: DepartmentDto,
  })
  async getDepartment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DepartmentDto> {
    return this.departmentService.getDepartment(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteDepartment(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.departmentService.deleteDepartment(id, currentUser);
  }
}
