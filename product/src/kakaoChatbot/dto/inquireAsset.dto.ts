import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from 'class-transformer';
import {
  // IsDefined,
  IsNotEmptyObject,
  IsOptional,
  IsUppercase,
  ValidateNested
} from "class-validator";
import { IsYahooFinanceTicker } from "../decorator/validation";
import { SkillPayloadDto } from "./skillPayload.dto";
import { ActionDto } from "./action.dto";
import { ActionParams, ClientExtra } from "../interface/skillPayload.interface";
import { Ticker } from "src/common/interface";

class InquireAssetActionClientExtraDto
  implements ClientExtra
{
  @IsUppercase({ groups: ['ticker'] })
  @IsYahooFinanceTicker({ groups: ['ticker'] })
  @IsOptional({ groups: ['ticker'] })
  @ApiProperty()
  readonly ticker?: Ticker; // 서버를 거친 신뢰할수있는 ticker

  readonly [k: string]: string;
}

class InquireAssetActionParamsDto
  implements ActionParams
{
  @Transform((params) => params.value.toUpperCase(), {
    toClassOnly: true,
    // Todo: nestjs 로 params.options.groups = ['ticker'] 를 넘겨주는 방법 찾기 (문제는 없지만 지금 여러번 실행됨)
    // groups: ['ticker']
  })
  @IsYahooFinanceTicker({ groups: ['ticker'] })
  // @IsDefined()
  @IsOptional({ groups: ['ticker'] })
  @ApiProperty()
  readonly ticker?: string;

  readonly [k: string]: string;
}

class InquireAssetActionDto
  extends ActionDto
{
  @Type(() => InquireAssetActionParamsDto)
  @ValidateNested({ groups: ['ticker'] })
  // @IsNotEmptyObject()
  @IsOptional({ groups: ['ticker'] })
  @ApiProperty({ type: InquireAssetActionParamsDto })
  override readonly params!: InquireAssetActionParamsDto;

  @Type(() => InquireAssetActionClientExtraDto)
  @ValidateNested({ groups: ['ticker'] })
  @IsOptional({ groups: ['ticker'] })
  @ApiProperty({ type: InquireAssetActionParamsDto })
  override readonly clientExtra!: InquireAssetActionClientExtraDto;
}

export class InquireAssetDto
  extends SkillPayloadDto
{
  @Type(() => InquireAssetActionDto)
  @ValidateNested({ groups: ['ticker'] })
  @IsNotEmptyObject()
  @ApiProperty({ type: InquireAssetActionDto })
  override readonly action!: InquireAssetActionDto;
}
