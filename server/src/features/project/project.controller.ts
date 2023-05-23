import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotAcceptableException,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Auth, AuthUser } from '../../common/decorators';
import { ProjectProgressType, Role } from '../../common/constants';
import { Pagination } from '../../common/dtos';
import {
  ProjectApprovePayloadDto,
  ProjectCouncilReviewRequestDto,
  ProjectDto,
  ProjectImportRequestDto,
  ProjectPagePayloadDto,
  ProjectPayloadDto,
} from './dtos';
import { UserEntity } from '../user/models';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProjectReviewRequestDto } from './dtos/project-review.dto';

@Controller('project')
@ApiTags('Đồ án')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách đồ án',
    type: Pagination,
  })
  async getProjects(
    @Query()
    pageOptionsDto: ProjectPagePayloadDto,
    @AuthUser() user: UserEntity,
  ): Promise<Pagination<ProjectDto>> {
    return this.projectService.getProjects(pageOptionsDto, user);
  }

  @Get(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thông tin đồ án',
    type: ProjectDto,
  })
  async getProject(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: { extra: string },
  ): Promise<ProjectDto> {
    return this.projectService.getProject(id, query);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOkResponse({ type: ProjectDto, description: 'Thêm đồ án' })
  async createProject(
    @Body() projectDto: ProjectPayloadDto,
    @AuthUser() user: UserEntity,
  ): Promise<ProjectDto> {
    return this.projectService.createProject(projectDto, user);
  }

  @Post('/approve')
  @HttpCode(HttpStatus.OK)
  @Auth([Role.ADMINISTRATOR, Role.CENSOR])
  @ApiOkResponse({ type: ProjectDto, description: 'Phê duyệt đồ án' })
  async approveProject(
    @Body() projectApproveDto: ProjectApprovePayloadDto,
    @AuthUser() user: UserEntity,
  ): Promise<ProjectDto> {
    return this.projectService.approveProject(projectApproveDto, user);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: ProjectDto, description: 'Cập nhật đồ án' })
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() projectDto: ProjectPayloadDto,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    return this.projectService.updateProject(id, projectDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    await this.projectService.deleteProject(id, user);
  }

  @Post('import')
  @Auth(Role.ADMINISTRATOR)
  async importProject(
    @Body() request: ProjectImportRequestDto,
    @AuthUser() user: UserEntity,
  ): Promise<void> {
    await this.projectService.importProject(request, user);
  }

  @Get(':id/:type')
  @Auth()
  async getReport(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('type', new ParseEnumPipe(ProjectProgressType))
    type: ProjectProgressType,
  ) {
    return this.projectService.getReport(id, type);
  }

  @Post(':id/report')
  @Auth()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'wordFile', maxCount: 1 },
        { name: 'reportFile', maxCount: 1 },
        { name: 'otherFile', maxCount: 1 },
      ],
      {
        fileFilter: (req, file, cb) => {
          if (file.originalname.match(/^.*\.(zip|rar|doc|docx|pdf)$/))
            cb(null, true);
          else {
            cb(
              new NotAcceptableException(
                'Vui lòng đính kèm file word hoặc pdf!',
              ),
              false,
            );
          }
        },
        limits: { fileSize: 10485760 },
      },
    ),
  ) // Max 10MB
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Cập nhật báo cáo tiến độ' })
  async report(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { wordFile; reportFile; otherFile },
    @Body() request: { type: ProjectProgressType },
    @AuthUser() user: UserEntity,
  ) {
    return this.projectService.report(id, request, files, user);
  }

  @Post(':id/review')
  @Auth()
  async reviewProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ProjectReviewRequestDto,
    @AuthUser() user: UserEntity,
  ) {
    return this.projectService.review(id, request, user);
  }

  @Post(':id/council-review')
  @Auth()
  async councilReviewProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ProjectCouncilReviewRequestDto,
    @AuthUser() user: UserEntity,
  ) {
    return this.projectService.councilReview(id, request, user);
  }
}
