import { Injectable } from "@nestjs/common";
import { UserService } from "src/database";
import { SkillPayloadDto } from "./dto";
import { User } from "src/database/user/user.entity";

/**
 * 데코레이터 패턴 알아봐라
 */
@Injectable()
export class AuthService {

  constructor(
    private readonly userSrv: UserService,
  ) {}

  public async getUser(
    skillPayload: SkillPayloadDto
  ): Promise<User> {
    const botUserKey = skillPayload.userRequest.user.properties.botUserKey;
    const user = await this.userSrv.readOneByBotUserKey(botUserKey);
    if (user !== null) {
      return user;
    } else {
      return this.userSrv.createOneByBotUserKey(botUserKey);
    }
  }

  public async getUserId(
    skillPayload: SkillPayloadDto
  ): Promise<User['id']> {
    const botUserKey = skillPayload.userRequest.user.properties.botUserKey;
    const userId = await this.userSrv.readOneIdByBotUserKey(botUserKey);
    if (userId !== null) {
      return userId;
    } else {
      return (await this.userSrv.createOneByBotUserKey(botUserKey)).id;
    }
  }

}
