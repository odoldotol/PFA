import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import {
  // IsDefined,
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
  // @IsDefined()
  @IsOptional({ groups: ['query'] })
  @ApiProperty()
  readonly query?: string;

  readonly [k: string]: string;
}

class InquireAssetV2ActionDto
  extends ActionDto
{
  @Type(() => InquireAssetV2ActionParamsDto)
  @ValidateNested({ groups: ['query'] })
  // @IsNotEmptyObject()
  @IsOptional({ groups: ['query'] })
  @ApiProperty({ type: InquireAssetV2ActionParamsDto })
  override readonly params!: InquireAssetV2ActionParamsDto;

  @Type(() => InquireAssetV2ActionClientExtraDto)
  @ValidateNested({ groups: ['query'] })
  @IsOptional({ groups: ['query'] })
  @ApiProperty({ type: InquireAssetV2ActionClientExtraDto })
  override readonly clientExtra!: InquireAssetV2ActionClientExtraDto;
}

export class InquireAssetV2Dto
  extends SkillPayloadDto
{
  @Type(() => InquireAssetV2ActionDto)
  @ValidateNested({ groups: ['query'] })
  @IsNotEmptyObject()
  @ApiProperty({ type: InquireAssetV2ActionDto })
  override readonly action!: InquireAssetV2ActionDto;
}
