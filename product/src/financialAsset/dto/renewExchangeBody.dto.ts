import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString
} from "class-validator";
import {
  MarketDate,
  PriceTuple
} from "src/common/interface";

export class RenewExchangeBodyDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    description: 'Market Date',
    example: '2023-03-25'
  })
  readonly marketDate!: MarketDate;

  // TODO: 튜플 검증하는 Custom validation decorator 만들어 사용하기
  @ArrayMinSize(3, { each: true })
  @ArrayNotEmpty({ each: true })
  @IsArray({ each: true })
  @IsArray()
  @ApiProperty({ type: Array, required: true, description: '[ticker, regulerMarketLastClose, regularMarketPreviousClose] 의 배열', example: [['AAPL', 160, 150], ['MSFT', 280, 250]] })
  readonly priceTupleArr!: PriceTuple[];

}
