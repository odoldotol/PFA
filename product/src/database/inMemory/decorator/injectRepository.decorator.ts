import { Inject } from "@nestjs/common";
import { INMEMORY_SCHEMA_REPOSITORY_TOKEN_SUFFIX } from "../const/injectionToken.const";

export const InjectRepository = (schemaName: string) => Inject(schemaName + INMEMORY_SCHEMA_REPOSITORY_TOKEN_SUFFIX);