import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../user/user.entity";

export const ENTITY_NAME = 'asset_subscriptions';

@Entity({ name: ENTITY_NAME })
@Unique('UQ_asset_subscriptions_user_id-ticker', ['user_id', 'ticker'])
@Index('IDX_asset_subscriptions_user_id-ticker-activate', ['user_id', 'ticker', 'activate'])
@Index('IDX_asset_subscriptions_user_id-updated_at-ticker-activate', ['user_id', 'updated_at', 'ticker', 'activate'])
export class AssetSubscription {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    type: 'bigint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'asset_subscriptions_id_pkey',
  })
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'asset_subscriptions_user_id_fkey'
  })
  user_id!: User['id'];

  @Column({ type: 'varchar', length: 15, name: 'ticker', nullable: false })
  ticker!: string;

  @Column({ type: 'boolean', name: 'activate', nullable: false, default: true })
  activate!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

}
