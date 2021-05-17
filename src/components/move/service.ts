import { Move } from './model';
import { Game } from '../game';
import { Repository } from 'typeorm';

export class MoveService {
    constructor(
        private moveRepository: Repository<Move>,
    ) { }

    async saveMove(playerId: string, move: number, game: Game): Promise<Move> {
        const newMove = this.moveRepository.create({
            playerId,
            move,
            game,
        });

        return await this.moveRepository.save(newMove);
    }
}
