import { Throttle } from '@nestjs/throttler';
import {
  DEFAULT_THROTTLE_LIMIT_LONG,
  DEFAULT_THROTTLE_LIMIT_SHORT,
  DEFAULT_THROTTLE_TTL_LONG,
  DEFAULT_THROTTLE_TTL_SHORT
} from 'src/config';

export const throttleOptions
: Parameters<typeof Throttle>[0]
= {
  "short": {
    ttl: Number(process.env['THROTTLE_TTL_KAKAO_CHATBOT_SHORT']) || DEFAULT_THROTTLE_TTL_SHORT,
    limit: Number(process.env['THROTTLE_LIMIT_KAKAO_CHATBOT_SHORT']) || DEFAULT_THROTTLE_LIMIT_SHORT,
  },
  "long": {
    ttl: Number(process.env['THROTTLE_TTL_KAKAO_CHATBOT_LONG']) || DEFAULT_THROTTLE_TTL_LONG,
    limit: Number(process.env['THROTTLE_LIMIT_KAKAO_CHATBOT_LONG']) || DEFAULT_THROTTLE_LIMIT_LONG,
  },
};