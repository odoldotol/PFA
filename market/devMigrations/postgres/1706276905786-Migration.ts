import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1706276905786 implements MigrationInterface {
    name = 'Migration1706276905786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exchanges" ("iso_code" character(4) NOT NULL, "iso_timezonename" character varying(30) NOT NULL, "market_date" character(10) NOT NULL, CONSTRAINT "exchanges_iso_code_pkey" PRIMARY KEY ("iso_code"))`);
        await queryRunner.query(`CREATE TABLE "financial_assets" ("symbol" character varying(20) NOT NULL, "quote_type" character varying(30) NOT NULL, "short_name" character varying(100), "long_name" character varying(200), "currency" character(3) NOT NULL, "regular_market_last_close" double precision NOT NULL, "exchange" character(4), CONSTRAINT "financial_assets_symbol_pkey" PRIMARY KEY ("symbol"))`);
        await queryRunner.query(`CREATE INDEX "IDX_financial_assets_exchange-symbol" ON "financial_assets" ("exchange", "symbol") `);
        await queryRunner.query(`ALTER TABLE "financial_assets" ADD CONSTRAINT "financial_assets_exchange_fkey" FOREIGN KEY ("exchange") REFERENCES "exchanges"("iso_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "financial_assets" DROP CONSTRAINT "financial_assets_exchange_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_financial_assets_exchange-symbol"`);
        await queryRunner.query(`DROP TABLE "financial_assets"`);
        await queryRunner.query(`DROP TABLE "exchanges"`);
    }

}
