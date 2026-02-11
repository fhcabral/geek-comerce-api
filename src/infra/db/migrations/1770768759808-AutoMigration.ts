import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770768759808 implements MigrationInterface {
    name = 'AutoMigration1770768759808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('PIX', 'CASH', 'CARD', 'TRANSFER')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('PAID', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sale_id" uuid NOT NULL, "method" "public"."payments_method_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PAID', "paidAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a9272c4415ef64294b104e378a" ON "payments" ("sale_id") `);
        await queryRunner.query(`ALTER TYPE "public"."sales_status_enum" RENAME TO "sales_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sales_status_enum" AS ENUM('DRAFT', 'CONFIRMED', 'PAID', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "status" TYPE "public"."sales_status_enum" USING "status"::"text"::"public"."sales_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."sales_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sales_status_enum_old" AS ENUM('DRAFT', 'CONFIRMED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "status" TYPE "public"."sales_status_enum_old" USING "status"::"text"::"public"."sales_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sales" ALTER COLUMN "status" SET DEFAULT 'DRAFT'`);
        await queryRunner.query(`DROP TYPE "public"."sales_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sales_status_enum_old" RENAME TO "sales_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9272c4415ef64294b104e378a"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
    }

}
