import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ApiConfigService, CacheService } from '../../shared/services';
import type { UserEntity } from '../user/models';
import { UserService } from '../user/services';
import { TokenType } from '../../common/constants';
import { JwtInvalidException } from '../../common/exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ApiConfigService,
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.publicKey,
    });
  }

  async validate(args: {
    uid: string;
    userId: number;
    type: TokenType;
  }): Promise<UserEntity> {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new JwtInvalidException();
    }

    const isBlocked = await this.cacheService.get(`Blocked_${args.uid}`);
    if (!!isBlocked) {
      throw new JwtInvalidException();
    }

    const user = await this.userService.findById(args.userId);
    if (!user) {
      throw new JwtInvalidException();
    }

    return user;
  }
}
