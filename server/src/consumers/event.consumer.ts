import { Process, Processor } from '@nestjs/bull';
import { CREATE_EVENT_PROCESS, EVENT_QUEUE } from '../common/constants';
import { Logger } from '@nestjs/common';
import { UserEventService } from '../features/user/services';
import { Job } from 'bull';
import { ProjectService } from '../features/project/project.service';
import { ManagerStaffService } from '../features/manager-staff/manager-staff.service';
import { ReviewerStaffService } from '../features/reviewer-staff/reviewer-staff.service';
import { ExaminerCouncilService } from '../features/examiner-council/examiner-council.service';

@Processor(EVENT_QUEUE)
export class EventConsumer {
  private readonly logger = new Logger(EventConsumer.name);

  constructor(
    private readonly userEventService: UserEventService,
    private readonly projectService: ProjectService,
    private readonly managerStaffService: ManagerStaffService,
    private readonly reviewerStaffService: ReviewerStaffService,
    private readonly examinerCouncilService: ExaminerCouncilService,
  ) {}

  @Process(CREATE_EVENT_PROCESS)
  async createEvent(job: Job<any>) {
    const { message, params, userId, shouldLoad } = job.data;
    switch (true) {
      case shouldLoad !== false && 'projectId' in params:
        const project = await this.projectService.getProject(
          params['projectId'],
        );
        await this.userEventService.insert({
          message: `${message} | ${project.semester?.name} | ${project.department?.name}`,
          params: JSON.stringify(params),
          userId,
        });
        break;
      case 'managerId' in params:
        const managerStaff = await this.managerStaffService.getManagerStaff(
          params['managerId'],
        );
        await this.userEventService.insert({
          message: `${message} | ${managerStaff.semester?.name} | ${managerStaff.department?.name}`,
          params: JSON.stringify({
            ...params,
            managerFullName: managerStaff.user?.fullName,
            semesterId: managerStaff?.semesterId,
          }),
          userId,
        });
        break;
      case 'reviewerId' in params:
        const reviewerStaff = await this.reviewerStaffService.getReviewerStaff(
          params['reviewerId'],
        );
        await this.userEventService.insert({
          message: `${message} | ${reviewerStaff.semester?.name} | ${reviewerStaff.department?.name}`,
          params: JSON.stringify({
            ...params,
            reviewerFullName: reviewerStaff.user?.fullName,
            semesterId: reviewerStaff?.semesterId,
          }),
          userId,
        });
        break;
      case 'councilId' in params:
        const examinerCouncil =
          await this.examinerCouncilService.getExaminerCouncil(
            params['councilId'],
          );
        await this.userEventService.insert({
          message: `${message} | ${examinerCouncil.semester?.name} | ${examinerCouncil.department?.name}`,
          params: JSON.stringify({
            ...params,
            semesterId: examinerCouncil?.semesterId,
          }),
          userId,
        });
        break;
      default:
        await this.normalInsert(message, params, userId);
    }
    this.logger.log(`Đã ghi nhật ký | ${message} | ${userId}`);
  }

  private normalInsert(
    message: string,
    params: { [key: string]: string | number },
    userId: number,
  ) {
    return this.userEventService.insert({
      message,
      params: JSON.stringify(params),
      userId,
    });
  }
}
