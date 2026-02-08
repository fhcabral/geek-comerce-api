import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770520344315 implements MigrationInterface {
    name = 'AutoMigration1770520344315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "sku" character varying(70) NOT NULL, "price" numeric(10,2) NOT NULL, "cost" numeric(10,2), "stock" integer, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
