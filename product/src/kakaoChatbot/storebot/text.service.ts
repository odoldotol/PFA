import { Injectable } from "@nestjs/common";

@Injectable()
export class StorebotTextService {

  public launchAlarmScheduled(): string {
    return `...감사합니다...`;
  }

  public retryScheduleLaunchAlarmAfterAddFriend(): string {
    return `...친추추가후 아래 버튼...`;
  }

  public noPersonalInfosNoAds(): string {
    return `...NO개인정보 NO광고...`;
  }

}
