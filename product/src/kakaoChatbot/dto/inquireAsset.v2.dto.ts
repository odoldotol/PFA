import { ApiProperty } from "@nestjs/swagger";
import {
  Transform,
  Type
} from 'class-transformer';
import {
  IsNotEmptyObject,
  IsOptional,
  ValidateNested
} from "class-validator";
import { SkillPayloadDto } from "./skillPayload.dto";
import { ActionDto } from "./action.dto";
import {
  ActionParams,
  ClientExtra
} from "../interface/skillPayload.interface";
import { InquireQuery } from "src/common/interface";
import { parseBlank } from "../transform";
import {
  IsSafeLengthQuery,
  IsValidQuery
} from "../decorator";

class InquireAssetV2ActionClientExtraDto
  implements ClientExtra
{
  @IsOptional({ groups: ['query'] })
  @ApiProperty()
  readonly query?: InquireQuery; // 서버를 거친 InquireQuery

  readonly [k: string]: string;
}

class InquireAssetV2ActionParamsDto
  implements ActionParams
{
  @IsOptional({ groups: ['query'] })
  @Transform(parseBlank, { toClassOnly: true })
  @IsValidQuery({ groups: ['query'] })
  @IsSafeLengthQuery({ groups: ['query_long'] })
  @ApiProperty()
  readonly query?: string;

  readonly [k: string]: string;
}

class InquireAssetV2ActionDto
  extends ActionDto
{
  @IsOptional({ groups: ['query'] })
  @Type(() => InquireAssetV2ActionParamsDto)
  @ValidateNested({ groups: ['query'] })
  @ApiProperty({ type: InquireAssetV2ActionParamsDto })
  override readonly params!: InquireAssetV2ActionParamsDto;

  @IsOptional({ groups: ['query'] })
  @Type(() => InquireAssetV2ActionClientExtraDto)
  @ValidateNested({ groups: ['query'] })
  @ApiProperty({ type: InquireAssetV2ActionClientExtraDto })
  override readonly clientExtra!: InquireAssetV2ActionClientExtraDto;
}

export class InquireAssetV2Dto
  extends SkillPayloadDto
{
  @IsNotEmptyObject()
  @Type(() => InquireAssetV2ActionDto)
  @ValidateNested({ groups: ['query'] })
  @ApiProperty({ type: InquireAssetV2ActionDto })
  override readonly action!: InquireAssetV2ActionDto;
}
