import { Repository } from 'typeorm';
import { Game, GameService } from '../../src/components/game';
import { Move, MoveService } from '../../src/components/move';
import { UnauthenticatedError } from '../../src/components/game/errors';

import { FakeMoveRepository, FakeGameRepository, FakePubSub } from './fakes';

let gameService: GameService;
let fakePubSub: any;

beforeEach(() => {
    const fakeMoveRepository = new FakeMoveRepository();
    const moveService = new MoveService((fakeMoveRepository as unknown) as Repository<Move>);
    const fakeGameRepository = new FakeGameRepository();
    fakePubSub = new FakePubSub();
    gameService = new GameService(moveService, (fakeGameRepository as unknown) as Repository<Game>);
});

test('Can create a multiplayer game', async () => {
    const PLAYER_ID = '3';
    const IS_SINGLEPLAYER = false;
    const EMPTY_BOARD = '_________';

    const game = await gameService.createGame(PLAYER_ID, IS_SINGLEPLAYER, fakePubSub);
    expect(game.id).toBe(1);
    expect(game.board).toBe(EMPTY_BOARD);
    expect(game.currentTurnPlayer).toBe(PLAYER_ID);
    expect(game.isGameOver).toBe(false);
    expect(game.isTie).toBe(false);
    expect(game.player1Id).toBe(PLAYER_ID);
    expect(game.player1UUID).not.toBe(null);
    expect(game.player2Id).toBe(null);
    expect(game.turn).toBe(0);
    expect(game.winner).toBe(null);
    expect(fakePubSub.messages[0].event).toEqual('GAME_CREATED');
});

test('Can create a singleplayer game', async () => {
    const PLAYER_ID = '3';
    const IS_SINGLEPLAYER = true;
    const EMPTY_BOARD = '_________';

    const game = await gameService.createGame(PLAYER_ID, IS_SINGLEPLAYER, fakePubSub);
    expect(game.id).toBe(1);
    expect(game.board).toBe(EMPTY_BOARD);
    expect(game.currentTurnPlayer).toBe(PLAYER_ID);
    expect(game.isGameOver).toBe(false);
    expect(game.isTie).toBe(false);
    expect(game.player1Id).toBe(PLAYER_ID);
    expect(game.player1UUID).not.toBe(null);
    expect(game.player2Id).toBe('AI');
    expect(game.turn).toBe(0);
    expect(game.winner).toBe(null);
    expect(fakePubSub.messages[0].event).toEqual('GAME_CREATED');
});

test('Can join a multiplayer game', async () => {
    const PLAYER1_ID = '3';
    const IS_SINGLEPLAYER = false;

    await gameService.createGame(PLAYER1_ID, IS_SINGLEPLAYER, fakePubSub);
    expect(fakePubSub.messages[0].event).toEqual('GAME_CREATED');

    const PLAYER2_ID = 'sinisha';
    const GAME_ID = 1;
    const EMPTY_BOARD = '_________';
    const game = await gameService.joinGame(GAME_ID, PLAYER2_ID, fakePubSub)
    expect(game.id).toBe(1);
    expect(game.board).toBe(EMPTY_BOARD);
    expect(game.currentTurnPlayer).toBe(PLAYER1_ID);
    expect(game.isGameOver).toBe(false);
    expect(game.isTie).toBe(false);
    expect(game.player1Id).toBe(PLAYER1_ID);
    expect(game.player1UUID).not.toBe(null);
    expect(game.player2Id).toBe(PLAYER2_ID);
    expect(game.player2UUID).not.toBe(null);
    expect(game.turn).toBe(0);
    expect(game.winner).toBe(null);
    expect(fakePubSub.messages[1].event).toEqual('GAME_JOINED');
});

test('Can take a turn in a singleplayer game', async () => {
    const PLAYER1_ID = '3';
    const IS_SINGLEPLAYER = true;

    const { player1UUID } = await gameService.createGame(PLAYER1_ID, IS_SINGLEPLAYER, fakePubSub);

    expect(fakePubSub.messages[0].event).toEqual('GAME_CREATED');

    const GAME_ID = 1;
    const MOVE = 2;
    const BOARD_AFTER_MOVE = '_X_______';

    const game = await gameService.makeAMove(GAME_ID, PLAYER1_ID, MOVE, fakePubSub, player1UUID);
    expect(game.id).toBe(1);
    expect(game.board).toBe(BOARD_AFTER_MOVE);
    expect(game.currentTurnPlayer).toBe('AI');
    expect(game.isGameOver).toBe(false);
    expect(game.isTie).toBe(false);
    expect(game.player1Id).toBe(PLAYER1_ID);
    expect(game.player2Id).toBe('AI');
    expect(game.turn).toBe(1);
    expect(game.winner).toBe(null);
    expect(fakePubSub.messages[1].event).toEqual('MOVE_MADE');
});

test('Can not take a turn if not authenticated', async () => {
    const PLAYER1_ID = '3';
    const IS_SINGLEPLAYER = true;

    await gameService.createGame(PLAYER1_ID, IS_SINGLEPLAYER, fakePubSub);

    expect(fakePubSub.messages[0].event).toEqual('GAME_CREATED');

    const GAME_ID = 1;
    const MOVE = 2;
    const WRONG_PLAYER_UUID = 'definitelyNotAnUUID';

    await expect(gameService.makeAMove(GAME_ID, PLAYER1_ID, MOVE, fakePubSub, WRONG_PLAYER_UUID)).rejects.toThrow(UnauthenticatedError);
});
