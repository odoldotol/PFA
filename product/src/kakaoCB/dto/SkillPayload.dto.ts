import { IsNotEmpty, IsObject } from "class-validator";

export class SkillPayloadDto implements SkillPayload {
    
    @IsNotEmpty()
    @IsObject()
    readonly intent

    @IsNotEmpty()
    @IsObject()
    readonly userRequest

    @IsNotEmpty()
    @IsObject()
    readonly bot

    @IsNotEmpty()
    @IsObject()
    readonly action

};