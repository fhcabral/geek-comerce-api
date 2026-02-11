import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1770765179391 implements MigrationInterface {
    name = 'AutoMigration1770765179391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" ADD "customerName" text`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "customerCpf" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "customerCpf"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "customerName"`);
    }

}
