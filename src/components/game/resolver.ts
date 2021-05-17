import { PubSubEngine } from 'graphql-subscriptions';
import {
    Resolver,
    Mutation,
    Arg,
    Int,
    Query,
    Subscription,
    Root,
    PubSub,
} from 'type-graphql';

import { Game, GameService } from '.';
import {
    NewGameInput,
    JoinGameInput,
    MakeAMoveInput,
    CreateAGameOutput,
    JoinAGameOutput,
    GameOutput,
    GameEvent,
} from './types';

@Resolver()
export class GameResolver {
    constructor(
        private gameService: GameService,
    ) {}

    @Mutation(() => CreateAGameOutput)
    async createGame(
        @Arg('options', () => NewGameInput) { playerId, isSingleplayer }: NewGameInput,
        @PubSub() pubsub: PubSubEngine,
    ): Promise<Game> {
        return await this.gameService.createGame(playerId, isSingleplayer, pubsub);
    }

    @Mutation(() => JoinAGameOutput)
    async joinGame(
        @Arg('options', () => JoinGameInput) { gameId, playerId }: JoinGameInput,
        @PubSub() pubsub: PubSubEngine,
    ): Promise<Game> {
        return await this.gameService.joinGame(gameId, playerId, pubsub);
    }

    @Mutation(() => GameOutput)
    async makeAMove(
        @Arg('options', () => MakeAMoveInput) { gameId, playerId, move, playerUUID }: MakeAMoveInput,
        @PubSub() pubsub: PubSubEngine,
    ): Promise<Game> {
        return await this.gameService.makeAMove(gameId, playerId, move, pubsub, playerUUID);
    }

    @Query(() => GameOutput)
    async getGame(@Arg('id', () => Int) id: number): Promise<Game> {
        return await this.gameService.getGame(id);
    }

    @Subscription(() => GameEvent, {
        topics: ['GAME_EVENTS'],
        // return events only for the subscribed game
        filter: ({ payload, args }) => args.id === payload.id,
    })
    gameUpdate(
        @Root() game: Game,
        // require game id so that we only receive events for the subscribed game
        @Arg('id', () => Number) _id: number,
    ): Game {
        return game;
    }
}
