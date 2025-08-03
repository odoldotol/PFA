// k6 run --console-output=log.txt product.subscriptions.inquire.js

import http from 'k6/http';
import { check } from 'k6';

const bot_user_key_max = 100000;

const vus = 5;

const bot_user_key_range = Math.floor(bot_user_key_max / vus);

export const options = {
  vus,
  duration: '300s',
};

export default function () {
  const bot_user_key = (__VU - 1) * bot_user_key_range + __ITER + 1;

  const url = 'http://localhost/api/v1/kakao-chatbot/asset/subscriptions/inquire';
  const payload = JSON.stringify({
    intent: {},
    userRequest: {
      user: {
        properties: {
          botUserKey: String(bot_user_key),
          bot_user_key: String(bot_user_key),
          plusfriendUserKey: 'string',
          plusfriend_user_key: 'string',
          appUserId: 'string',
          isFriend: true
        },
        id: 'string',
        type: 'string'
      },
      timezone: 'string',
      block: {},
      utterance: 'string',
      lang: 'string',
      params: {}
    },
    bot: {
      id: "KAKAO_CHATBOT_ID"
    },
    action: {
      clientExtra: {}
    },
    contexts: [
      {}
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'host': 'product.localhost',
    },
  };

  const res = http.post(url, payload, params);
  check(res, { 'status is 200': (r) => r.status === 200 });
}