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
import {
  ProjectProgressType,
  ProjectStatus,
  Role,
} from '../../common/constants';
import { Pagination } from '../../common/dtos';
import {
  ProjectApproveRequestDto,
  ProjectCouncilReviewRequestDto,
  ProjectDto,
  ProjectImportRequestDto,
  ProjectPageRequestDto,
  ProjectRequestDto,
  ProjectReviewRequestDto,
  ProjectStatisticalRequestDto,
  ProjectStatisticalResponseDto,
} from './dtos';
import { UserEntity } from '../user/models';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('project')
@ApiTags('Đồ án')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('statistical')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Thống kê',
  })
  async statistical(
    @Query()
    request: ProjectStatisticalRequestDto,
  ): Promise<ProjectStatisticalResponseDto> {
    return this.projectService.getStatistical(request);
  }

  // @Get('dump-review')
  // @Auth(Role.ADMINISTRATOR)
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   description: 'Dump',
  // })
  // async dumpInstr(
  //   @Query() query: { type: ProjectProgressType },
  //   @AuthUser() currentUser: UserEntity,
  // ): Promise<any> {
  //   await this.projectService.dumpReview(query.type, currentUser);
  // }
  //
  // @Get('dump-report')
  // @Auth(Role.ADMINISTRATOR)
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   description: 'Dump',
  // })
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'wordFile', maxCount: 1 },
  //       { name: 'reportFile', maxCount: 1 },
  //       { name: 'otherFile', maxCount: 1 },
  //     ],
  //     {
  //       fileFilter: (req, file, cb) => {
  //         if (file.originalname.match(/^.*\.(zip|rar|doc|docx|pdf)$/))
  //           cb(null, true);
  //         else {
  //           cb(
  //             new NotAcceptableException(
  //               'Vui lòng đính kèm file word hoặc pdf!',
  //             ),
  //             false,
  //           );
  //         }
  //       },
  //       limits: { fileSize: 10485760 },
  //     },
  //   ),
  // ) // Max 10MB
  // async dumpReport(
  //   @UploadedFiles() files: { wordFile; reportFile; otherFile },
  //   @Body() request: { type: ProjectProgressType },
  //   @AuthUser() currentUser: UserEntity,
  // ): Promise<any> {
  //   this.projectService.dumpReport(request.type, files, currentUser).then();
  // }

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Danh sách đồ án',
    type: Pagination,
  })
  async getProjects(
    @Query()
    pageOptionsDto: ProjectPageRequestDto,
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
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: ProjectDto, description: 'Thêm đồ án' })
  async createProject(
    @Body() request: ProjectRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ProjectDto> {
    request.status = request.students?.length
      ? ProjectStatus.IN_PROGRESS
      : ProjectStatus.PENDING;
    return this.projectService.createProject(request, currentUser);
  }

  @Post('/propose')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOkResponse({ type: ProjectDto, description: 'Đề xuất đồ án' })
  async createProposeProject(
    @Body() request: ProjectRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ProjectDto> {
    request.status = ProjectStatus.PROPOSE;
    return this.projectService.createProject(request, currentUser);
  }

  @Post('/approve')
  @HttpCode(HttpStatus.OK)
  @Auth([Role.ADMINISTRATOR, Role.CENSOR])
  @ApiOkResponse({ type: ProjectDto, description: 'Phê duyệt đồ án' })
  async approveProject(
    @Body() request: ProjectApproveRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<ProjectDto> {
    return this.projectService.approveProject(request, currentUser);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(Role.ADMINISTRATOR)
  @ApiOkResponse({ type: ProjectDto, description: 'Cập nhật đồ án' })
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ProjectRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    request.status = request.students?.length
      ? ProjectStatus.IN_PROGRESS
      : ProjectStatus.PENDING;
    return this.projectService.updateProject(id, request, currentUser);
  }

  @Delete(':id')
  @Auth(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.projectService.deleteProject(id, currentUser);
  }

  @Post('import')
  @Auth(Role.ADMINISTRATOR)
  async importProject(
    @Body() request: ProjectImportRequestDto,
    @AuthUser() currentUser: UserEntity,
  ): Promise<void> {
    await this.projectService.importProject(request, currentUser);
  }

  @Get(':id/:type')
  @Auth()
  async getReport(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('type', new ParseEnumPipe(ProjectProgressType))
    type: ProjectProgressType,
    @AuthUser() currentUser: UserEntity,
  ) {
    return this.projectService.getReport(id, type, currentUser);
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
    @AuthUser() currentUser: UserEntity,
  ) {
    return this.projectService.report(id, request, files, currentUser);
  }

  @Post(':id/review')
  @Auth()
  async reviewProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ProjectReviewRequestDto,
    @AuthUser() currentUser: UserEntity,
  ) {
    return this.projectService.review(id, request, currentUser);
  }

  @Post(':id/council-review')
  @Auth()
  async councilReviewProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ProjectCouncilReviewRequestDto,
    @AuthUser() currentUser: UserEntity,
  ) {
    return this.projectService.councilReview(id, request, currentUser);
  }
}
