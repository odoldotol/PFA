import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RawUser, User } from "./user.entity";

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  public async createByBotUserKey(
    botUserKey: string
  ): Promise<RawUser> {
    return this.userRepo.insert({
      KakaoChatbotUserKey: botUserKey,
    }).then(res => res.raw[0] as RawUser)
  }

  public async readByBotUserKey(
    botUserKey: string
  ): Promise<User | null> {
    return this.userRepo.findOne({
      where: { KakaoChatbotUserKey: botUserKey }
    });
  }

}
