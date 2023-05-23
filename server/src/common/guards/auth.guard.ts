import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { JwtExpiredException, JwtInvalidException } from '../exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new JwtExpiredException();
      }
      throw new JwtInvalidException();
    }
    return user;
  }
}
