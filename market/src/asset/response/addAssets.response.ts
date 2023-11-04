import { ApiProperty } from "@nestjs/swagger";
import { Either } from "src/common/class/either";
import { TExchangeCore } from "src/common/type";

export class AddAssetsResponse {

    @ApiProperty()
    readonly assets: any; // Todo: Type
    readonly exchanges: TExchangeCore[];

    @ApiProperty()
    readonly failure: {
        pre: any[],
        exchange: any[],
        yfInfo: any[]
    };

    constructor(
        failures: any[],
        yfInfoFailures: any[],
        exchangeCreationRes: Either<any, TExchangeCore>[],
        finAssetCreationRes: any
    ) {
        this.assets = finAssetCreationRes;
        this.exchanges = Either.getRightArray(exchangeCreationRes);
        this.failure = {
            pre: [...failures],
            exchange: Either.getLeftArray(exchangeCreationRes),
            yfInfo: yfInfoFailures,
        };

    }
}