import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';
import {
  CoreExchange,
  ExchangeIsoCode,
  IsoTimezoneName,
  MarketDate
} from 'src/common/interface';

@Entity({ name: 'exchanges' })
export class Exchange
  implements CoreExchange
{
  @PrimaryColumn({ type: 'char', length: 4, name: 'iso_code' }) // Todo: 4글자 미만이면 인서트 막기
  isoCode!: ExchangeIsoCode;

  @Column({ type: 'varchar', length: 30, name: 'iso_timezonename' })
  isoTimezoneName!: IsoTimezoneName;

  @Column({ type: 'char', length: 10, name: 'marketdate' }) // Todo: nnnn-nn-nn 형식 아니면 인서트 막기
  marketDate!: MarketDate;
}

export type RawExchange = {
  iso_code: ExchangeIsoCode;
  iso_timezonename: IsoTimezoneName;
  marketdate: MarketDate;
};