import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { SkillPayload } from "../interface/skillPayload.interface";

// TODO: SkillPayloadDto 구현
export class SkillPayloadDto implements SkillPayload {

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

}
