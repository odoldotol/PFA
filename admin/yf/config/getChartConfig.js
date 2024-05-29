const { Chart } = require("./const");

module.exports = (chartName) => {
  const chartConfig = Chart[chartName];
  if (chartConfig) {
    return {
      chartFileName: chartConfig.fileName,
      chartFileExtension: chartConfig.fileExtension,
      chartYfNationalCode: chartConfig.yfNationalCode,
    };
  } else {
    throw new Error(`Invalid chartName: '${chartName}'`);
  }
};