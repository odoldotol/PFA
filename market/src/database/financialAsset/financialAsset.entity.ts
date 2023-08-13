import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'financial_assets' })
export class FinancialAsset {
  @PrimaryColumn({ type: 'char', length: 4 })
  symbol!: string;

  @Column({ type: 'varchar', length: 10 })
  quoteType!: string;

  @Column({ type: 'varchar', length: 30 })
  shortName!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  longName!: string;

  @Column({ type: 'char', length: 4 })
  exchange!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ type: 'double precision' })
  regularMarketLastClose!: number;
}