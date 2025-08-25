// k6 run --console-output=log.txt product.subscriptions.inquire.js

import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const
  conn = new Trend('conn'),
  tls = new Trend('tls'),
  wait = new Trend('wait');

const bot_user_key_max = 100000;

const vus = 200; //
const duration = '360s'; //

const bot_user_key_range = Math.floor(bot_user_key_max / vus);

export const options = {
  vus,
  duration,
};

// export const options = {
//   scenarios: {
//     steady: {
//       executor: 'constant-arrival-rate',
//       rate: 200,
//       timeUnit: '1s',
//       duration,
//       preAllocatedVUs: vus,
//       maxVUs: 2000,
//       // exec: 'steady'
//     }
//   }
// }

export default function () {
  const bot_user_key = (__VU - 1) * bot_user_key_range + __ITER + 60000; //

  const url = 'http://localhost/api/v1/kakao-chatbot/asset/subscriptions/inquire';
  // const url = 'http://localhost:7001/api/v1/kakao-chatbot/asset/subscriptions/inquire';
  // const url = 'https://product.lapiki-invest.com/api/v1/kakao-chatbot/asset/subscriptions/inquire';
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
      id: "KAKAO_CHATBOT_ID" //

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
      'host': 'product.localhost', //
      // 'host': 'product.lapiki-invest.com', //
      'x-maintenance': 'true', //
    },
  };

  const res = http.post(url, payload, params);

  conn.add(res.timings.connecting);
  tls.add(res.timings.tls_handshaking);
  wait.add(res.timings.waiting);

  check(res, {
    'status is 200': (r) => {
      // r.body && console.log(r.body);
      return r.status === 200;
    },
    // 'status is 200, with http2': (r) => {
    //   // r.body && console.log(r.body);
    //   return r.status === 200 && (r.proto || '').startsWith('HTTP/2');
    // },
    // 'http2': (r) => {
    //   return (r.proto || '').startsWith('HTTP/2');
    // }
  });
}