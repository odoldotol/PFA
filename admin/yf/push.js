const {
  tickerArr,
  writeBody,
  makeHttpClientRequest
} = require('./common')(
  process,
  __dirname
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

    // 모든 자산이 잘 요청되고 잘 응답되었는지 간단한 카운트 확인
    if (pushed + failed !== tickerArr.length || pushed !== pushedMongo + failedMongo) {
      console.warn('Pushed and failed counts do not match!!!');
      console.warn('Pushed and failed counts do not match!!!');
      console.warn('Pushed and failed counts do not match!!!');
      console.warn('Pushed and failed counts do not match!!!');
      console.warn('Pushed and failed counts do not match!!!');
    }

    // 이미 존재하는 자산 이외의 실패 사례 로깅
    const failuresToLog = v.failure.general.filter(v => {
      return v.msg !== 'Already exists'
    });
    0 < failuresToLog.length && console.log('Failures(not already exists)', failuresToLog);

    func(v);
  }
}
