export * from './api';
export * from './throttleOptions';

/**
 *  카카오챗봇 관련 정적 데이터(텍스트, 버튼, 블록 등등)를 분리하기전까지만 임시로 사용.
 */
export const chatbotListMenuButtons = {
  inquireAsset: {
    title: "찾아 보기",
  },
  inquireSubscribedAsset: {
    title: "구독 중인 자산 조회하기",
  },
  more: {
    title: "...",
  },
};