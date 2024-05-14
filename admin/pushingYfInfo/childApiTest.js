const {
  getPath,
  getTickerArr,
  makeHttpClientRequest,
  makeWriteBody
 } = require('./common');

const {
  filePathToRead,
  filePathToWriteBuilder,
} = getPath(
  process,
  __dirname
);

const tickerArr = getTickerArr(
  process,
  filePathToRead
);

const apiFlag = process.argv[4];

const httpClientRequestOptions = {
  hostname: '127.0.0.1',
  port: 8001,
  path: '/yf/info',
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

const writeBody = makeWriteBody(filePathToWriteBuilder);

if (apiFlag) {
  makeHttpClientRequest(
    httpClientRequestOptions,
    writeBody
  ).end(JSON.stringify(tickerArr));
} else {
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
  })).then(writeBody);
}
