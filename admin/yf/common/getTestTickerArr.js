// Todo: getTickerArr dedup - tickerArr 만드는 부분 통일, 차트 클래스를 만들고 차트별로 객체화 하는게 어떰?

const fs = require('fs');
const path = require("path");
const {
  popFooterFromCsvRow,
  makeFulfillYfTicker
} = require('./chart');

const chartFileName = {
  russell1000: 'russell-1000-index-06-04-2024.csv',
  russell2000_1: 'russell-2000-index-05-14-2024-page-1.csv',
  kospi: 'kospi-all-05-13-2024.csv',
  kosdaq: 'kosdaq-all-05-13-2024.csv'
};

const blackList = [
  'ALPN',
  'DOOR',
  'SP',
  '094800.KS',
  '152550.KS',
  '168490.KS',
  '078130.KQ',
  '136510.KQ',
  '119610.KQ',
  '121800.KQ',
  '006580.KQ',
  '096040.KQ',
  '268600.KQ',
  '150840.KQ',
  '057880.KQ',
  '033340.KQ',
  '065560.KQ',
  '016790.KQ',
  '024810.KQ',
  '182400.KQ',
  '078940.KQ',
  '032860.KQ',
  '215090.KQ',
  '047820.KQ',
  '269620.KQ',
  '151910.KQ',
  '178780.KQ',
  '056090.KQ',
  '257370.KQ',
  '160600.KQ',
  '019590.KQ',
  '041590.KQ',
  '226440.KQ',
  '066410.KQ',
  '014200.KQ',
  '208340.KQ',
  '263540.KQ'
];

/**
 * #### 아래 차트들의 yfTicker 들을 배열로 반환
 * russell-1000-index-06-04-2024  
 * russell-2000-index-05-14-2024-page-1  
 * kospi-all-05-13-2024  
 * kosdaq-all-05-13-2024 (상위 1000개)  
 * 
 * - 시가총액순 정렬
 *    - 한국 가중치: 원달러환율 100원으로 놓고 비교
 * 
 * - russell-1000-index-06-04-2024 와 russell-1000-index-05-13-2024 사이의 차이 해소 
 */
module.exports = () => {
  let result = [];

  const splitRowArr = {};

  for (let key in chartFileName) {
    const fileName = chartFileName[key];
    splitRowArr[key] = popFooterFromCsvRow(
      fs.readFileSync(
        getChartFilePath(fileName),
        'utf8'
      ).split('\n')
    ).map(splitRow);
  }

  splitRowArr.kosdaq = splitRowArr.kosdaq.slice(0, 1001); 

  ////////////////////////////////////////////////////////////////////////////////
  // russell-1000-index-06-04-2024 와 russell-1000-index-05-13-2024 사이의 차이 해소
  const russell1000OrgSplitRowArr = popFooterFromCsvRow(
    fs.readFileSync(
      getChartFilePath('russell-1000-index-05-13-2024.csv'),
      'utf8'
    ).split('\n')
  ).map(splitRow);
  const newArr = [];
  splitRowArr.russell1000 = splitRowArr.russell1000.filter(row => {
    const idx = russell1000OrgSplitRowArr.findIndex(orgRow => {
      return orgRow[0] === row[0];
    });
    if (idx !== -1) {
      russell1000OrgSplitRowArr.splice(idx, 1);
      return true;
    } else {
      newArr.push(row[0]);
      return false;
    }
  });
  console.log(`[getTestTickerArr] russell-1000-index-05-13-2024 -> russell-1000-index-06-04-2024
  new: ${newArr}
  old: ${russell1000OrgSplitRowArr.map(row => row[0])}
russell-1000-index-06-04-2024 에서 new 를 제외한 나머지로 작업 수행!
`);
  ////////////////////////////////////////////////////////////////////////////////

  console.log(`[getTestTickerArr] chart
  russell1000: ${splitRowArr.russell1000.length - 1} 개
  russell2000_1: ${splitRowArr.russell2000_1.length - 1} 개
  kospi: ${splitRowArr.kospi.length - 1} 개
  kosdaq: (시총 상위) ${splitRowArr.kosdaq.length - 1} 개
`)

  const idx = {
    russell1000: 1,
    russell2000_1: 1,
    kospi: 1,
    kosdaq: 1
  };

  const marketCapIdx = {
    russell1000: 2,
    russell2000_1: 2,
    kospi: 9,
    kosdaq: 9
  };

  // 시총 보정
  const wonDollarExchangeRate = 100;
  const parseMarketCap = {
    russell1000: str => parseInt(str),
    russell2000_1: str => parseInt(str),
    kospi: str => parseInt(str.replace(/,|"/g, '')) * 100000000 * (1/wonDollarExchangeRate),
    kosdaq: str => parseInt(str.replace(/,|"/g, '')) * 100000000 * (1/wonDollarExchangeRate)
  };
  console.log(`[getTestTickerArr] 원화 표시 기업들의 시총 보정을 위해 사용한 원달러환율: ${wonDollarExchangeRate}`);

  const marketCap = {
    russell1000: parseMarketCap.russell1000(splitRowArr.russell1000[idx.russell1000][marketCapIdx.russell1000]),
    russell2000_1: parseMarketCap.russell2000_1(splitRowArr.russell2000_1[idx.russell2000_1][marketCapIdx.russell2000_1]),
    kospi: parseMarketCap.kospi(splitRowArr.kospi[idx.kospi][marketCapIdx.kospi]),
    kosdaq: parseMarketCap.kosdaq(splitRowArr.kosdaq[idx.kosdaq][marketCapIdx.kosdaq])
  };

  const fulfillYfTicker = {
    russell1000: makeFulfillYfTicker(null),
    russell2000_1: makeFulfillYfTicker(null),
    kospi: makeFulfillYfTicker('KS'),
    kosdaq: makeFulfillYfTicker('KQ')
  };

  // 4 가지의 시총순 정렬된 배열에서 순서대로 가장 큰 값을 result 배열에 넣는것을 4 배열이 모두 비워질때까지 진행.
  do {
    let topkey;
    for (let key in marketCap) {
      if (!topkey || !marketCap[topkey]) {
        topkey = key;
        continue;
      }

      if (!marketCap[key]) {
        continue;
      }

      if (marketCap[topkey] < marketCap[key]) {
        topkey = key;
      }
    }
    
    result.push(fulfillYfTicker[topkey](splitRowArr[topkey][idx[topkey]][0]));

    const nextsplitRow = splitRowArr[topkey][++idx[topkey]];
    if (!nextsplitRow) {
      marketCap[topkey] = null;
    } else {
      marketCap[topkey] = parseMarketCap[topkey](nextsplitRow[marketCapIdx[topkey]]);
    }
  } while (
    marketCap.russell1000
    || marketCap.russell2000_1
    || marketCap.kospi
    || marketCap.kosdaq
  )

  // Test DB 에서 NotFound 로 추가 안된 자산의 티커는 제거
  console.log(`[getTestTickerArr] NotFound 로 차트에서 제거될 자산목록: ${blackList.length} 개`);
  result = result.filter(ticker => {
    const idx = blackList.indexOf(ticker);
    if (idx !== -1) {
      blackList.splice(idx, 1);
      return false;
    } else {
      return true;
    }
  });

  if (blackList.length !== 0) {
    console.log(`[getTestTickerArr] 제거하지 못한 티커: ${blackList}`);
  }

  console.log(`[getTestTickerArr] 최종 반환한 티커 갯수: ${result.length} 개`);

  return result;
};

function getChartFilePath(chartFileName) {
  return path.join(
    path.join(__dirname, '..', 'data', 'chart'),
    chartFileName
  );
}

function splitRow(row) {
  return row.split(/(?<!\"\d+),(?!\d+\")/);
}