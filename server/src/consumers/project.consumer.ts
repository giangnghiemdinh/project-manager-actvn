import { Process, Processor } from '@nestjs/bull';
import {
  PROJECT_FOLDER_PROCESS,
  PROJECT_QUEUE,
  PROJECT_STATUS_PROCESS,
} from '../common/constants';
import { Job } from 'bull';
import { ProjectService } from '../features/project/project.service';
import { DriverService } from '../shared/services';
import { Logger } from '@nestjs/common';

@Processor(PROJECT_QUEUE)
export class ProjectConsumer {
  private readonly logger = new Logger(ProjectConsumer.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly driverService: DriverService,
  ) {}

  @Process(PROJECT_FOLDER_PROCESS)
  async createProjectFolder(job: Job<any>) {
    const { id, folderName } = job.data;
    const project = await this.projectService.getProject(id);
    if (!project) {
      return;
    }
    const folder = await this.driverService.createFolder(
      folderName,
      this.driverService.defaultFolderIds.projects,
    );
    await this.projectService.updateFolderId(id, folder.id);
    this.logger.log(`Create folder ${folderName} success for project ${id}`);
  }

  @Process(PROJECT_STATUS_PROCESS)
  async updateProjectStatus(job: Job<any>) {
    const { id, status } = job.data;
    await this.projectService.updateStatus(id, status);
    this.logger.log(`Update status success for project ${id}`);
  }
}
