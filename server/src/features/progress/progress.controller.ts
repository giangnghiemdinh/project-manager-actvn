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
import { Auth } from '../../common/decorators';
import { Role } from '../../common/constants';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../common/dtos';
import { ProgressService } from './progress.service';
import {
  ProgressDto,
  ProgressPagePayloadDto,
  ProgressPayloadDto,
} from './dtos';

@Controller('progress')
@ApiTags('Tiến độ')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: ProgressDto, description: 'Thêm mới tiến độ' })
  async createProgress(
    @Body() progressDto: ProgressPayloadDto,
  ): Promise<ProgressDto> {
    return this.progressService.createProgress(progressDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: ProgressDto, description: 'Cập nhật tiến độ' })
  async updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() progressDto: ProgressPayloadDto,
  ): Promise<void> {
    return this.progressService.updateProgress(id, progressDto);
  }

  @Get()
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách tiến độ',
    type: Pagination,
  })
  async getProgresses(
    @Query()
    pageOptionsDto: ProgressPagePayloadDto,
  ): Promise<Pagination<ProgressDto>> {
    return this.progressService.getProgresses(pageOptionsDto);
  }

  @Get(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin tiến độ',
    type: ProgressDto,
  })
  async getProgress(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProgressDto> {
    return this.progressService.getProgress(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteProgress(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.progressService.deleteProgress(id);
  }
}
