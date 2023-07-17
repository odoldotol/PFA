import { VersioningOptions, VersioningType } from "@nestjs/common";

export default <VersioningOptions> {
  type: VersioningType.URI,
  prefix: 'api/v',
  defaultVersion: '1'
}