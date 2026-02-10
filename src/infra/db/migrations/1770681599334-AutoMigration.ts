import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770681599334 implements MigrationInterface {
    name = 'AutoMigration1770681599334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'`);
    }

}
