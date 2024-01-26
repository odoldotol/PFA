import {
  Column,
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { ExchangeEntity } from '../exchange/exchange.entity';
import {
  Currency,
  ExchangeIsoCode,
  QuoteType,
  Ticker
} from 'src/common/interface';

export const ENTITY_NAME = 'financial_assets';

@Entity({ name: ENTITY_NAME })
@Index(
  'IDX_financial_assets_exchange-symbol',
  ['exchange', 'symbol']
)
export class FinancialAssetEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 20,
    name: 'symbol',
    primaryKeyConstraintName: 'financial_assets_symbol_pkey'
  })
  symbol!: Ticker;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'quote_type'
  })
  quote_type!: QuoteType;

  /*
  최소한 shortName 은 가져야하는게 초기 계획이긴했다.
  하지만, 종종 yf api 에서 문제가 발견되는데, 이때, 다른 핵심 데이터에 대한 대첵은 있는데 shortName 그렇지 못할 수 있다.
  api 가 정상일때 몽고아틀라스에서 업데이트하고, 여유있을때 값 채워넣는걸로 하자.
  */
  @Column({
    type: 'varchar',
    length: 100,
    name: 'short_name',
    nullable: true
  })
  short_name!: string | null;

  @Column({
    type: 'varchar',
    length: 200,
    name: 'long_name',
    nullable: true
  })
  long_name!: string | null;

  @ManyToOne(() => ExchangeEntity, { nullable: true })
  @JoinColumn({
    name: 'exchange',
    referencedColumnName: 'iso_code',
    foreignKeyConstraintName: 'financial_assets_exchange_fkey'
  })
  exchange!: ExchangeIsoCode | null;

  @Column({
    type: 'char',
    length: 3,
    name: 'currency'
  })
  currency!: Currency;

  @Column({
    type: 'double precision',
    name: 'regular_market_last_close'
  })
  regular_market_last_close!: number;
}
