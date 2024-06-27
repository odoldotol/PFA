import { Inject } from "@nestjs/common";
import { TOKEN_SUFFIX } from "../const/injectionToken.const";
import { buildInjectionToken } from "src/common/util";

export const InjectTaskQueue = (token: string) => Inject(buildInjectionToken(token, TOKEN_SUFFIX));