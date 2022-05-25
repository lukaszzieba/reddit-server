import { MigrationInterface, QueryRunner } from "typeorm";

export class updoot1653055730899 implements MigrationInterface {
    name = 'updoot1653055730899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "updoot" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "userId" integer, "postId" integer, CONSTRAINT "PK_24daedd60e50a4ae5e67229c2cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "updoot" ADD CONSTRAINT "FK_9df9e319a273ad45ce509cf2f68" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "updoot" ADD CONSTRAINT "FK_fd6b77bfdf9eae6691170bc9cb5" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "updoot" DROP CONSTRAINT "FK_fd6b77bfdf9eae6691170bc9cb5"`);
        await queryRunner.query(`ALTER TABLE "updoot" DROP CONSTRAINT "FK_9df9e319a273ad45ce509cf2f68"`);
        await queryRunner.query(`DROP TABLE "updoot"`);
    }

}
