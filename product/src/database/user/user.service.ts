import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {

  private readonly tableName = this.userRepo.metadata.tableName;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  public createOneByBotUserKey(
    botUserKey: string
  ): Promise<User> {
    return this.dataSource.query<User[]>(
`
INSERT INTO ${this.tableName}
  (kakao_chatbot_user_key)
  VALUES ('${botUserKey}')
  RETURNING *
`
    ).then(res => res[0]!);
  }

  public readOneIdByBotUserKey(
    botUserKey: string
  ): Promise<User['id'] | null> {
    return this.dataSource.query<Pick<User, 'id'>[]>(
`
SELECT id
  FROM ${this.tableName}
  WHERE kakao_chatbot_user_key = '${botUserKey}'
  LIMIT 1
`
    ).then(res => res[0] ? res[0].id : null);
  }

  public readOneByBotUserKey(
    botUserKey: string
  ): Promise<User | null> {
    return this.dataSource.query<User[]>(
`
SELECT *
  FROM ${this.tableName}
  WHERE kakao_chatbot_user_key = '${botUserKey}'
  LIMIT 1
`
    ).then(res => res[0] ? res[0] : null);
  }

}
