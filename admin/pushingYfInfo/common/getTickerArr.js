const fs = require('fs');

module.exports = (
  process,
  filePathToRead
) => {
  const tickerArr = [];

  const limit = Number(process.argv[3]);
  const rowArr = fs.readFileSync(filePathToRead, 'utf8').split('\n');

  const colLen = rowArr[0].split(',').length;
  while (rowArr[rowArr.length-1].split(',').length !== colLen) {
    rowArr.pop();
  }

  for (let i = 1; i < rowArr.length; i++) {
    if (tickerArr.length < limit) {
      tickerArr.push(rowArr[i].split(',')[0]);
    } else {
      break;
    }
  }

  return tickerArr;
};