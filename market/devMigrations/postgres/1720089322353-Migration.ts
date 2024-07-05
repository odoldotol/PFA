import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720089322353 implements MigrationInterface {
    name = 'Migration1720089322353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_assets" ADD "regular_market_previous_close" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_assets" DROP COLUMN "regular_market_previous_close"`);
    }

}
