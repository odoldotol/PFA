import {
  Column,
  Entity,
  PrimaryColumn
} from 'typeorm';
import {
  ExchangeIsoCode,
  IsoTimezoneName,
  MarketDate
} from 'src/common/interface';

export const ENTITY_NAME = 'exchanges';

@Entity({ name: ENTITY_NAME })
export class ExchangeEntity
  // implements CoreExchange
{
  @PrimaryColumn({
    type: 'char',
    length: 4,
    name: 'iso_code',
    primaryKeyConstraintName: 'exchanges_iso_code_pkey'
  }) // Todo: 4글자 미만이면 인서트 막기
  iso_code!: ExchangeIsoCode;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'iso_timezonename',
    nullable: false
  })
  iso_timezonename!: IsoTimezoneName;

  @Column({
    type: 'char',
    length: 10,
    name: 'market_date',
    nullable: false
  }) // Todo: nnnn-nn-nn 형식 아니면 인서트 막기
  market_date!: MarketDate;

}
