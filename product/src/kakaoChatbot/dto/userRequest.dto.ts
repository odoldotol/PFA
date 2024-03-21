import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";
import {
  Block,
  User,
  Properties,
  UserRequest,
} from "../interface/skillPayload.interface";

class PropertiesDto
  implements Properties
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly botUserKey!: string;

  @IsString()
  @ApiProperty()
  readonly plusfriendUserKey!: string;

  @IsString()
  @ApiProperty()
  readonly appUserId!: string;

  @IsBoolean()
  @ApiProperty()
  readonly isFriend!: boolean;
}

class UserDto
  implements User
{
  @Type(() => PropertiesDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: PropertiesDto })
  readonly properties!: PropertiesDto;

  // 이를 이용하진 않지만, botUserKey 가 id 에 담김. type = "botUserKey" 로 알려주고있음.
  @IsString()
  @ApiProperty()
  readonly id!: string;

  @IsString()
  @ApiProperty()
  readonly type!: string; // botUserKey 
}

export class UserRequestDto
  implements UserRequest
{
  @Type(() => UserDto)
  @ValidateNested()
  @IsNotEmptyObject()
  @ApiProperty({ type: UserDto })
  readonly user!: UserDto;

  @IsString()
  @ApiProperty()
  readonly timezone!: string;

  @IsObject()
  @ApiProperty()
  readonly block!: Block;

  @IsString()
  @ApiProperty()
  readonly utterance!: string;

  @IsString()
  @ApiProperty()
  readonly lang!: string;

  @IsOptional()
  @ApiProperty()
  readonly params?: any; //
}
