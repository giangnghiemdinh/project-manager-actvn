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
import { ReviewerStaffService } from './reviewer-staff.service';
import {
  ReviewerPageRequestDto,
  ReviewerRequestDto,
  ReviewerStaffDto,
} from './dtos';
import { UserEntity } from '../user/models';

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
    @Body() reviewerStaffDto: ReviewerRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ReviewerStaffDto> {
    return this.reviewerStaffService.createReviewerStaff(
      reviewerStaffDto,
      currentUser,
    );
  }

  @Post('/multiple')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({
    description: 'Thêm danh sách hội đồng quản lý',
  })
  async createMultipleReviewerStaff(
    @Body(new ParseArrayPipe({ items: ReviewerRequestDto }))
    reviewerStaffDtos: ReviewerRequestDto[],
    @AuthUser() currentUser: UserEntity,
  ): Promise<ReviewerStaffDto[]> {
    return this.reviewerStaffService.createMultipleReviewerStaff(
      reviewerStaffDtos,
      currentUser,
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
    @Body() reviewerStaffDto: ReviewerRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    return this.reviewerStaffService.updateReviewerStaff(
      id,
      reviewerStaffDto,
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
  async getReviewerStaffs(
    @Query()
    pageOptionsDto: ReviewerPageRequestDto,
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
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.reviewerStaffService.deleteReviewerStaff(id, currentUser);
  }
}
