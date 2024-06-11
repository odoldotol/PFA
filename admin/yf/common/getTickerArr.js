const fs = require('fs');
const path = require("path");
const {
  popFooterFromCsvRow,
  makeFulfillYfTicker
} = require('./chart');

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