export class FakeMoveRepository {
    async create(obj: any): Promise<any>{
        return new Promise((resolve, _) => resolve(obj));
    }
    async save(obj: any): Promise<any> {
        return new Promise((resolve, _) => resolve(obj));
    }
};

export class FakeGameRepository {
    public games: Map<number, any>;
    public idCounter: number;
    constructor() {
        this.games = new Map<number, any>();
        this.idCounter = 1;
    }
    async create(obj: any): Promise<any> {
        obj.id = this.idCounter;
        obj.moves = [] as any[];
        this.games.set(this.idCounter, obj);
        this.idCounter++;
        return new Promise((resolve, _) => resolve(obj));
    }
    async save(obj: any): Promise<any> {
        this.games.set(obj.id, obj);
        return new Promise((resolve, _) => resolve(obj));
    }
    async findOne(id: number, _: any): Promise<any> {
        const game = this.games.get(id);
        return new Promise((resolve, _) => resolve(game));
    }
}

export class FakePubSub {
    public messages: any[];
    constructor() {
        this.messages = [];
    }
    async publish(_: any, payload: any): Promise<any> {
        this.messages.push(payload)
        new Promise((resolve, _) => resolve(payload))
    }
}