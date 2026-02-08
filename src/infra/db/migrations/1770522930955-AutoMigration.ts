import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770522930955 implements MigrationInterface {
    name = 'AutoMigration1770522930955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "url" text NOT NULL, "position" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4f166bb8c2bfcef2498d97b406" ON "product_images" ("product_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4f166bb8c2bfcef2498d97b406"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
    }

}
