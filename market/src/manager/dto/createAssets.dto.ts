import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateAssetsDto {
    
    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    readonly tickerArr: Array<string>;
    
};