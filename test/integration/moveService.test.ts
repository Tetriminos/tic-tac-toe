import { Repository } from 'typeorm';
import { Move, MoveService } from '../../src/components/move';
import { Game } from '../../src/components/game';

const fakeRepository = {
    create: async (obj: any): Promise<any> => new Promise((resolve, _) => resolve(obj)),
    save: async (obj: any): Promise<any> => new Promise((resolve, _) => resolve(obj)),
};

const moveService = new MoveService((fakeRepository as unknown) as Repository<Move>);

describe('saveMove()', () => {
    it('saves the expected move', async () => {
        const TEST_DATA = {
            playerId: '1',
            move: 2,
            game: {
                gameId: 1
            }
        };

        const savedMove = await moveService.saveMove(TEST_DATA.playerId, TEST_DATA.move, (TEST_DATA.game as unknown) as Game);
        expect(savedMove).toEqual(TEST_DATA);
    });
});
