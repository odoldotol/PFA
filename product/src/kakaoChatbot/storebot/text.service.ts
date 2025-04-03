import { Injectable } from "@nestjs/common";

@Injectable()
export class StorebotTextService {

  public introduction(): string {
    return `간편주문

언제 어디서든
원하는 매장의 주문을
내 손안에서 카카오톡으로 10초 만에`;
  }

  public scheduleAlarm(): string {
    return `아래 버튼으로 예약해 주시면 기능 및 매장 안내드려요!`;
  }

  public introductionDetail(): string {
    return `간편주문은 추가로 앱을 설치할 필요도 없고 회원가입할 필요도 없어요.
카운터나 키오스크에 줄 설 필요도 없고 내 핸드폰만 있으면 주문할 수 있어요.
언제 어디서든 원하는 매장의 주문을 카카오톡으로 10초 만에 하세요.`;
  }

  public launchAlarmScheduled(): string {
    return `감사해요. 카톡 드릴게요!`;
  }

  public needToAddFriend(): string {
    return `저와 친구 해 주셔야 카톡을 드릴 수 있어요.`;
  }

  public retryScheduleLaunchAlarmAfterAddFriend(): string {
    return this.noPersonalInfosNoAds() + "\n"
    + "\n"
    + this.howToAddFriend() + "\n"
    + `저를 친구로 추가해 주시고 아래 버튼으로 예약해 주세요.`;
  }

  private howToAddFriend(): string {
    return `오른쪽 위에 집 모양 아이콘을 누르면 "채널 친구 추가하기" 버튼이 있어요.`;
  }

  private noPersonalInfosNoAds(): string {
    return `이 채널은 개인정보를 요구하거나 수집하지 않아요.
어떠한 광고도 하지 않아요.`;
  }

}
