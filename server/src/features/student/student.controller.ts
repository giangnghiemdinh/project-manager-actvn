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
  Query,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { StudentService } from './student.service';
import {
  StudentDto,
  StudentImportRequestDto,
  StudentPageRequestDto,
  StudentRequestDto,
} from './dtos';
import { Auth, AuthUser } from '../../common/decorators';
import { Role } from '../../common/constants';
import { Pagination } from '../../common/dtos';
import { UserEntity } from '../user/models';

@Controller('student')
@ApiTags('Sinh viên')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: StudentDto, description: 'Thêm sinh viên' })
  async createStudent(@Body() request: StudentRequestDto): Promise<StudentDto> {
    return this.studentService.createStudent(request);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: StudentDto, description: 'Cập nhật sinh viên' })
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: StudentRequestDto,
  ): Promise<void> {
    return this.studentService.updateStudent(id, request);
  }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách sinh viên',
    type: Pagination,
  })
  async getStudents(
    @Query()
    pageOptionsDto: StudentPageRequestDto,
  ): Promise<Pagination<StudentDto>> {
    return this.studentService.getStudents(pageOptionsDto);
  }

  @Get(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin sinh viên',
    type: StudentDto,
  })
  async getStudent(@Param('id', ParseIntPipe) id: number): Promise<StudentDto> {
    return this.studentService.getStudent(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteStudent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.studentService.deleteStudent(id);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ description: 'Nhập danh sách sinh viên' })
  async importStudent(
    @Body() request: StudentImportRequestDto,
    @AuthUser() currentUser: UserEntity,
  ) {
    return this.studentService.importStudent(request, currentUser);
  }
}
