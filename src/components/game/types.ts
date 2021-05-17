import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Move } from "../move";

@InputType()
class NewGameInput {
    @Field()
    playerId: string;

    @Field(() => Boolean)
    isSingleplayer: boolean;
}

@InputType()
class JoinGameInput {
    @Field(() => Int)
    gameId: number;

    @Field()
    playerId: string;
}

@InputType()
class MakeAMoveInput {
    @Field(() => Int)
    gameId: number;

    @Field()
    playerId: string;

    @Field()
    playerUUID: string;

    @Field(() => Int)
    move: number;
}

@ObjectType()
class CreateAGameOutput {
    @Field(() => Int)
    id: number;

    @Field()
    board: string;

    @Field()
    player1Id: string;

    @Field()
    player1UUID: string;

    @Field(() => String, { nullable: true })
    player2Id: string | null;

    @Field(() => Int)
    turn: number;

    @Field(() => String, { nullable: true })
    currentTurnPlayer: string | null;

    @Field()
    isGameOver: boolean;

    @Field()
    isTie: boolean;

    @Field(() => String, { nullable: true })
    winner: string | null;

    @Field(() => [Move], { nullable: true })
    moves: Move[];
}

@ObjectType()
class JoinAGameOutput {
    @Field(() => Int)
    id: number;

    @Field()
    board: string;

    @Field()
    player1Id: string;

    @Field(() => String, { nullable: true })
    player2Id: string | null;

    @Field()
    player2UUID: string;

    @Field(() => Int)
    turn: number;

    @Field(() => String, { nullable: true })
    currentTurnPlayer: string | null;

    @Field()
    isGameOver: boolean;

    @Field()
    isTie: boolean;

    @Field(() => String, { nullable: true })
    winner: string | null;

    @Field(() => [Move], { nullable: true })
    moves: Move[];
}

@ObjectType()
class GameOutput {
    @Field(() => Int)
    id: number;

    @Field()
    board: string;

    @Field()
    player1Id: string;

    @Field(() => String, { nullable: true })
    player2Id: string | null;

    @Field(() => Int)
    turn: number;

    @Field(() => String, { nullable: true })
    currentTurnPlayer: string | null;

    @Field()
    isGameOver: boolean;

    @Field()
    isTie: boolean;

    @Field(() => String, { nullable: true })
    winner: string | null;

    @Field(() => [Move], { nullable: true })
    moves: Move[];
}

@ObjectType()
class GameEvent {
    @Field(() => Int)
    id: number;

    @Field()
    board: string;

    @Field()
    player1Id: string;

    @Field(() => String, { nullable: true })
    player2Id: string | null;

    @Field(() => Int)
    turn: number;

    @Field(() => String, { nullable: true })
    currentTurnPlayer: string | null;

    @Field()
    isGameOver: boolean;

    @Field()
    isTie: boolean;

    @Field(() => String, { nullable: true })
    winner: string | null;

    @Field(() => [Move], { nullable: true })
    moves: Move[];

    @Field()
    event: string;
}

export {
    NewGameInput,
    JoinGameInput,
    MakeAMoveInput,
    CreateAGameOutput,
    JoinAGameOutput,
    GameOutput,
    GameEvent,
};
