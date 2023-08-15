import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'exchanges' })
export class Exchange {
  @PrimaryColumn({ type: 'char', length: 4, name: 'iso_code' }) // Todo: 4글자 미만이면 인서트 막기
  ISO_Code!: string;

  @Column({ type: 'varchar', length: 30, name: 'iso_timezonename' })
  ISO_TimezoneName!: string;

  @Column({ type: 'char', length: 10, name: 'marketdate' }) // Todo: nnnn-nn-nn 형식 아니면 인서트 막기
  marketDate!: string;

  @Column({ type: 'varchar', length: 5, name: 'yf_exchangename', nullable: true, default: null })
  yf_exchangeName?: string;
}

export type RawExchange = {
  iso_code: string;
  iso_timezonename: string;
  marketdate: string;
  yf_exchangename: string | null;
};