import logger from '../../logger';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';

import { Game } from './model';

import { MoveService } from '../move';

import {
    PlayerCannotBeNamedAIError,
    NoGameError,
    Player2HasntJoinedYetError,
    MaximumNumberOfPlayersError,
    NotAnUniqueNameError,
    NotYourTurnError,
    InvalidTurnError,
    GameAlreadyOverError,
    NotYourGameError,
    UnauthenticatedError,
    ServerError,
} from './errors';
import { PubSubEngine } from 'type-graphql';

export class GameService {
    constructor(
        private moveService: MoveService,
        private gameRepository: Repository<Game>,
    ) {}

    public async createGame(player1Id: string, isSingleplayer: boolean, pubsub: PubSubEngine): Promise<Game> {
        if (player1Id === 'AI') {
            throw new PlayerCannotBeNamedAIError();
        }

        const game = await this.gameRepository.create({
            board: this.newBoard(),
            player1Id,
            player1UUID: this.generateUUID(),
            player2Id: isSingleplayer ? 'AI' : null,
            turn: 0,
            currentTurnPlayer: player1Id,
            isGameOver: false,
            isTie: false,
            winner: null,
        });

        try {
            await this.gameRepository.save(game);
        } catch (err) {
            logger.error(`Error while persisting new game to db: ${err}`);
            throw new ServerError();
        }

        try {
            await pubsub.publish('GAME_EVENTS', { event: 'GAME_CREATED', ...game });
        } catch (err) {
            logger.error(`Error while publishing GAME_CREATED event: ${err}`);
            throw new ServerError();
        }

        logger.info(`The game was created by player ${player1Id}`, {gameId: game.id});

        return game;
    }

    public async getGame(gameId: number): Promise<Game> {
        const game = await this.gameRepository.findOne(gameId, { relations: ['moves'] });

        if (game === undefined) {
            throw new NoGameError();
        }

        return game;
    }

    public async joinGame(gameId: number, playerId: string, pubsub: PubSubEngine): Promise<Game> {
        if (playerId === 'AI') {
            throw new PlayerCannotBeNamedAIError();
        }

        const game = await this.gameRepository.findOne(gameId);

        if (game === undefined) {
            throw new NoGameError();
        }

        if (game.player2Id !== null) {
            throw new MaximumNumberOfPlayersError();
        }

        if (game.player1Id === playerId) {
            throw new NotAnUniqueNameError();
        }

        game.player2Id = playerId;
        game.player2UUID = this.generateUUID();

        try {
            await this.gameRepository.save(game);
        } catch (err) {
            logger.error(`Error while persisting new game to db: ${err}`);
            throw new ServerError();
        }

        try {
            await pubsub.publish('GAME_EVENTS', { event: 'GAME_JOINED', ...game });
        } catch (err) {
            logger.error(`Error while publishing GAME_JOINED event: ${err}`);
            throw new ServerError();
        }

        logger.info(`Player with the id ${playerId} has joined the game`, { gameId });

        return game;
    }

    public async makeAMove(
        gameId: number,
        playerId: string,
        move: number,
        pubsub: PubSubEngine,
        playerUUID?: string
    ): Promise<Game> {
        const game = await this.gameRepository.findOne(gameId, { relations: ['moves'] });

        try {
            // had to throw this validation in here so the compiler doesn't complain
            if (game === undefined) {
                throw new NoGameError();
            }
            // other validations handled here - they throw a descriptive error if something is out of order
            this.validateMove(game, move, playerId, playerUUID);
        } catch (err) {
            throw err;
        }

        const mark = this.getPlayerMark(game, playerId);
        game.board = this.applyMoveToBoard(game.board, move, mark);

        // we save the move to the moves table
        const _move = await this.moveService.saveMove(playerId, move, game);
        game.moves.push(_move);

        logger.info(`Player ${playerId} has ticked the position ${move} with an ${mark}`, { gameId });
        try {
            await pubsub.publish('GAME_EVENTS', { event: 'MOVE_MADE', ...game });
        } catch (err) {
            logger.error(`Error while publishing GAME_JOINED event: ${err}`);
            throw new ServerError();
        }

        try {
            await this.handlePossibleGameEnd(game, mark, playerId, pubsub);
        } catch (err) {
            throw err;
        }

        game.currentTurnPlayer = this.changeTurn(game, playerId);

        try {
            await this.gameRepository.save(game);
        } catch (err) {
            logger.error(`Error while persisting new game to db: ${err}`);
            throw new ServerError();
        }

        // invoke AI turn if it's AI's turn
        if (!game.isGameOver && game.currentTurnPlayer === 'AI') {
            // we don't wait for this one on purpose
            this.makeAMove(gameId, 'AI', this.chooseAIMove(game.board), pubsub);
        }

        return game;
    }

    private async handlePossibleGameEnd(game: Game, mark: string, playerId: string, pubsub: PubSubEngine) {
        if (this.gameIsWon(game.board, mark)) {
            await this.handleGameWon(game, playerId, pubsub);
        } else {
            game.turn++;
            game.isGameOver = this.gameIsOver(game.turn);
            if (game.isGameOver) {
                await this.handleTie(game, pubsub);
            }
        }
    }

    private async handleGameWon(game: Game, playerId: string, pubsub: PubSubEngine) {
        game.winner = game.currentTurnPlayer;
        game.isGameOver = true;
        logger.info(`Player ${playerId} has won the game!`, { gameId: game.id });

        try {
            await pubsub.publish('GAME_EVENTS', { event: 'GAME_WON', ...game });
        } catch (err) {
            logger.error(`Error while publishing GAME_WON event: ${err}`);
            throw new ServerError();
        }
    }

    private async handleTie(game: Game, pubsub: PubSubEngine) {
        game.isTie = true;
        logger.info(`It's a tie`, { gameId: game.id });

        try {
            await pubsub.publish('GAME_EVENTS', { event: 'GAME_TIED', ...game });
        } catch (err) {
            logger.error(`Error while publishing GAME_TIED event: ${err}`);
            throw new ServerError();
        }
    }

    private newBoard(): string {
        const board = '_________';

        return board;
    }

    private validMove(board: string, move: number): boolean {
        const possibleMoves = this.getPossibleMoves(board);
        if (this.moveOutOfBounds(move) || !this.possibleMove(move, possibleMoves)) {
            return false;
        }

        return true;
    }

    private moveOutOfBounds(move: number): boolean {
        return move > 9 || move < 1;
    }

    private possibleMove(move: number, possibleMoves: number[]) {
        // players move is decremented due to string indexes starting at 0
        return possibleMoves.includes(move - 1);
    }

    private getPossibleMoves(board: string): number[] {
        const possibleMoves = [] as number[];

        [...board].forEach((mark, index) => {
            if (mark === '_') {
                possibleMoves.push(index);
            }
        });

        return possibleMoves;
    }

    private chooseAIMove(board: string): number {
        const possibleMoves = this.getPossibleMoves(board);
        // all possible moves are incremented by 1 due to string indexes starting at 0
        const aiMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)] + 1;

        return aiMove;
    }

    private applyMoveToBoard(board: string, move: number, mark: string): string {
        const splitBoard = board.split('');

        // players move is decremented due to string indexes starting at 0
        splitBoard[move - 1] = mark;

        return splitBoard.join('');
    }

    private changeTurn(game: Game, playerId: string) {
        let currentTurnPlayer = null;
        if (playerId === game.player1Id) {
            currentTurnPlayer = game.player2Id;
        }

        if (playerId === game.player2Id) {
            currentTurnPlayer = game.player1Id;
        }

        return currentTurnPlayer;
    }

    private WIN_MATRIX = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9],
        [3, 5, 7]
    ];

    private gameIsWon(board: string, mark: string): boolean {
        let isWon = false;
        for (const winningCombination of this.WIN_MATRIX) {
            // decremented due to string indexes starting at 0
            if (
                board[winningCombination[0] - 1] === mark &&
                board[winningCombination[1] - 1] === mark &&
                board[winningCombination[2] - 1] === mark
            ) {
                isWon = true;
                break;
            }
        }

        return isWon;
    }

    private gameIsOver(turn: number): boolean {
        return turn >= 9;
    }

    private generateUUID() {
        return uuidv4();
    }

    private validateMove(game: Game, move: number, playerId: string, playerUUID?: string) {
        if (!game.player2Id) {
            throw new Player2HasntJoinedYetError();
        }

        if (game.isGameOver) {
            throw new GameAlreadyOverError();
        }

        if (game.player1Id !== playerId && game.player2Id !== playerId) {
            throw new NotYourGameError();
        }

        if (!this.isPlayerAuthenticated(game, playerId, playerUUID))  {
            throw new UnauthenticatedError();
        }

        if (this.isPlayersTurn(game, playerId)) {
            throw new NotYourTurnError();
        }

        if (!this.validMove(game.board, move)) {
            throw new InvalidTurnError();
        }
    }

    /**
     * Check if the player has matching UUID
     */
    private isPlayerAuthenticated(game: Game, playerId: string, playerUUID?: string): boolean {
        return ((game.player1Id === playerId && game.player1UUID === playerUUID)
            || (game.player2Id === playerId && game.player2UUID === playerUUID));
    }

    private isPlayersTurn(game: Game, playerId: string): boolean {
        return game.currentTurnPlayer !== playerId.toString() as number | 'AI' | null;
    }

    private getPlayerMark(game: Game, playerId: string): string {
        return playerId === game.player1Id ? 'X' : 'O';
    }
}
