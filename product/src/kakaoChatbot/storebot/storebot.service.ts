import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthService } from "../auth.service";
import { SkillPayloadDto } from "../dto";
import { SkillResponseService } from "../skillResponse.service";
import { SkillResponse } from "../skillResponse/v2";
import {
  LaunchAlarm,
  LaunchAlarmDocument
} from "./launchAlarm.schema";

@Injectable()
export class StorebotService {

  constructor(
    @InjectModel(LaunchAlarm.name)
    private readonly launchAlarmModel: Model<LaunchAlarmDocument>,
    private readonly skillResponseSrv: SkillResponseService,
    private readonly authSrv: AuthService,
  ) {}

  public async welcomeAlarm(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);

    await this.createIfNotExist(userId);

    return this.skillResponseSrv.sb_welcomeAlarm();
  }

  public async scheduleLaunchAlarm(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const isFriend = this.authSrv.isFriend(skillPayload);

    const launchAlarm = await this.readOneOrCreate(userId);
    const lastRequest = launchAlarm.requests[launchAlarm.requests.length - 1];

    if ((
      isFriend == true &&
      lastRequest?.isFriend == false
    ) || (
      isFriend == false &&
      lastRequest == undefined
    )) {
      launchAlarm.requests.push({
        isFriend,
        date: new Date(),
      });
      launchAlarm.markModified("requests");
      await launchAlarm.save();
    }

    if (isFriend == true) {
      return this.skillResponseSrv.sb_launchAlarmScheduled();
    } else {
      return this.skillResponseSrv.sb_retryScheduleLaunchAlarmAfterAddFriend();
    }
  }

  public async createIfNotExist(
    userId: number,
  ): Promise<void> {
    await this.readOneOrCreate(userId);
  }

  public async readOneOrCreate(
    userId: number,
  ): Promise<LaunchAlarmDocument> {
    const launchAlarm = await this.launchAlarmModel.findOne({ userId });
    if (launchAlarm) {
      return launchAlarm;
    } else {
      return new this.launchAlarmModel({ userId }).save();
    }
  }

}
