import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class RegularUpdateForPriceBodyDto {
    
    @IsNotEmpty()
    @IsString()
    readonly marketDate: string;

    @IsNotEmpty()
    @IsArray()
    readonly priceArrs: [string, number][];

    @IsNotEmpty()
    readonly key: string;

};