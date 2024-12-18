/*
  sql 에 market_date 가 없어 기본값으로 인서트되면
  프로덕트서버에서 이 자산의 데이터가 up-to-date 가 아닌것으로 판단하고
  결국 절대로 캐싱을 이용 못하고 계속 마켓서버에 http 날려서 postgres 읽는다.

  항상 up-to-date 로 판단할 상수값을 서버에 설정하고 이를 sql 에 넣기위한 스크립트다.
*/

const fs = require('fs');
const path = require('path');

const sqlFileNames = [
  'insert.kosdaq-all-05-13-2024-cut-1-500.T20240604.sql',
  'insert.kosdaq-all-05-13-2024-cut-501-1000.T20240604.sql',
  'insert.kospi-all-05-13-2024.T20240604.sql',
  'insert.russell-1000-index-05-13-2024.T20240604.sql',
  'insert.russell-2000-index-05-14-2024-page-1.T20240604.sql',
];

sqlFileNames.forEach((sqlFileName) => {
  const arr = fs.readFileSync(path.join(__dirname, sqlFileName))
  .toString()
  .split('\n');

  let injectColumn = false;
  for (let i = 0; i < arr.length; i++) {
    if (
      !injectColumn &&
      arr[i].match(/exchange/) &&
      !arr[i].endsWith(',')
    ) {
      arr[i] = arr[i] + ',';
      arr.splice(i + 1, 0, "    market_date");
      injectColumn = true;
      i++;
    }

    if (arr[i].match(/XKRX|XNYS/) && !arr[i].endsWith(',')) {
      arr[i] = arr[i] + ',';
      arr.splice(i + 1, 0, "      '9999-99-99'");
      i++;
    }
  }

  fs.writeFileSync(path.join(__dirname, sqlFileName), arr.join('\n'));
});