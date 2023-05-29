import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { ApiConfigService } from './api-config.service';
import { isEqual } from 'lodash';
import { CacheService } from './cache.service';
import { OtpInvalidException } from '../../common/exceptions';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { decrypt, encrypt } from '../../common/utilities';

@Injectable()
export class OtpService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly apiConfigService: ApiConfigService,
  ) {}

  async generateEmailOtp(deviceId: string, userEmail: string) {
    const verifyFailedCount = +(
      (await this.cacheService.get(`${userEmail}_${deviceId}_2fa_failed`)) || 0
    );
    const maxVerifyFailed = this.apiConfigService.otpConfig.maxVerifyFailed;
    if (verifyFailedCount >= maxVerifyFailed) {
      return '';
    }

    const cache = await this.cacheService.get(`${userEmail}_${deviceId}`);
    if (cache) {
      return cache;
    }
    const otp = this.randomOtp();
    await this.cacheService.set(
      `${userEmail}_${deviceId}`,
      otp,
      this.apiConfigService.otpConfig.expirationTime * 1000,
    );
    return otp;
  }

  async generateTokenOtp(
    email: string,
    response: Response,
    serviceName = this.apiConfigService.twoFactorAuthAppName,
  ) {
    const secret = authenticator.generateSecret();
    const url = authenticator.keyuri(email, serviceName, secret);
    await this.cacheService.set(
      `${email}_secret_auth`,
      encrypt(secret, this.apiConfigService.encodeSecret.tfa),
      this.apiConfigService.otpConfig.expirationTime * 1000,
    );
    return toFileStream(response, url);
  }

  async generateVerifyEmailOtp(userEmail: string) {
    const cache = await this.cacheService.get(`Verify_${userEmail}`);
    if (cache) {
      return cache;
    }
    const otp = this.randomOtp();
    await this.cacheService.set(
      `Verify_${userEmail}`,
      otp,
      this.apiConfigService.otpConfig.expirationTime * 1000,
    );
    return otp;
  }

  async verifyChangeEmailOtp(userEmail: string, otp: string) {
    const cache = await this.cacheService.get(`Verify_${userEmail}`);
    const isValid = cache ? isEqual(otp, `${cache || ''}`) : false;
    isValid && (await this.cacheService.del(`Verify_${userEmail}`));
    return isValid;
  }

  async verifyEmailOtp(verification: {
    deviceId: string;
    userEmail: string;
    otp: string;
  }) {
    const cache = await this.cacheService.get(
      `${verification.userEmail}_${verification.deviceId}`,
    );
    const fn = () => {
      const isValid = cache
        ? isEqual(verification.otp, `${cache || ''}`)
        : false;
      isValid &&
        this.cacheService
          .del(`${verification.userEmail}_${verification.deviceId}`)
          .then();
      return isValid;
    };
    return this.verify(verification.userEmail, verification.deviceId, fn);
  }

  async verifyTokenOtp(verification: {
    userEmail: string;
    deviceId: string;
    token: string;
    secret: string;
  }) {
    const fn = () =>
      authenticator.verify({
        token: verification.token,
        secret: decrypt(
          verification.secret,
          this.apiConfigService.encodeSecret.tfa,
        ),
      });
    return this.verify(verification.userEmail, verification.deviceId, fn);
  }

  private async verify(
    userEmail: string,
    deviceId: string,
    verifyFn: () => boolean,
  ) {
    let failedCount = +(
      (await this.cacheService.get(`${userEmail}_${deviceId}_2fa_failed`)) || 0
    );
    const maxVerifyFailed = this.apiConfigService.otpConfig.maxVerifyFailed;
    const blockTime = this.apiConfigService.otpConfig.blockVerifyFailedTime;
    if (failedCount >= maxVerifyFailed) {
      throw new OtpInvalidException(
        `Mã xác thực không hợp lệ. Bạn không thể đăng nhập trên thiết bị này trong ${
          blockTime / 60
        } phút.`,
      );
    }
    const isValid = verifyFn();

    if (!isValid) {
      failedCount++;
      await this.cacheService.set(
        `${userEmail}_${deviceId}_2fa_failed`,
        failedCount,
        blockTime * 1000,
      );

      throw new OtpInvalidException(
        failedCount >= maxVerifyFailed
          ? `Mã xác thực không hợp lệ. Bạn không thể đăng nhập trên thiết bị này trong ${
              blockTime / 60
            } phút.`
          : `Mã xác thực không hợp lệ. Bạn còn ${
              maxVerifyFailed - failedCount
            } lần thử.`,
      );
    } else {
      await this.cacheService.del(`${userEmail}_${deviceId}_2fa_failed`);
    }

    return isValid;
  }

  private randomOtp(length = 6) {
    let text = '';
    const possible = '123456789';
    for (let i = 0; i < length; i++) {
      const sup = Math.floor(Math.random() * possible.length);
      text += i > 0 && sup == i ? '0' : possible.charAt(sup);
    }
    return Number(text);
  }
}
