import { readFileSync } from 'fs';
import * as path from 'path';
import getTestSubscriptionsArr from './getTestSubscriptionsArr';

export const getSeedAssetSubscriptionsQuery = (
  userNum: number,
  usersIdSeq: number
): string => {
  const q1 = `
INSERT INTO asset_subscriptions
  (id, user_id, ticker)
  VALUES`;

  const TICKERS_FILE_NAME = 'kakao-chatbot_api_benchmark_dev.json';

  const tickerArr: string[] = JSON.parse(readFileSync(path.join(
    __dirname,
    '../..',
    'data/tickers',
    TICKERS_FILE_NAME
  ), 'utf8'));

  const testSubscriptionsArr = getTestSubscriptionsArr(
    tickerArr,
    userNum
  );

  console.log(`[getSeedAssetSubscriptionsQuery] tickers file name: `, TICKERS_FILE_NAME);
  console.log(`[getSeedAssetSubscriptionsQuery] tickers file ticker 갯수: `, tickerArr.length);

  let numberOfRecord = 0;
  const insertValues = testSubscriptionsArr.map((
    subscriptions,
    idx
  ) => {
    numberOfRecord += subscriptions.length;
    const userId = usersIdSeq + idx;
    return subscriptions.map(ticker => `
    (DEFAULT, ${userId}, '${ticker}')`).join(',');
  }).join(',');
  console.log(`[getSeedAssetSubscriptionsQuery] insert 할 asset_subscriptions 레코드 갯수: `, numberOfRecord);

  return q1 + insertValues + ';';
};