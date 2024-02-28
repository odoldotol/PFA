// temporary

/**
 * ### Child 서버에 Session 이 반영되기까지의 시간 마진
 * @todo env?
 */
export const EVENT_MARGIN_DEFAULT = 60000;

export const EVENT_TICK = 500;

/**
 * 재시도할 횟수
 * @todo env?
 */
export const UPDATE_RETRY_LIMIT = 3 * 60 * 1000 / EVENT_TICK; // 3분동안