import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional } from "class-validator";

// TODO: SkillPayloadDto 구현
export class SkillPayloadDto implements SkillPayloadI {
    
    @IsOptional()
    @ApiProperty()
    readonly intent: any //

    @IsNotEmpty()
    @ApiProperty()
    readonly userRequest: any //

    @IsNotEmpty()
    @ApiProperty()
    readonly bot: any //

    @IsNotEmpty()
    @ApiProperty()
    readonly action: any //

    @IsOptional()
    @ApiProperty()
    readonly contexts: any //

};