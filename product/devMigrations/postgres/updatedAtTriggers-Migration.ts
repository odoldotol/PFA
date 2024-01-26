import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationUpdatedAtTriggers implements MigrationInterface {
  name = 'Migration1706290097579'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE 'plpgsql';`);
    await queryRunner.query(`CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at();`);
    await queryRunner.query(`CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON asset_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER update_asset_subscriptions_updated_at ON asset_subscriptions`);
    await queryRunner.query(`DROP TRIGGER update_users_updated_at ON users`);
    await queryRunner.query(`DROP FUNCTION update_updated_at()`);
  }

}
