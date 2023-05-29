import { CacheModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProjectModule } from './features/project/project.module';
import { DepartmentModule } from './features/department/department.module';
import { StudentModule } from './features/student/student.module';
import { ExaminerCouncilModule } from './features/examiner-council/examiner-council.module';
import { ManagerStaffModule } from './features/manager-staff/manager-staff.module';
import { CommonModule } from './features/common/common.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { consumers } from './consumers';
import { BullModule } from '@nestjs/bull';
import { SemesterModule } from './features/semester/semester.module';
import { ReviewerStaffModule } from './features/reviewer-staff/reviewer-staff.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerMiddleware } from './common/middlewares';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProjectModule,
    DepartmentModule,
    StudentModule,
    ExaminerCouncilModule,
    ManagerStaffModule,
    ReviewerStaffModule,
    CommonModule,
    SemesterModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) =>
        configService.throttleConfig,
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) =>
        configService.typeOrmConfig,
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    MailerModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: async (configService: ApiConfigService) =>
        configService.mailingConfig,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: (configService: ApiConfigService) =>
        configService.redisConfig,
    }),
    BullModule.forRootAsync({
      imports: [SharedModule],
      inject: [ApiConfigService],
      useFactory: async (configService: ApiConfigService) => ({
        redis: configService.redisConfig,
      }),
    }),
  ],
  providers: [
    ...consumers,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
