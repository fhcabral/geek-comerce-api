import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770683947748 implements MigrationInterface {
    name = 'AutoMigration1770683947748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sale_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "saleId" uuid NOT NULL, "productId" uuid NOT NULL, "nameSnapshot" character varying(255) NOT NULL, "skuSnapshot" character varying(100), "unitPriceSnapshot" numeric(10,2) NOT NULL, "quantity" integer NOT NULL, "lineTotal" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c642be08de5235317d4cf3deb4" ON "sale_items" ("saleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d675aea38a16313e844662c48f" ON "sale_items" ("productId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8b158e0e99d1bd3436f03bfabb" ON "sale_items" ("saleId", "productId") `);
        await queryRunner.query(`CREATE TYPE "public"."sales_status_enum" AS ENUM('DRAFT', 'CONFIRMED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."sales_status_enum" NOT NULL DEFAULT 'DRAFT', "total" numeric(10,2) NOT NULL DEFAULT '0', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_83e1f4b8d3b863cce4846e0295" ON "sales" ("status") `);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_c642be08de5235317d4cf3deb40" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_c642be08de5235317d4cf3deb40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83e1f4b8d3b863cce4846e0295"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`DROP TYPE "public"."sales_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b158e0e99d1bd3436f03bfabb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d675aea38a16313e844662c48f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c642be08de5235317d4cf3deb4"`);
        await queryRunner.query(`DROP TABLE "sale_items"`);
    }

}
