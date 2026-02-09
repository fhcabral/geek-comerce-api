import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770593843427 implements MigrationInterface {
    name = 'AutoMigration1770593843427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" ADD "path" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_images" DROP COLUMN "path"`);
    }

}
