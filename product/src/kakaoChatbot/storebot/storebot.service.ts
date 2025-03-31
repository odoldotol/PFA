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

  public async scheduleLaunchAlarm(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const isFriend = this.authSrv.isFriend(skillPayload);
    let launchAlarm = await this.launchAlarmModel.findOne({ userId });
    const lastRequest = launchAlarm?.requests[launchAlarm.requests.length - 1];

    if (launchAlarm == null) {
      launchAlarm = new this.launchAlarmModel({ userId });
      launchAlarm.requests.push({
        isFriend,
        date: new Date(),
      });
    }

    if (
      isFriend == true &&
      lastRequest?.isFriend == false
    ) {
      launchAlarm.requests.push({
        isFriend,
        date: new Date(),
      });
      launchAlarm.markModified("requests");
    }

    launchAlarm.isModified() && await launchAlarm.save();

    if (isFriend == true) {
      return this.skillResponseSrv.sb_launchAlarmScheduled();
    } else {
      return this.skillResponseSrv.sb_retryScheduleLaunchAlarmAfterAddFriend();
    }
  }

}
