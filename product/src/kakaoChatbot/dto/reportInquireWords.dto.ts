import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  ValidateNested
} from "class-validator";
import { SkillPayloadDto } from "./skillPayload.dto";
import { ActionDto } from "./action.dto";
import { ClientExtra } from "../interface/skillPayload.interface";
import {
  InquireQuery,
  Ticker
} from "src/common/interface";

class ReportInquireWordsActionClientExtraDto
  implements ClientExtra
{
  @IsDefined()
  @ApiProperty()
  readonly inquireWords!: Ticker | InquireQuery; // 서버를 거친 InquireWords

  @IsDefined()
  @ApiProperty()
  readonly reason!: any;

  readonly [k: string]: string;
}

class ReportInquireWordsActionDto
  extends ActionDto
{
  @Type(() => ReportInquireWordsActionClientExtraDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: ReportInquireWordsActionClientExtraDto })
  override readonly clientExtra!: ReportInquireWordsActionClientExtraDto;
}

export class ReportInquireWordsDto
  extends SkillPayloadDto
{
  @Type(() => ReportInquireWordsActionDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: ReportInquireWordsActionDto })
  override readonly action!: ReportInquireWordsActionDto;

  /** contexts
   * 이를 이용하고 있진 않지만,
   * 챗봇에서 contexts 로 ticker 를 노출하기 때문에 이에 접근하는 구현도 차선책으로 가능함.
   */
}
