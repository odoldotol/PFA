import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "../user/user.entity";


@Entity({ name: 'asset_subscriptions' })
@Index(['user', 'ticker'], { unique: true })
export class AssetSubscription {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user', referencedColumnName: 'id', foreignKeyConstraintName: 'asset_subscriptions_user_fkey' })
  user!: User['id'];

  @Column({ type: 'varchar', length: 15, name: 'ticker' })
  ticker!: string;

}

export type RawAssetSubscription = {
  id: number;
  user: User['id'];
  ticker: string;
};