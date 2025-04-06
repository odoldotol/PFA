import { Throttle } from '@nestjs/throttler';

export const getThrottleOptionsFromEnv = (envThrottleKeyPrefix: string): Parameters<typeof Throttle>[0] => {
  const throttleOptions: Parameters<typeof Throttle>[0] = {};

  let
  ttlShort = process.env[`THROTTLE_TTL_${envThrottleKeyPrefix}_SHORT`],
  limitShort = process.env[`THROTTLE_LIMIT_${envThrottleKeyPrefix}_SHORT`],
  ttlMedium = process.env[`THROTTLE_TTL_${envThrottleKeyPrefix}_MEDIUM`],
  limitMedium = process.env[`THROTTLE_LIMIT_${envThrottleKeyPrefix}_MEDIUM`],
  ttlLong = process.env[`THROTTLE_TTL_${envThrottleKeyPrefix}_LONG`],
  limitLong = process.env[`THROTTLE_LIMIT_${envThrottleKeyPrefix}_LONG`],
  ttlCut = process.env[`THROTTLE_TTL_${envThrottleKeyPrefix}_CUT`],
  limitCut = process.env[`THROTTLE_LIMIT_${envThrottleKeyPrefix}_CUT`];

  if (ttlShort && limitShort) {
    throttleOptions["short"] = {
      ttl: parseInt(ttlShort),
      limit: parseInt(limitShort),
    };
  }
  
  if (ttlMedium && limitMedium) {
    throttleOptions["medium"] = {
      ttl: parseInt(ttlMedium),
      limit: parseInt(limitMedium),
    };
  }
  
  if (ttlLong && limitLong) {
    throttleOptions["long"] = {
      ttl: parseInt(ttlLong),
      limit: parseInt(limitLong),
    };
  }
  
  if (ttlCut && limitCut) {
    throttleOptions["cut"] = {
      ttl: parseInt(ttlCut),
      limit: parseInt(limitCut),
    };
  }

  return throttleOptions;
};