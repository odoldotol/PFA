import { IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class SkillPayloadDto implements SkillPayload {
    
    @IsOptional()
    readonly intent

    @IsOptional()
    readonly userRequest

    @IsOptional()
    readonly bot

    @IsOptional()
    readonly action

    @IsOptional()
    readonly contexts

};