import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Exchange } from '../exchange/exchange.entity';

@Entity({ name: 'financial_assets' })
@Index(['exchange', 'symbol'], { unique: true })
export class FinancialAsset {
  @PrimaryColumn({ type: 'varchar', length: 15, name: 'symbol' })
  symbol!: string;

  @Column({ type: 'varchar', length: 10, name: 'quotetype' })
  quoteType!: string;

  @Column({ type: 'varchar', length: 100, name: 'shortname' })
  shortName!: string;

  @Column({ type: 'varchar', length: 200, name: 'longname', nullable: true })
  longName?: string;

  @ManyToOne(() => Exchange, { nullable: true })
  @JoinColumn({ name: 'exchange', referencedColumnName: 'ISO_Code' })
  exchange?: string;

  @Column({ type: 'char', length: 3, name: 'currency' })
  currency!: string;

  @Column({ type: 'double precision', name: 'regularmarketlastclose' })
  regularMarketLastClose!: number;
}

export type RawFinancialAsset = {
  symbol: string;
  quotetype: string;
  shortname: string;
  longname: string | null;
  exchange: string | null;
  currency: string;
  regularmarketlastclose: number;
};