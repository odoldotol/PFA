const getCLArgs = require('./getClArgs');
const getTickerArr = require('./getTickerArr');
const makeHttpClientRequest = require('./makeHttpClientRequest');
const makeWriteBody = require('./makeWriteBody');
const { getChartConfig } = require('../config');

module.exports = (
  taskProcess,
  taskDirname,
) => {
  const cliArgs = getCLArgs(taskProcess);
  const chartConfig = getChartConfig(cliArgs.chartName);

  return {
    tickerArr: getTickerArr(
      chartConfig,
      cliArgs,
      taskDirname
    ),
    writeBody: makeWriteBody(
      chartConfig,
      cliArgs,
      taskDirname
    ),
    makeHttpClientRequest
  };
};