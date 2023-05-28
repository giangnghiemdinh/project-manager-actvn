import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  EMAIL_CRE_PROCESS,
  EMAIL_QUEUE,
  PROJECT_APPROVE_PROCESS,
  RESET_PASS_PROCESS,
  TFA_VERIFY_PROCESS,
  VERIFY_EMAIL_PROCESS,
} from '../common/constants';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { hiddenEmail } from '../common/utilities';

@Processor(EMAIL_QUEUE)
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process(TFA_VERIFY_PROCESS)
  async verify(job: Job<any>) {
    try {
      const { email, otp, requestDate, deviceName } = job.data;
      if (!otp) {
        return;
      }
      await this.mailerService.sendMail({
        to: email,
        subject: 'Xác thực tài khoản | Học viện Kỹ thuật mật mã',
        template: './tfa-verification',
        context: {
          email: hiddenEmail(email),
          requestDate,
          deviceName,
          otp,
        },
      });
      this.logger.log(`Send email verification for ${email} success`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Process(RESET_PASS_PROCESS)
  async resetPassword(job: Job<any>) {
    try {
      const { email, url, requestDate, deviceName } = job.data;
      await this.mailerService.sendMail({
        to: email,
        subject: 'Đặt lại mật khẩu | Học viện Kỹ thuật mật mã',
        template: './reset-password',
        context: {
          email: hiddenEmail(email),
          requestDate,
          deviceName,
          url,
        },
      });
      this.logger.log(`Send email reset password for ${email} success`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Process(VERIFY_EMAIL_PROCESS)
  async verifyEmail(job: Job<any>) {
    try {
      const { email, otp, requestDate, deviceName } = job.data;
      await this.mailerService.sendMail({
        to: email,
        subject: 'Thay đổi địa chỉ Email | Học viện Kỹ thuật mật mã',
        template: './verify-email',
        context: {
          requestDate,
          deviceName,
          otp,
        },
      });
      this.logger.log(`Send verify email for ${email} success`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Process(EMAIL_CRE_PROCESS)
  async emailCreatedNotification(job: Job<any>) {
    try {
      const { email, password } = job.data;
      await this.mailerService.sendMail({
        to: email,
        subject: 'Thông tin tài khoản | Học viện Kỹ thuật mật mã',
        template: './account-created',
        context: {
          email,
          password,
        },
      });
      this.logger.log(`Send email notification for ${email} success`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  @Process(PROJECT_APPROVE_PROCESS)
  async projectApprove(job: Job<any>) {
    try {
      const {
        email,
        title,
        content,
        name,
        description,
        requirement,
        students,
        instructor,
        createdDate,
        reviewedDate,
        reason,
        isRefuse,
      } = job.data;
      await this.mailerService.sendMail({
        to: email,
        subject: `${title} | Học viện Kỹ thuật mật mã`,
        template: './project-approval',
        context: {
          approveTitle: title,
          approveContent: content,
          name,
          description,
          requirement,
          students,
          instructor,
          createdDate,
          reviewedDate,
          reason,
          isRefuse,
        },
      });
      this.logger.log(`Send email project approve for ${email} success`);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
