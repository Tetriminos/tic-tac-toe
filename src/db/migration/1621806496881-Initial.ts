import {MigrationInterface, QueryRunner} from 'typeorm';

export class Initial1621806496881 implements MigrationInterface {
    name = 'Initial1621806496881';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "move" ("id" SERIAL NOT NULL, "playerId" character varying NOT NULL, "move" integer NOT NULL, "gameId" integer, CONSTRAINT "PK_0befa9c6b3a216e49c494b4acc5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "board" character varying NOT NULL, "player1Id" character varying NOT NULL, "player1UUID" character varying NOT NULL, "player2Id" text, "player2UUID" text, "turn" integer NOT NULL, "currentTurnPlayer" text, "isGameOver" boolean NOT NULL, "isTie" boolean NOT NULL, "winner" text, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "move" ADD CONSTRAINT "FK_e7d286bcab2828876ab2eef3515" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "move" DROP CONSTRAINT "FK_e7d286bcab2828876ab2eef3515"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TABLE "move"`);
    }

}
