import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional } from "class-validator";

// TODO: SkillPayloadDto 구현
export class SkillPayloadDto implements SkillPayloadI {
    
    @IsOptional()
    @ApiProperty()
    readonly intent

    @IsNotEmpty()
    @ApiProperty()
    readonly userRequest

    @IsNotEmpty()
    @ApiProperty()
    readonly bot

    @IsNotEmpty()
    @ApiProperty()
    readonly action

    @IsOptional()
    @ApiProperty()
    readonly contexts

};