const fs = require('fs');
const path = require('path');

// dotenv 때문에 npm 쓰기 귀찮아서
const env = fs.readFileSync(path.join(__dirname, '..', '..', '.env'), 'utf8');
env.split('\n').forEach(v => {
  const [key, value] = v.split('=');
  process.env[key] = value;
});

const ChartName = {
  RUSSELL1000: 'russell1000',
  RUSSELL2000_1: 'russell2000_1',
  RUSSELL2000_2: 'russell2000_2',
  KOSPI: 'kospi',
  KOSDAQ: 'kosdaq',
};

module.exports = {
  [ChartName.RUSSELL1000]: {
    fileName: process.env[ChartName.RUSSELL1000],
    fileExtension: 'csv',
    yfNationalCode: null,
  },
  [ChartName.RUSSELL2000_1]: {
    fileName: process.env[ChartName.RUSSELL2000_1],
    fileExtension: 'csv',
    yfNationalCode: null,
  },
  [ChartName.RUSSELL2000_2]: {
    fileName: process.env[ChartName.RUSSELL2000_2],
    fileExtension: 'csv',
    yfNationalCode: null,
  },
  [ChartName.KOSPI]: {
    fileName: process.env[ChartName.KOSPI],
    fileExtension: 'csv',
    yfNationalCode: 'KS',
  },
  [ChartName.KOSDAQ]: {
    fileName: process.env[ChartName.KOSDAQ],
    fileExtension: 'csv',
    yfNationalCode: 'KQ',
  },
};