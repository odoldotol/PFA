import { ApiProperty } from "@nestjs/swagger";
import {
  Transform,
  Type
} from 'class-transformer';
import {
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import { SkillPayloadDto } from "./skillPayload.dto";
import { UserRequestDto } from "./userRequest.dto";
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
  @Transform(parseBlank, { toClassOnly: true })
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

class InquireAssetV2UserRequestDto
  extends UserRequestDto
{
  @IsString({ groups: ['query'] })
  @Transform(parseBlank, { toClassOnly: true })
  @IsValidQuery({ groups: ['query'] })
  @IsSafeLengthQuery({ groups: ['query_long'] })
  @ApiProperty()
  override readonly utterance!: string;
}

export class InquireAssetV2Dto
  extends SkillPayloadDto
{
  @IsNotEmptyObject()
  @Type(() => InquireAssetV2UserRequestDto)
  @ValidateNested({ groups: ['query', 'query_long'] })
  @ApiProperty({ type: InquireAssetV2UserRequestDto })
  override readonly userRequest!: InquireAssetV2UserRequestDto;

  @IsNotEmptyObject()
  @Type(() => InquireAssetV2ActionDto)
  @ValidateNested({ groups: ['query', 'query_long'] })
  @ApiProperty({ type: InquireAssetV2ActionDto })
  override readonly action!: InquireAssetV2ActionDto;
}
