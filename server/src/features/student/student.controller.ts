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
import { StudentDto, StudentPagePayloadDto, StudentPayloadDto } from './dtos';
import { Auth } from '../../common/decorators';
import { Role } from '../../common/constants';
import { Pagination } from '../../common/dtos';

@Controller('student')
@ApiTags('Sinh viên')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: StudentDto, description: 'Thêm sinh viên' })
  async createStudent(
    @Body() studentDto: StudentPayloadDto,
  ): Promise<StudentDto> {
    return this.studentService.createStudent(studentDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: StudentDto, description: 'Cập nhật sinh viên' })
  async updateStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() studentDto: StudentPayloadDto,
  ): Promise<void> {
    return this.studentService.updateStudent(id, studentDto);
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
    pageOptionsDto: StudentPagePayloadDto,
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
}
