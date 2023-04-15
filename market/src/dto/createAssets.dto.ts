import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAssetsDto {
    
    @IsString({each: true})
    @ArrayNotEmpty()
    @IsArray()
    @ApiProperty({type: [String], required: true, description: 'ticker 배열', example: ['aapl', 'AAPL']})
    readonly tickerArr: Array<string>;
    
};