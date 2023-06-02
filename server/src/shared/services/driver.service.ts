import { Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from './api-config.service';
import { drive_v3, google } from 'googleapis';
import * as stream from 'stream';

@Injectable()
export class DriverService {
  private readonly logger = new Logger(DriverService.name);

  driver: drive_v3.Drive;

  constructor(private readonly apiConfigService: ApiConfigService) {
    this.initialize();
  }

  get defaultFolderIds() {
    return this.apiConfigService.defaultFolderIds;
  }

  async uploadFile(fileObject: any, folderId: string, isPublic = true) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileObject.buffer);
      const { data } = await this.driver.files.create({
        media: {
          mimeType: fileObject.mimeType,
          body: bufferStream,
        },
        requestBody: {
          name: fileObject.originalname,
          parents: folderId ? [folderId] : [],
        },
        fields: 'id,name',
      });
      const { webViewLink, webContentLink } = await this.getFile(data.id);
      isPublic && (await this.setFilePublic(data.id));
      return { ...data, webViewLink, webContentLink };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  deleteFile(fileId: string) {
    return this.driver.files.delete({ fileId: fileId, fields: 'id,name' });
  }

  async getFile(fileId: string) {
    const { data } = await this.driver.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    return data;
  }

  async createFolder(folderName: string, parentId: string, isPublic = true) {
    try {
      const { data } = await this.driver.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : [],
        },
        fields: 'id, name',
      });
      isPublic && (await this.setFilePublic(data.id));
      return data;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async setFilePublic(fileId: string) {
    await this.driver.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  }

  private initialize() {
    const auth = new google.auth.OAuth2(this.apiConfigService.driverConfig);
    auth.setCredentials({
      refresh_token: this.apiConfigService.driverRefreshToken,
    });

    this.driver = google.drive({
      version: 'v3',
      auth,
    });
  }
}
