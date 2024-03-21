import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsUppercase,
  ValidateNested
} from "class-validator";
import { IsYahooFinanceTicker } from "src/common/decorator/validation";
import { SkillPayloadDto } from "./skillPayload.dto";
import { ActionDto } from "./action.dto";
import { ClientExtra } from "../interface/skillPayload.interface";
import { Ticker } from "src/common/interface";

class ReportTickerActionClientExtraDto
  implements ClientExtra
{
  @IsUppercase()
  @IsYahooFinanceTicker()
  @IsDefined()
  @ApiProperty()
  readonly ticker!: Ticker; // 서버를 거친 신뢰할수있는 ticker

  @IsDefined()
  @ApiProperty()
  readonly reason!: any;

  readonly [k: string]: string;
}

class ReportTickerActionDto
  extends ActionDto
{
  @Type(() => ReportTickerActionClientExtraDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: ReportTickerActionClientExtraDto })
  override readonly clientExtra!: ReportTickerActionClientExtraDto;
}

export class ReportTickerDto
  extends SkillPayloadDto
{
  @Type(() => ReportTickerActionDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: ReportTickerActionDto })
  override readonly action!: ReportTickerActionDto;

  /** contexts
   * 이를 이용하고 있진 않지만,
   * 챗봇에서 contexts 로 ticker 를 노출하기 때문에 이에 접근하는 구현도 차선책으로 가능함.
   */
}
