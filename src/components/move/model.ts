import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Field, Int, ObjectType } from 'type-graphql';
import { Game } from "../game";

@ObjectType()
@Entity()
export class Move {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    playerId: string;

    @Field(() => Int)
    @Column()
    move: number;

    @ManyToOne(() => Game, game => game.moves)
    game: Game;

}
