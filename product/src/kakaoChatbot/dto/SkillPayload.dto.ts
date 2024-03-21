import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmptyObject,
  IsObject,
  ValidateNested
} from "class-validator";
import {
  Action,
  Bot,
  Context,
  Intent,
  SkillPayload,
} from "../interface/skillPayload.interface";
import { UserRequestDto } from "./userRequest.dto";

export class SkillPayloadDto
  implements SkillPayload
{
  @IsObject()
  @ApiProperty()
  readonly intent!: Intent

  @Type(() => UserRequestDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: UserRequestDto })
  readonly userRequest!: UserRequestDto;

  @IsObject()
  @ApiProperty()
  readonly bot!: Bot;

  @IsObject()
  @ApiProperty()
  readonly action!: Action;

  @IsArray()
  @IsObject({ each: true })
  @ApiProperty({ type: [Object] })
  readonly contexts!: Context[];
}
