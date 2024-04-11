import { ApiProperty } from "@nestjs/swagger";
import Either from "src/common/class/either";
import {
  FinancialAssetCore,
  YfInfo
} from "src/common/interface";

export class SubscribeAssetsResponse {

  @ApiProperty({ description: '정상적으로 구독된 Assets' })
  readonly assets: FinancialAssetCore[] = [];

  @ApiProperty()
  readonly failure: {
    general: any[],
    query?: any
  };

  @ApiProperty()
  readonly yfInfo: any;

  constructor(
    generalFailures: any[],
    yfInfoCreationRes: Either<any, YfInfo[]>,
    finAssetCreationRes: Either<any, FinancialAssetCore[]>
  ) {
    this.failure = {
      general: generalFailures,
    };
    this.yfInfo = yfInfoCreationRes.isLeft()
      ? yfInfoCreationRes.left
      : yfInfoCreationRes.right;

    finAssetCreationRes.isRight()
      ? (this.assets = finAssetCreationRes.right)
      : (this.failure.query = finAssetCreationRes.left);
  }

}
