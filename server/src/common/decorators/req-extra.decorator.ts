import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from '@supercharge/request-ip';
import { parseDevice } from '../utilities';

export const ReqExtra = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      ip: requestIp.getClientIp(request),
      deviceName: parseDevice(request.headers['user-agent']),
    };
  },
);
