import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Exchange } from '../exchange/exchange.entity';

@Entity({ name: 'financial_assets' })
@Index(['exchange', 'symbol'], { unique: true })
export class FinancialAsset {
  @PrimaryColumn({ type: 'char', length: 4 })
  symbol!: string;

  @Column({ type: 'varchar', length: 10 })
  quoteType!: string;

  @Column({ type: 'varchar', length: 30 })
  shortName!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  longName!: string;

  @ManyToOne(() => Exchange)
  @JoinColumn({ name: 'exchange', referencedColumnName: 'ISO_Code' })
  exchange!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ type: 'double precision' })
  regularMarketLastClose!: number;
}