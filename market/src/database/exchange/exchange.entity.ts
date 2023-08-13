import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'exchanges' })
export class Exchange {
  @PrimaryColumn({ type: 'char', length: 4 })
  ISO_Code!: string;

  @Column({ type: 'varchar', length: 30 })
  ISO_TimezoneName!: string;

  @Column({ type: 'char', length: 10 })
  marketDate!: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  yf_exchageName!: string;
}