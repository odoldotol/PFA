const {
  tickerArr,
  writeBody,
  makeHttpClientRequest
} = require('./common')(
  process,
  __dirname
);

const pathEnd = process.argv[4];
const httpClientRequestOptions = {
  hostname: process.env.CHILD_API_HOSTNAME || '127.0.0.1',
  port: 8001,
  path: `/yf/${pathEnd}`,
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

const apiFlag = process.argv[5];
if (apiFlag) {
  makeHttpClientRequest(
    httpClientRequestOptions,
    writeBody
  ).end(JSON.stringify(tickerArr));
} else { // 각 티커마다 개별 요청을 병열로 보냄. 티커배열과 순서가 일치하도록 결과를 취합하여 json 파일로 저장.
  const path = httpClientRequestOptions.path;

  Promise.all(tickerArr.map(ticker => {
    httpClientRequestOptions.path = path + '/' + ticker;

    return new Promise((
      resolve,
      reject
    ) => {
      makeHttpClientRequest(
        httpClientRequestOptions,
        resolve,
        reject
      ).end();
    }).catch((err) => err);
  })).then(writeBody)
  .catch(console.error);
}
