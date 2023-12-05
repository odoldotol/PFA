import { ApiProperty, ApiPropertyOptions } from "@nestjs/swagger";

export class AddAssetsResponse {

    @ApiProperty({ description: 'Creation 결과' })
    readonly assets: any; // Todo: Type

    @ApiProperty()
    readonly failure: {
        general: any[],
        yfInfo: any[]
    };

    constructor(
        generalFailures: any[],
        yfInfoFailures: any[],
        finAssetCreationRes: any
    ) {
        this.assets = finAssetCreationRes;
        this.failure = {
            general: [...generalFailures],
            yfInfo: yfInfoFailures,
        };

    }
}