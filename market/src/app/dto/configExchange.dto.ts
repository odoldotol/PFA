import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfigExchangeDto implements ConfigExchangeI {
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({type: String, required: true, description: 'Exchange 이름', example: 'Hong Kong Stock Exchange'})
    readonly market!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({type: String, required: true, description: 'ISO Code', example: 'XHKG'})
    readonly ISO_Code!: string;

    @IsString()
    @IsOptional()
    @ApiProperty({type: String, required: false, description: 'Country Name', example: 'Hong Kong'})
    readonly country?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({type: String, required: false, description: 'website', example: 'https://www.hkex.com.hk/?sc_lang=en'})
    readonly exchange_website?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({type: String, required: true, description: 'ISO timezone', example: 'Asia/Hong_Kong'})
    readonly ISO_TimezoneName!: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({type: Number, required: false, description: 'Exchange update config margin', example: 0})
    readonly update_margin_milliseconds?: number;

};