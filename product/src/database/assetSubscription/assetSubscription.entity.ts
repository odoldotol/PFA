import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";


@Entity({ name: 'asset_subscriptions' })
@Index('IDX_asset_subscriptions_user_id-ticker', ['user_id', 'ticker'], { unique: true })
@Index('IDX_asset_subscriptions_user_id-id-ticker', ['user_id', 'id', 'ticker'], { unique: true })
export class AssetSubscription {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    type: 'bigint',
    generatedIdentity: 'ALWAYS'
  })
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'asset_subscriptions_user_fkey'
  })
  user_id!: User['id'];

  @Column({ type: 'varchar', length: 15, name: 'ticker', nullable: false })
  ticker!: string;

}
