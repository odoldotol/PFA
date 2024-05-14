const fs = require('fs');

module.exports = (
  process,
  filePathToRead
) => {
  const tickerArr = [];

  const limit = Number(process.argv[3]);
  const csvLine = fs.readFileSync(filePathToRead, 'utf8').split('\n');  
  for (let i = 1; i < csvLine.length; i++) {
    if (tickerArr.length < limit) {
      tickerArr.push(csvLine[i].split(',')[0]);
    } else {
      break;
    }
  }

  return tickerArr;
};