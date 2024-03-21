import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString
} from "class-validator";
import { MarketDate } from "src/common/class/marketDate.class";
import { PriceTuple } from "src/common/interface";

export class UpdatePriceByExchangeBodyDto {

  // marketDateParser
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: MarketDate,
    required: true,
    description: 'Market Date',
    example: '2023-03-25'
  })
  readonly marketDate!: MarketDate;

  // TODO: 튜플 검증하는 Custom validation decorator 만들어 사용하기
  @ArrayMinSize(2, { each: true })
  @ArrayNotEmpty({ each: true })
  @IsArray({ each: true })
  @IsArray()
  @ApiProperty({ type: Array, required: true, description: '[ticker, Price] 의 배열', example: [['AAPL', 160], ['MSFT', 280]] })
  readonly priceArrs!: PriceTuple[];

}
