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

const httpClientRequestOptions = {
  hostname: '127.0.0.1',
  port: 6001,
  path: '/api/v1/asset/subscribe',
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

const writeBody = makeWriteBody(filePathToWriteBuilder);

makeHttpClientRequest(
  httpClientRequestOptions,
  logResult(writeBody)
).end(JSON.stringify(tickerArr));

// --------------------------------------------------------

function logResult(func) {
  return (v) => {
    let
    pushed = v.assets.length,
    failed = v.failure.general.length,
    pushedMongo,
    failedMongo = 0;

    console.log('Pushed', pushed);
    console.log('Failed', failed);
    
    if (Array.isArray(v.yfInfo)) {
      console.log('Pushed(mongo)', (pushedMongo = v.yfInfo.length));
    } else {
      console.log('Pushed(mongo)', (pushedMongo = v.yfInfo.insertedDocs.length));
      console.log('Failed(mongo)', (failedMongo = v.yfInfo.writeErrors.length));
    }

    if (pushed + failed !== tickerArr.length || pushed !== pushedMongo + failedMongo) {
      console.warn('Pushed and failed counts do not match!!!');
    }

    func(v);
  }
}
