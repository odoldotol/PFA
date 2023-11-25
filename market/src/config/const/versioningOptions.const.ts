// Todo: 안으로 넣어

import { VersioningOptions, VersioningType } from "@nestjs/common";

export const versioningOptions: VersioningOptions = {
  type: VersioningType.URI,
  prefix: 'api/v',
  defaultVersion: '1'
}