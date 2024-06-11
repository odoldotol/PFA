export default function (
  tickerArr: string[],
  userNum: number
): string[][] {
  const result: string[][] = [];

  for (let i = 0; i < userNum; i++) {
    const tickerArrClone = tickerArr.slice();
    const subscriptionNum = getSubscriptionNum();
    const tickerIdxArr = getSubscriptionTickerIndexArr(subscriptionNum);

    const subscriptions = [];

    for (let j = 0; j < tickerIdxArr.length; j++) {
      let tickerIdx = tickerIdxArr[j]!;
      if (tickerArrClone.length <= tickerIdx) {
        tickerIdx = tickerIdx - tickerArrClone.length;
      }

      const ticker = tickerArrClone.splice(tickerIdx, 1)[0]!;
      subscriptions.push(ticker);

      recordDistributionMonitor(tickerIdx);
    }

    result.push(subscriptions);
  }

  logDistributionMonitor(userNum);

  return result;
};

function getSubscriptionTickerIndexArr(len: number) {
  const result = [];

  for (let i = 0; i < len; i++) {
    let index = generateNormalDistribution(
      0,
      250
    );

    // 분포 보정 + 양의정수화
    index = 0.0025 * (index * index);
    index = Math.floor(index);

    result.push(index);
  }

  return result;
}

function getSubscriptionNum() {
  let result = generateNormalDistribution(
    10,
    5
  );

  // 줄어드는 값은 좀 올리고
  if (result <= 7) {
    result += 3;
  }

  // 음수 부분은 양수부로 날리고
  if (result < 0) {
    result = result * -1;
  }

  // 1 이하면 1로(최소 하나이상 구독하도록 하자)
  if (result < 1) {
    result += 1;
  }

  // 양의정수로 변환
  return Math.floor(Math.abs(result));
}

/**
 * Box-Muller 변환 알고리즘을 사용하여 정규 분포를 따르는 값을 생성
 */
function generateNormalDistribution(
  mean: number,
  stdDev: number
) {
  let u1, u2, z1;

  do {
      u1 = Math.random();
      u2 = Math.random();
      z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  } while (isNaN(z1));

  return mean + stdDev * z1;
}

let
num0 = 0,
num1_4 = 0,
num5_14 = 0,
num15_34 = 0,
num35_74 = 0,
num75_149 = 0,
num150_299 = 0,
num300_599 = 0,
num600_1199 = 0,
num1200_2399 = 0,
num2400_3915 = 0;

function recordDistributionMonitor(tickerIdx: number) {
  if (tickerIdx === 0) num0++;
  else if (tickerIdx >= 1 && tickerIdx <= 4) num1_4++;
  else if (tickerIdx >= 5 && tickerIdx <= 14) num5_14++;
  else if (tickerIdx >= 15 && tickerIdx <= 34) num15_34++;
  else if (tickerIdx >= 35 && tickerIdx <= 74) num35_74++;
  else if (tickerIdx >= 75 && tickerIdx <= 149) num75_149++;
  else if (tickerIdx >= 150 && tickerIdx <= 299) num150_299++;
  else if (tickerIdx >= 300 && tickerIdx <= 599) num300_599++;
  else if (tickerIdx >= 600 && tickerIdx <= 1199) num600_1199++;
  else if (tickerIdx >= 1200 && tickerIdx <= 2399) num1200_2399++;
  else if (tickerIdx >= 2400 && tickerIdx <= 3916) num2400_3915++;
}

function logDistributionMonitor(userNum: number) {
  const pRate = 100;
  console.log(`[getSubscriptionsArr]: 구독 분포
  0: ${num0}, P(%): ${num0 / userNum * pRate},
  1~4: ${num1_4}, avg: ${num1_4 / 4}, P(%): ${num1_4 / 4 / userNum * pRate},
  5~14: ${num5_14}, avg: ${num5_14 / 10}, P(%): ${num5_14 / 10 / userNum * pRate},
  15~34: ${num15_34}, avg: ${num15_34 / 20}, P(%): ${num15_34 / 20 / userNum * pRate},
  35~74: ${num35_74}, avg: ${num35_74 / 40}, P(%): ${num35_74 / 40 / userNum * pRate},
  75~149: ${num75_149}, avg: ${num75_149 / 75}, P(%): ${num75_149 / 75 / userNum * pRate},
  150~299: ${num150_299}, avg: ${num150_299 / 150}, P(%): ${num150_299 / 150 / userNum * pRate},
  300~599: ${num300_599}, avg: ${num300_599 / 300}, P(%): ${num300_599 / 300 / userNum * pRate},
  600~1199: ${num600_1199}, avg: ${num600_1199 / 600}, P(%): ${num600_1199 / 600 / userNum * pRate},
  1200~2399: ${num1200_2399}, avg: ${num1200_2399 / 1200}, P(%): ${num1200_2399 / 1200 / userNum * pRate},
  2400~3915: ${num2400_3915}, avg: ${num2400_3915 / 1516}, P(%): ${num2400_3915 / 1516 / userNum * pRate}`);
}
