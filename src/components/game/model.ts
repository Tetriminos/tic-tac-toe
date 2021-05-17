import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Move } from '../move';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    board: string;

    @Column()
    player1Id: string;

    @Column()
    player1UUID: string;

    @Column('text', { nullable: true })
    player2Id: string | null;

    @Column('text', { nullable: true })
    player2UUID: string;

    @Column()
    turn: number;

    @Column('text', { nullable: true })
    currentTurnPlayer: string | null;

    @Column()
    isGameOver: boolean;

    @Column()
    isTie: boolean;

    @Column('text', { nullable: true })
    winner: string | null;

    @OneToMany(() => Move, move => move.game)
    moves: Move[];
}
