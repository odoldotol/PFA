const fs = require('fs');
const http = require('http');
const path = require("path");

const args = process.argv.slice(2);

let
pathToRead,
pathToWrite,
filePathToRead,
filePathToWrite;
if (args[0] === 'russell1000') {
  pathToRead = path.join(__dirname, 'data', 'chart');
  pathToWrite = path.join(__dirname, 'responseBody', 'childApiTest');
} else {
  throw new Error(`Invalid argument: '${args[0]}'`);
}

const limit = Number(args[1]);
const apiFlag = args[2];

filePathToRead = path.join(pathToRead, 'russell-1000-index-05-13-2024.csv');
const russel1000csvLine = fs.readFileSync(filePathToRead, 'utf8').split('\n');

const tickerArr = [];

for (let i = 1; i < russel1000csvLine.length; i++) {
  if (tickerArr.length < limit) {
    tickerArr.push(russel1000csvLine[i].split(',')[0]);
  } else {
    break;
  }
}

const options = {
  hostname: '127.0.0.1',
  port: 8001,
  path: '/yf/info',
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

const makeHttpClientRequest = (
  options,
  endCb,
  errCb = console.error
) => {
  return http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
  
    res.on('end', () => {
      endCb(JSON.parse(body));
    });

    res.on('error', errCb);
  });
};

const writeBody = (value) => {
  if (!fs.existsSync(pathToWrite)) {
    fs.mkdirSync(pathToWrite, { recursive: true });
  }

  const timestamp = new Date().toLocaleString('en-GB').replace(/\/|,|:| /g, '-');
  const fileNAme = `russell-1000-index-05-13-2024.limit-${limit}.timestamp-${timestamp}.json`;
  filePathToWrite = path.join(pathToWrite, fileNAme);
  fs.writeFileSync(filePathToWrite, JSON.stringify(value, null, 2));

  console.log(`Response body has been saved as '${fileNAme}'`);
};

if (apiFlag) {
  makeHttpClientRequest(
    options,
    writeBody
  ).end(JSON.stringify(tickerArr));
} else {
  const path = options.path;

  Promise.all(tickerArr.map(ticker => {
    options.path = path + '/' + ticker;

    return new Promise((
      resolve,
      reject
    ) => {
      makeHttpClientRequest(
        options,
        resolve,
        reject
      ).end();
    }).catch((err) => err);
  })).then(writeBody);
}
