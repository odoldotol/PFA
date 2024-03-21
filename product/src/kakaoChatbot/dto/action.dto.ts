import { ApiProperty } from "@nestjs/swagger";
import {
  IsObject,
  IsString,
} from "class-validator";
import {
  Action,
  ActionParams,
  DetailParams,
  ClientExtra,
} from "../interface/skillPayload.interface";

export class ActionDto
  implements Action
{
  @IsObject()
  @ApiProperty()
  readonly clientExtra!: ClientExtra;

  @IsString()
  @ApiProperty()
  readonly id!: string;

  @IsString()
  @ApiProperty()
  readonly name!: string;

  @IsObject()
  @ApiProperty()
  readonly params!: ActionParams;

  @IsObject()
  @ApiProperty()
  readonly detailParams!: DetailParams;
}
