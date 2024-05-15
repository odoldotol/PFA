const fs = require('fs');
const path = require("path");

module.exports = (
  chartConfig,
  clArgs,
  taskDirname,
) => (value) => {
  const { 
    chartFileName,
    execfileName,
    limit,
  } = {
    ...chartConfig,
    ...clArgs
  };

  const pathToWrite = path.join(
    taskDirname,
    'responseBody',
    execfileName
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

  const filePathToWriteBuilder = new FilePathToWriteBuilder();

  const filePathToWrite
  = filePathToWriteBuilder
  .setPathToWrite(pathToWrite)
  .setChartFileName(chartFileName)
  .setLimit(limit)
  .setTimestamp(timestamp)
  .build();

  // Write!!
  fs.writeFileSync(
    filePathToWrite,
    JSON.stringify(value, null, 2)
  );

  console.log(`Response body has been saved as '${filePathToWriteBuilder.buildFileName()}'`);
};

class FilePathToWriteBuilder {
  #pathToWrite
  #chartFileName
  #limit
  #timestamp

  setPathToWrite(pathToWrite) {
    this.#pathToWrite = pathToWrite;
    return this;
  }

  setChartFileName(chartFileName) {
    this.#chartFileName = chartFileName;
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
    return `${this.#chartFileName}.limit-${this.#limit}.timestamp-${this.#timestamp}.json`;
  }

  build() {
    return path.join(
      this.#pathToWrite,
      this.buildFileName()
    );
  }
}
