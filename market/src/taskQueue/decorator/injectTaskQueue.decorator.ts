import { Inject } from "@nestjs/common";
import { TOKEN_SUFFIX } from "../const/injectionToken.const";

export const InjectTaskQueue = (token: string) => Inject(token + TOKEN_SUFFIX);