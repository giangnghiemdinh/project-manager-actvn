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
import { Auth } from '../../common/decorators';
import { DepartmentService } from './department.service';
import { DepartmentDto, DepartmentPayloadDto } from './dtos';
import { Role } from '../../common/constants';

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
    @Body() departmentDto: DepartmentPayloadDto,
  ): Promise<DepartmentDto> {
    return this.departmentService.createDepartment(departmentDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: DepartmentDto, description: 'Cập nhật khoa' })
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() departmentDto: DepartmentPayloadDto,
  ): Promise<void> {
    return this.departmentService.updateDepartment(id, departmentDto);
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
  async deleteDepartment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.departmentService.deleteDepartment(id);
  }
}
