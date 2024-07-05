import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720189353252 implements MigrationInterface {
    name = 'Migration1720189353252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_assets" ADD "market_date" character(10) NOT NULL DEFAULT '0000-00-00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_assets" DROP COLUMN "market_date"`);
    }

}
