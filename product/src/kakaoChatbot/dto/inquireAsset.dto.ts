import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  ValidateNested
} from "class-validator";
import { IsYahooFinanceTicker } from "src/common/decorator/validation";
import { SkillPayloadDto } from "./skillPayload.dto";
import { ActionDto } from "./action.dto";
import { ActionParams } from "../interface/skillPayload.interface";

class InquireAssetActionParamsDto
  implements ActionParams
{
  @Transform((params) => params.value.toUpperCase(), {
    toClassOnly: true,
    // Todo: nestjs 로 params.options.groups = ['ticker'] 를 넘겨주는 방법 찾기 (문제는 없지만 지금 여러번 실행됨)
    // groups: ['ticker']
  })
  @IsYahooFinanceTicker({ groups: ['ticker'] })
  @IsDefined()
  @ApiProperty()
  readonly ticker!: string;

  readonly [k: string]: string;
}

class InquireAssetActionDto
  extends ActionDto
{
  @Type(() => InquireAssetActionParamsDto)
  @ValidateNested({ groups: ['ticker'], always: true })
  @IsNotEmptyObject()
  @ApiProperty({ type: InquireAssetActionParamsDto })
  override readonly params!: InquireAssetActionParamsDto;
}

export class InquireAssetDto
  extends SkillPayloadDto
{
  @Type(() => InquireAssetActionDto)
  @ValidateNested({ groups: ['ticker'], always: true })
  @IsNotEmptyObject()
  @ApiProperty({ type: InquireAssetActionDto })
  override readonly action!: InquireAssetActionDto;
}
