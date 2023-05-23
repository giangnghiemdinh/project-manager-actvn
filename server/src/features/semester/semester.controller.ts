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
import { Auth } from '../../common/decorators';
import { Role } from '../../common/constants';
import { SemesterDto, SemesterPayloadDto } from './dtos';

@Controller('semester')
@ApiTags('Học kỳ')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: SemesterDto, description: 'Thêm mới học kỳ' })
  async createSemester(
    @Body() roleDto: SemesterPayloadDto,
  ): Promise<SemesterDto> {
    return this.semesterService.createSemester(roleDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: SemesterDto, description: 'Cập nhật học kỳ' })
  async updateSemester(
    @Param('id', ParseIntPipe) id: number,
    @Body() roleDto: SemesterPayloadDto,
  ): Promise<void> {
    return this.semesterService.updateSemester(id, roleDto);
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
  async deleteSemester(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.semesterService.deleteSemester(id);
  }
}
