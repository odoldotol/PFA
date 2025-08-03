// 기본 http 1.1

const autocannon = require('autocannon')

// let bot_user_key = 1

const fail = {};

// const method = 'POST';
// const url = 'http://localhost/api/v1/kakao-chatbot/asset/subscriptions/inquire';

const method = 'GET';
const url = 'http://localhost/health';

autocannon({
  url,
  method,
  workers: 10,
  connections: 10,
  duration: 10,
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    // 'x-maintenance': 'true',
    'host': 'product.localhost'
  },
  requests: [
    {
//       setupRequest: (req, context) => {
//         ++bot_user_key;
//         req.body = `{
//   "intent": {},
//   "userRequest": {
//     "user": {
//       "properties": {
//         "botUserKey": "${bot_user_key}",
//         "bot_user_key": "${bot_user_key}",
//         "plusfriendUserKey": "string",
//         "plusfriend_user_key": "string",
//         "appUserId": "string",
//         "isFriend": true
//       },
//       "id": "string",
//       "type": "string"
//     },
//     "timezone": "string",
//     "block": {},
//     "utterance": "string",
//     "lang": "string",
//     "params": {}
//   },
//   "bot": {
//     "id": "KAKAO_CHATBOT_ID"
//   },
//   "action": {
//     "clientExtra": {}
//   },
//   "contexts": [
//     {}
//   ]
// }`;
//         return req
//       }
    }
  ],
  // setupClient: (client, context) => {
  //   let chunks = [];

  //   client.on('body', (data) => {
  //     chunks.push(data);
  //   });

  //   client.on('response', (statusCode, res) => {
  //     const data = Buffer.concat(chunks);
  //     if (data.length === 240) {
  //       const body = JSON.parse(data);
  //       if (body.data.text === '죄송해요, 저는 지쳐버렸어요. 잠깐 쉬어야겠어요.') {
  //         fail['429'] ? fail['429']++ : fail['429'] = 1;
  //       }
  //     } else if (data.length < 700) {
  //       let body;
  //       try {
  //         body = JSON.parse(data);
  //       } catch (e) {
  //         console.error('JSON parse error:', e);
  //         console.log(data.toString());
  //         return;
  //       }
  //       if (body.data?.exception) {
  //         fail[body.data.exception.status] ? fail[body.data.exception.status]++ : fail[body.data.exception.status] = 1;
  //       }
  //     }

  //     chunks = [];
  //   });
  //   return client;
  // }
}, (err, result) => {
  if (err) console.error(err);
  // console.log(`Bot User Key: ${bot_user_key}`);
  console.log("statusCodeStats", result.statusCodeStats);
  console.log("fail", fail);
  console.log(result);
});
