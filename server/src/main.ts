import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ApiConfigService } from './shared/services';
import { setupSwagger } from './setup-swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { HttpExceptionFilter, QueryFailedFilter } from './common/filters';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Cluster } from './cluster';

async function bootstrap(): Promise<NestExpressApplication> {
  initializeTransactionalContext();

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      logger: WinstonModule.createLogger({
        transports: [
          // file on daily rotation (error only)
          new DailyRotateFile({
            // %DATE will be replaced by the current date
            filename: `logs/%DATE%_error.log`,
            level: 'error',
            format: format.combine(format.timestamp(), format.json()),
            datePattern: 'DD-MM-YYYY',
            zippedArchive: false, // don't want to zip our logs
            maxSize: '20m', // 20MB
            maxFiles: '30d', // will keep log until they are older than 31 days
          }),
          // same for all levels
          new DailyRotateFile({
            filename: `logs/%DATE%_combined.log`,
            format: format.combine(format.timestamp(), format.json()),
            datePattern: 'DD-MM-YYYY',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '30d',
          }),
          new transports.Console({
            format: format.combine(
              format.timestamp(),
              nestWinstonModuleUtilities.format.nestLike(),
            ),
          }),
        ],
      }),
    },
  );

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 2000, // limit each IP to 2000 requests per windowMs
    }),
  );
  app.use(compression());
  // app.use(morgan('combined'));
  app.enableCors();
  app.enableVersioning();
  app.setGlobalPrefix('/api');

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const configService = app.select(SharedModule).get(ApiConfigService);

  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  // Starts listening for shutdown hooks
  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  const port = configService.appConfig.port;
  await app.listen(port);

  return app;
}

function start() {
  if (process.env.NODE_ENV === 'development') {
    void bootstrap();
  } else {
    Cluster.register(bootstrap);
  }
}

start();
