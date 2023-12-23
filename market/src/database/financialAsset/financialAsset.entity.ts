import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Exchange } from '../exchange/exchange.entity';
import { Currency, ExchangeIsoCode, QuoteType, Ticker } from 'src/common/interface';

// Todo: nullable 에는 undefined 를 막고 null 을 명시적으로 주어야 하도록 하는게 더 편할것같다.
@Entity({ name: 'financial_assets' })
@Index(['exchange', 'symbol'], { unique: true })
export class FinancialAsset {
  @PrimaryColumn({ type: 'varchar', length: 15, name: 'symbol' })
  symbol!: Ticker;

  @Column({ type: 'varchar', length: 10, name: 'quotetype' })
  quoteType!: QuoteType;

  /*
  최소한 shortName 은 가져야하는게 초기 계획이긴했다.
  하지만, 종종 yf api 에서 문제가 발견되는데, 이때, 다른 핵심 데이터에 대한 대첵은 있는데 shortName 그렇지 못할 수 있다.
  api 가 정상일때 몽고아틀라스에서 업데이트하고, 여유있을때 값 채워넣는걸로 하자.
  */
  @Column({ type: 'varchar', length: 100, name: 'shortname', nullable: true })
  shortName: string | undefined;

  @Column({ type: 'varchar', length: 200, name: 'longname', nullable: true })
  longName: string | undefined;

  @ManyToOne(() => Exchange, { nullable: true })
  @JoinColumn({ name: 'exchange', referencedColumnName: 'isoCode', foreignKeyConstraintName: 'financial_assets_exchange_fkey' })
  exchange: ExchangeIsoCode | undefined;

  @Column({ type: 'char', length: 3, name: 'currency' })
  currency!: Currency;

  @Column({ type: 'double precision', name: 'regularmarketlastclose' })
  regularMarketLastClose!: number;
}

export type RawFinancialAsset = {
  symbol: Ticker;
  quotetype: QuoteType;
  shortname: string | null;
  longname: string | null;
  exchange: ExchangeIsoCode | null;
  currency: Currency;
  regularmarketlastclose: number;
};