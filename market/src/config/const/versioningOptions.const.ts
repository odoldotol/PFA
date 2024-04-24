import {
  VersioningOptions,
  VersioningType
} from "@nestjs/common";

export const versioningPrefix = 'api/v';

const defaultVersion = '1';

export const versioningOptions: VersioningOptions = {
  type: VersioningType.URI,
  prefix: versioningPrefix,
  defaultVersion,
};