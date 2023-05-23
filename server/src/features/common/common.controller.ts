import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiAcceptedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommonService } from './common.service';
import { DriverService } from '../../shared/services';
import { FolderPayload } from './dtos';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from '../../common/decorators';

@Controller('common')
@ApiTags('Chung')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly googleDriverService: DriverService,
  ) {}

  @Post('folder')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @ApiOkResponse({
    description: 'Tạo folder',
  })
  async createFolder(@Body() folder: FolderPayload) {
    return this.googleDriverService.createFolder(
      folder.name,
      folder.parentId,
      folder.isPublic,
    );
  }

  @Post('file')
  @Auth()
  @UseInterceptors(
    FilesInterceptor('file', 10, { limits: { fileSize: 5242880 } }),
  ) // Max 5MB
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Tải file' })
  async uploadFile(
    @UploadedFiles() files,
    @Body() fileExts: { folderId: string },
  ) {
    try {
      const uploadedFiles = [];
      for (const file of files) {
        const data = await this.googleDriverService.uploadFile(
          file,
          fileExts.folderId,
        );
        uploadedFiles.push(data);
      }
      return uploadedFiles;
    } catch (e) {
      throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('file/:id')
  @Auth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async downloadFile(@Param('id') id: string) {
    return this.googleDriverService.getFile(id);
  }

  @Delete('file/:fileId')
  @Auth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse()
  async deleteProgress(@Param('fileId') fileId: string): Promise<void> {
    if (!fileId) {
      return;
    }
    await this.googleDriverService.deleteFile(fileId);
  }
}
