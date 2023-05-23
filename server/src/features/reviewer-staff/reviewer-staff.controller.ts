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
import { Auth } from '../../common/decorators';
import { Role } from '../../common/constants';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../common/dtos';
import { ReviewerStaffService } from './reviewer-staff.service';
import {
  ReviewerPagePayloadDto,
  ReviewerPayloadDto,
  ReviewerStaffDto,
} from './dtos';

@Controller('reviewer-staff')
@ApiTags('Cán bộ phản biện')
export class ReviewerStaffController {
  constructor(private readonly reviewerStaffService: ReviewerStaffService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    type: ReviewerStaffDto,
    description: 'Thêm hội đồng quản lý',
  })
  async createReviewerStaff(
    @Body() reviewerStaffDto: ReviewerPayloadDto,
  ): Promise<ReviewerStaffDto> {
    return this.reviewerStaffService.createReviewerStaff(reviewerStaffDto);
  }

  @Post('/multiple')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    description: 'Thêm danh sách hội đồng quản lý',
  })
  async createMultipleReviewerStaff(
    @Body(new ParseArrayPipe({ items: ReviewerPayloadDto }))
    reviewerStaffDtos: ReviewerPayloadDto[],
  ): Promise<ReviewerStaffDto[]> {
    return this.reviewerStaffService.createMultipleReviewerStaff(
      reviewerStaffDtos,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    type: ReviewerStaffDto,
    description: 'Cập nhật hội đồng quản lý',
  })
  async updateReviewerStaff(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewerStaffDto: ReviewerPayloadDto,
  ): Promise<void> {
    return this.reviewerStaffService.updateReviewerStaff(id, reviewerStaffDto);
  }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách hội đồng quản lý',
    type: Pagination,
  })
  async getReviewerStaffs(
    @Query()
    pageOptionsDto: ReviewerPagePayloadDto,
  ): Promise<Pagination<ReviewerStaffDto>> {
    return this.reviewerStaffService.getReviewerStaffs(pageOptionsDto);
  }

  @Get(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin hội đồng quản lý',
    type: ReviewerStaffDto,
  })
  async getReviewerStaff(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewerStaffDto> {
    return this.reviewerStaffService.getReviewerStaff(id);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteReviewerStaff(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.reviewerStaffService.deleteReviewerStaff(id);
  }
}
