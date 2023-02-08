import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ConfigExchangeDto {
    
    @IsNotEmpty()
    @IsString()
    readonly market: string;

    @IsNotEmpty()
    @IsString()
    readonly ISO_Code: string;

    @IsOptional()
    @IsString()
    readonly country: string;

    @IsOptional()
    @IsString()
    readonly exchange_website: string;

    @IsNotEmpty()
    @IsString()
    readonly ISO_TimezoneName: string;

    @IsOptional()
    @IsNumber()
    readonly update_margin_milliseconds: number;

};