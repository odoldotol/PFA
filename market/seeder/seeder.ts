import { DataSource } from "typeorm";

export default async function (
  dataSource: DataSource,
  queryArr: { name: string, query: string }[]
) {
  const logger = {
    log: (msg: string) => console.log(`[seeder] - ${getTimestamp()} | ${msg}`),
  };

  const queryRunner = dataSource.createQueryRunner();
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    for (const query of queryArr) {
      logger.log(`${query.name} 실행중...`);
      await queryRunner.query(query.query);
      logger.log(`${query.name} 완료!!`);
    }

    await queryRunner.commitTransaction();
    logger.log(`Completed`);
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
    logger.log(`Rollbacked`);
  } finally {
    await queryRunner.release();
  }
};

function getTimestamp(): string {
  return new Date().toLocaleString(
    "en-GB",
    { timeZone: "Asia/Seoul" }
  );
}
