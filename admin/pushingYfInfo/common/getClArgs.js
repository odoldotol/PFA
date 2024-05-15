module.exports = (process) => {
  const argv = process.argv;

  const execfileName = argv[1].split('/').pop();
  const chartName = argv[2];
  const limit = Number(argv[3]);
  const apiFlag = argv[4];

  return {
    execfileName,
    chartName,
    limit,
    apiFlag,
  };
};