const fs = require('fs');
const path = require("path");

module.exports = (
  chartConfig,
  clArgs,
  dirname
) => {
  const {
    chartFileName,
    chartFileExtension,
    chartYfNationalCode,
    limit
  } = {
    ...chartConfig,
    ...clArgs
  };

  const filePathToRead = path.join(
    path.join(dirname, 'data', 'chart'),
    chartFileName + '.' + chartFileExtension
  );

  const result = [];

  let csvRowArr = fs.readFileSync(filePathToRead, 'utf8').split('\n');
  csvRowArr = popFooterFromCsvRow(csvRowArr);

  const fulfillYfTicker = makeFulfillYfTicker(chartYfNationalCode);
  for (let i = 1; i < csvRowArr.length; i++) {
    if (result.length < limit) {
      let ticker = csvRowArr[i].split(',')[0];
      result.push(fulfillYfTicker(ticker));
    } else {
      break;
    }
  }

  return result;
};

/**
 * ### csv 파일 마지막에 footer 또는 Dummy 열을 제거
 * 
 * ### footer 찾는 로직
 * - 제일 마지막 열부터 순차적으로 콤마(,)로 분리후, 그 길이가 행 갯수(첫번째 열을 콤마로 분리한 결과의 길이)와 일치하는지 확인함.
 * - 일부 자산(한국)의 경우 가격의 자리수를 콤마(,)로 구분하기때문에(ex: "50,000") seperater 로 아래와 같은 정규식(/(?<!\"\d+),(?!\d+\")/)을 이용하고있음.
 * - *******다른 예외적인 콤마(,)사용이 있는 차트를 위해서는 수정이 필요함.**
 */
const popFooterFromCsvRow = (rowArr) => {
  let countFooterRow = 0;

  let i = rowArr.length - 1;
  const numberOfColumn = rowArr[0].split(',').length;
  while (rowArr[i].split(/(?<!\"\d+),(?!\d+\")/).length !== numberOfColumn) {
    countFooterRow++;
    i--;
  }

  return rowArr.slice(0, rowArr.length - countFooterRow)
};

const makeFulfillYfTicker = (nationalCode) => {
  if (nationalCode === null) {
    return (ticker) => ticker;
  } else {
    return (ticker) => ticker + '.' + nationalCode;
  }
};