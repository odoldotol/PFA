// @ts-nocheck // 메서드를 정의만 하기.

import { Injectable } from "@nestjs/common";
import { AppConfigService } from "src/config";
import { TextService } from "../class";

@Injectable()
export class StorebotTextService
  extends TextService<StorebotTextService>
{
  constructor(
    appConfigSrv: AppConfigService,
  ) {
    super(
      "src/../storebot.text.json",
      appConfigSrv,
    );
  }

  public introduction(): string {}
  public scheduleAlarm(): string {}
  public introductionDetail(): string {}
  public scheduleAlarmButtonLabel(): string {}
  public launchAlarmScheduled(): string {}
  public needToAddFriend(): string {}
  public retryScheduleLaunchAlarmAfterAddFriend(): string {}

}
