import { ApiProperty } from "@nestjs/swagger";
import Either from "src/common/class/either";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";
import { Yf_info } from "src/database/yf_info/yf_info.schema";

export class AddAssetsResponse {

  @ApiProperty({ description: '정상적으로 추가된 Assets' })
  readonly assets: FinancialAsset[] = [];

  @ApiProperty()
  readonly failure: {
    general: any[],
    query?: any
  };

  @ApiProperty()
  readonly yfInfo: any;

  constructor(
    generalFailures: any[],
    yfInfoCreationRes: Either<any, Yf_info[]>,
    finAssetCreationRes: Either<any, FinancialAsset[]>
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
