import { ApiProperty } from "@nestjs/swagger";
import { Either } from "src/common/class/either";
import { TExchangeCore } from "src/common/type";

export class AddAssetsResponse {

    @ApiProperty()
    readonly assets: any; // Todo: Type
    readonly exchanges: TExchangeCore[]; // 사라질 예정

    @ApiProperty()
    readonly failure: {
        general: any[],
        exchange: any[], // 사라질 예정
        yfInfo: any[]
    };

    constructor(
        failures: any[],
        yfInfoFailures: any[],
        exchangeCreationRes: Either<any, TExchangeCore>[],
        finAssetCreationRes: any
    ) {
        this.assets = finAssetCreationRes;
        this.exchanges = Either.getRightArray(exchangeCreationRes); // 사라질 예정
        this.failure = {
            general: [...failures],
            exchange: Either.getLeftArray(exchangeCreationRes), // 사라질 예정
            yfInfo: yfInfoFailures,
        };

    }
}