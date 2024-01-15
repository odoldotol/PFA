import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: 'users' })
@Index(['KakaoChatbotUserKey'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid' , { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', unique: true, length: 100, name: 'kakao_chatbot_user_key' })
  KakaoChatbotUserKey!: string;

}

export type RawUser = {
  id: string;
  kakao_chatbot_user_key: string;
};