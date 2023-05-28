import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProjectService } from '../features/project/project.service';
import { DriverService } from '../shared/services';

@Injectable()
export class ProgressTaskService {
  private readonly logger = new Logger(ProgressTaskService.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly googleDriverService: DriverService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  /*
  1. Lấy ra học kỳ hiện tại
  2. Lấy ra tiến độ của học kỳ hiện tại
  3. Kiểm tra thời gian bắt đầu của các lần báo cáo
  4. Nếu là báo cáo tiến độ thì tạo folder
   */
  async triggerCronJob() {
    // const progresses = await this.progressService.getProgressStartToday();
    // if (!progresses.length) {
    //   return;
    // }
    // const currentSemester = progresses[0].semester;
    // const projects = await this.projectService.queryBuilder
    //   .where('project.semester = :semester', { semester: currentSemester })
    //   .andWhere('project.status IN (:...statuses)', {
    //     statuses: [ProjectStatus.IN_PROGRESS],
    //   })
    //   .andWhere('project.managerCouncil IS NOT NULL')
    //   .getMany();
    // for (const progress of progresses) {
    //   for (const project of projects) {
    //     const projectProgress = new ProjectProgressEntity();
    //     projectProgress.progress = progress;
    //     projectProgress.project = project;
    //     const folder = await this.googleDriverService.createFolder(
    //       progress.name,
    //       project.folderId,
    //     );
    //     projectProgress.folderId = folder.id;
    //     this.logger.log(
    //       `Auto create progress ${progress.name} for ${project.name} `,
    //     );
    //     this.projectService.createProgress(projectProgress);
    //   }
    // }
  }
}
