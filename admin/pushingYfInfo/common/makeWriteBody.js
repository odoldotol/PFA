const fs = require('fs');

module.exports = (filePathToWriteBuilder) => (value) => {
  const pathToWrite = filePathToWriteBuilder.getPath();
  if (!fs.existsSync(pathToWrite)) {
    fs.mkdirSync(
      pathToWrite,
      { recursive: true }
    );
  }

  const timestamp = new Date()
  .toLocaleString('en-GB')
  .replace(/\/|,|:| /g, '-');

  const filePathToWrite = filePathToWriteBuilder
  .setTimestamp(timestamp)
  .build();

  fs.writeFileSync(
    filePathToWrite,
    JSON.stringify(value, null, 2)
  );

  console.log(`Response body has been saved as '${filePathToWriteBuilder.buildFileName()}'`);
};