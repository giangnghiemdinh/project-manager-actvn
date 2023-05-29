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
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ExaminerCouncilService } from './examiner-council.service';
import { Role } from '../../common/constants';
import { Auth, AuthUser } from '../../common/decorators';
import {
  ExaminerCouncilDto,
  ExaminerPageRequestDto,
  ExaminerRequestDto,
} from './dtos';
import { Pagination } from '../../common/dtos';
import { UserEntity } from '../user/models';

@Controller('examiner-council')
@ApiTags('Hội đồng bảo vệ')
export class ExaminerCouncilController {
  constructor(
    private readonly examinerCouncilService: ExaminerCouncilService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    type: ExaminerCouncilDto,
    description: 'Thêm hội đồng bảo vệ',
  })
  async createExaminerCouncil(
    @Body() examinerCouncilDto: ExaminerRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ExaminerCouncilDto> {
    return this.examinerCouncilService.createExaminerCouncil(
      examinerCouncilDto,
      currentUser,
    );
  }

  @Post('/multiple')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    description: 'Thêm danh sách hội đồng bảo vệ',
  })
  async createMultipleExaminerCouncil(
    @Body(new ParseArrayPipe({ items: ExaminerRequestDto }))
    examinerCouncilDto: ExaminerRequestDto[],
    @AuthUser() currentUser: UserEntity,
  ): Promise<ExaminerCouncilDto[]> {
    return this.examinerCouncilService.createMultipleExaminerCouncil(
      examinerCouncilDto,
      currentUser,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    type: ExaminerCouncilDto,
    description: 'Cập nhật hội đồng bảo vệ',
  })
  async updateExaminerCouncil(
    @Param('id', ParseIntPipe) id: number,
    @Body() examinerCouncilDto: ExaminerRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.examinerCouncilService.updateExaminerCouncil(
      id,
      examinerCouncilDto,
      currentUser,
    );
  }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách hội đồng bảo vệ',
    type: Pagination,
  })
  async getExaminerCouncils(
    @Query()
    pageOptionsDto: ExaminerPageRequestDto,
  ): Promise<Pagination<ExaminerCouncilDto>> {
    return this.examinerCouncilService.getExaminerCouncils(pageOptionsDto);
  }

  @Get(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin hội đồng bảo vệ',
    type: ExaminerCouncilDto,
  })
  async getExaminerCouncil(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExaminerCouncilDto> {
    return this.examinerCouncilService.getExaminerCouncil(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteExaminerCouncil(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.examinerCouncilService.deleteExaminerCouncil(id, currentUser);
  }
}
