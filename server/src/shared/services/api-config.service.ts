import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { OAuth2ClientOptions } from 'google-auth-library/build/src/auth/oauth2client';
import { subscribers } from '../../entity-subscribers';
import { SnakeNamingStrategy } from '../../snake-naming.strategy';
import { migrations } from '../../database/migrations';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get encodeSecret() {
    return {
      password: this.get('PASSWORD_ENCODE_SECRET'),
      forgotPassword: this.get('FORGOT_PASS_ENCODE_SECRET'),
      tfa: this.get('TFA_ENCODE_SECRET'),
    };
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
      refreshExpirationTime: this.getNumber('REFRESH_EXPIRATION_TIME'),
      forgotPassExpirationTime: this.getNumber('FORGOT_PASS_EXPIRATION_TIME'),
    };
  }

  get otpConfig() {
    return {
      expirationTime: this.getNumber('OTP_EXPIRATION_TIME'),
      maxVerifyFailed: this.getNumber('MAX_VERIFY_FAILED'),
      blockVerifyFailedTime: this.getNumber('BLOCK_VERIFY_FAILED_TIME'),
    };
  }

  get throttleConfig() {
    return {
      ttl: this.getNumber('THROTTLER_TTL'),
      limit: this.getNumber('THROTTLER_LIMIT'),
    };
  }

  get webHost() {
    return this.get('WEB_HOST');
  }

  get maxProjectInstrPerSemester() {
    return this.getNumber('MAX_PRO_INSTR_PER_SEMESTER');
  }

  get defaultFolderIds() {
    return {
      avatars: this.getString('AVATARS_FOLDER_ID'),
      projects: this.getString('PROJECTS_FOLDER_ID'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    return {
      migrations,
      subscribers,
      keepConnectionAlive: true,
      type: 'mysql',
      host: this.get('MYSQL_HOST'),
      port: this.getNumber('MYSQL_PORT'),
      username: this.get('MYSQL_USERNAME'),
      password: this.get('MYSQL_PASSWORD'),
      database: this.get('MYSQL_DATABASE'),
      namingStrategy: new SnakeNamingStrategy(),
      autoLoadEntities: true,
      migrationsRun: true,
      synchronize: true,
      logging: this.isDevelopment,
    };
  }

  get mailingConfig(): MailerOptions {
    return {
      transport: {
        host: this.get('MAIL_HOST'),
        secure: false,
        auth: {
          user: this.get('MAIL_USER'),
          pass: this.get('MAIL_PASSWORD'),
        },
      },
      defaults: {
        from: `"no-reply@actvn.edu.vn" <${this.get('MAIL_FROM')}>`,
      },
      template: {
        dir: __dirname + '../../../../mail-templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }

  get driverConfig(): OAuth2ClientOptions {
    return {
      clientId: this.get('DRIVER_CLIENT_ID'),
      clientSecret: this.get('DRIVER_SECRET'),
      redirectUri: this.get('DRIVER_REDIRECT_URI'),
    };
  }

  get redisConfig() {
    return {
      url: this.get('REDIS_URL'),
      host: this.get('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
      username: this.get('REDIS_USERNAME'),
      password: this.get('REDIS_PASSWORD'),
    };
  }

  get driverRefreshToken() {
    return this.getString('DRIVER_REFRESH_TOKEN');
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get isEmailCreNotification(): boolean {
    return this.getBoolean('EMAIL_CRE_NOTIFICATION');
  }

  get twoFactorAuthAppName() {
    return this.getString('TWO_FACTOR_AUTHENTICATION_APP_NAME');
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
