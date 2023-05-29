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
import { SemesterService } from './semester.service';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../../common/decorators';
import { Role } from '../../common/constants';
import { SemesterDto, SemesterRequestDto } from './dtos';
import { UserEntity } from '../user/models';

@Controller('semester')
@ApiTags('Học kỳ')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: SemesterDto, description: 'Thêm mới học kỳ' })
  async createSemester(
    @Body() request: SemesterRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<SemesterDto> {
    return this.semesterService.createSemester(request, currentUser);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: SemesterDto, description: 'Cập nhật học kỳ' })
  async updateSemester(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: SemesterRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.semesterService.updateSemester(id, request, currentUser);
  }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách học kỳ',
  })
  async getSemesters(): Promise<SemesterDto[]> {
    return this.semesterService.getSemesters();
  }

  @Get(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin học kỳ',
    type: SemesterDto,
  })
  async getSemester(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SemesterDto> {
    return this.semesterService.getSemester(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteSemester(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.semesterService.deleteSemester(id, currentUser);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ description: 'Khoá học kỳ' })
  async lockSemester(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.semesterService.lockSemester(id, currentUser);
  }
}
