const fs = require('fs');
const path = require("path");
const getTestTickerArr = require('./common/getTestTickerArr');

const pathToWrite = path.join(
  __dirname,
  'data',
  'testTickers'
);

// Create directory if not exists
if (!fs.existsSync(pathToWrite)) {
  fs.mkdirSync(
    pathToWrite,
    { recursive: true }
  );
}

const timestamp = new Date()
.toLocaleString('en-GB')
.replace(/\/|,|:| /g, '-');

const fileNameToWrite = `testTickers-${timestamp}.json`;

const filePathToWrite = path.join(
  pathToWrite,
  fileNameToWrite
);

// Write!!
fs.writeFileSync(
  filePathToWrite,
  JSON.stringify(
    getTestTickerArr(),
    null,
    2
  )
);

console.log(`testTickerArr has been saved as '${fileNameToWrite}'`);