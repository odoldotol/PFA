import { Injectable } from "@nestjs/common";
import { TextService } from "../class";

@Injectable()
export class StorebotTextService
  extends TextService<StorebotTextService>
{
  constructor() {
    super("src/../storebot.text.json");
  }

  public introduction(): string { return this.data.introduction; }

  public scheduleAlarm(): string { return this.data.scheduleAlarm; }

  public introductionDetail(): string { return this.data.introductionDetail; }

  public scheduleAlarmButtonLabel(): string { return this.data.scheduleAlarmButtonLabel; }

  public launchAlarmScheduled(): string { return this.data.launchAlarmScheduled; }

  public needToAddFriend(): string { return this.data.needToAddFriend; }

  public retryScheduleLaunchAlarmAfterAddFriend(): string { return this.data.retryScheduleLaunchAlarmAfterAddFriend; }

}
