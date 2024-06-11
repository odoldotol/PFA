import { DataSource, MigrationInterface } from "typeorm";

export const migrationRun = async (
  migrationClass: { new(): MigrationInterface },
  dataSource: DataSource
) => {
  const migration = new migrationClass();
  const queryRunner = dataSource.createQueryRunner();
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await migration.up(queryRunner);
    await queryRunner.commitTransaction();
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
};