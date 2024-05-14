const path = require("path");
const { Chart } = require("./const");

module.exports = (
  process,
  dirname
) => {
  const argv = process.argv;
  const execfileName = argv[1].split('/').pop();
  
  let
  filePathToRead,
  filePathToWriteBuilder
  chartFileName = '',
  chartFileExtension = '';

  try {
    ({
      fileName: chartFileName,
      fileExtension: chartFileExtension
    } = Chart[argv[2]]);
  } catch {
    throw new Error(`Invalid argument: '${argv[2]}'`);
  }
  
  filePathToRead = path.join(
    path.join(dirname, 'data', 'chart'),
    chartFileName + '.' + chartFileExtension
  );

  filePathToWriteBuilder = new FilePathToWriteBuilder()
  .setPathToWrite(path.join(dirname, 'responseBody', execfileName))
  .setChartName(chartFileName)
  .setLimit(Number(argv[3]))

  return {
    filePathToRead,
    filePathToWriteBuilder,
  };
};

class FilePathToWriteBuilder {
  #pathToWrite
  #chartNAme
  #limit
  #timestamp

  getName() {
    return this.#chartNAme;
  }

  getPath() {
    return this.#pathToWrite;
  }

  setPathToWrite(pathToWrite) {
    this.#pathToWrite = pathToWrite;
    return this;
  }

  setChartName(chartName) {
    this.#chartNAme = chartName;
    return this;
  }

  setLimit(limit) {
    this.#limit = limit;
    return this;
  }

  setTimestamp(timestamp) {
    this.#timestamp = timestamp;
    return this;
  }

  buildFileName() {
    return `${this.#chartNAme}.limit-${this.#limit}.timestamp-${this.#timestamp}.json`;
  }

  build() {
    return path.join(
      this.#pathToWrite,
      this.buildFileName()
    );
  }
}
