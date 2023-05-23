import { Process, Processor } from '@nestjs/bull';
import { DRIVER_QUEUE, PROJECT_FOLDER_PROCESS } from '../common/constants';
import { Job } from 'bull';
import { ProjectService } from '../features/project/project.service';
import { DriverService } from '../shared/services';
import { Logger } from '@nestjs/common';

@Processor(DRIVER_QUEUE)
export class DriverConsumer {
  private readonly logger = new Logger(DriverConsumer.name);

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
}
