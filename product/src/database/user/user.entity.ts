import {
  Column,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: 'users' })
@Index('IDX_users_kakao_chatbot_user_key-id', ['kakao_chatbot_user_key', 'id'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    type: 'integer',
    generatedIdentity: 'ALWAYS'
  })
  id!: number;

  @Generated('uuid')
  @Column('uuid' , {
    name: 'uuid',
    unique: true,
    nullable: false
  })
  uuid!: string;

  @Column({ // 다른 더 효율적인 데이터 타입으로 변환하여 저장해야하나?
    type: 'varchar',
    unique: true,
    length: 100,
    name: 'kakao_chatbot_user_key',
    nullable: true,
  })
  kakao_chatbot_user_key!: string | null;

}
