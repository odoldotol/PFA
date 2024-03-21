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

class AssetSubscriptionActionClientExtraDto
  implements ClientExtra
{
  @IsUppercase()
  @IsYahooFinanceTicker()
  @IsDefined()
  @ApiProperty()
  readonly ticker!: string; // 서버를 거친 신뢰할수있는 ticker. Todo: 그렇다면 redis 에 캐싱되어 있을테니 AssetModule 에서 inquire 로 검증하기

  readonly [k: string]: string;
}

class AssetSubscriptionActionDto
  extends ActionDto
{
  @Type(() => AssetSubscriptionActionClientExtraDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: AssetSubscriptionActionClientExtraDto })
  override readonly clientExtra!: AssetSubscriptionActionClientExtraDto;
}

export class AssetSubscriptionDto
  extends SkillPayloadDto
{
  @Type(() => AssetSubscriptionActionDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: AssetSubscriptionActionDto })
  override readonly action!: AssetSubscriptionActionDto;

  /** contexts
   * 이를 이용하고 있진 않지만,
   * 챗봇에서 contexts 로 ticker 를 노출하기 때문에 이에 접근하는 구현도 차선책으로 가능함.
   */
}
