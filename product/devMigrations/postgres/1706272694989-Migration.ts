import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1706272694989 implements MigrationInterface {
    name = 'Migration1706272694989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "kakao_chatbot_user_key" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_951b8f1dfc94ac1d0301a14b7e1" UNIQUE ("uuid"), CONSTRAINT "UQ_50ccee95ca0d3beddbad4baa1a5" UNIQUE ("kakao_chatbot_user_key"), CONSTRAINT "users_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_users_kakao_chatbot_user_key-id" ON "users" ("kakao_chatbot_user_key", "id") `);
        await queryRunner.query(`CREATE TABLE "asset_subscriptions" ("id" bigint GENERATED ALWAYS AS IDENTITY NOT NULL, "ticker" character varying(15) NOT NULL, "activate" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_asset_subscriptions_user_id-ticker" UNIQUE ("user_id", "ticker"), CONSTRAINT "asset_subscriptions_id_pkey" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_asset_subscriptions_user_id-updated_at-ticker-activate" ON "asset_subscriptions" ("user_id", "updated_at", "ticker", "activate") `);
        await queryRunner.query(`CREATE INDEX "IDX_asset_subscriptions_user_id-ticker-activate" ON "asset_subscriptions" ("user_id", "ticker", "activate") `);
        await queryRunner.query(`ALTER TABLE "asset_subscriptions" ADD CONSTRAINT "asset_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_subscriptions" DROP CONSTRAINT "asset_subscriptions_user_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_asset_subscriptions_user_id-ticker-activate"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_asset_subscriptions_user_id-updated_at-ticker-activate"`);
        await queryRunner.query(`DROP TABLE "asset_subscriptions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_kakao_chatbot_user_key-id"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
