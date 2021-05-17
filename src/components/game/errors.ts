class PlayerCannotBeNamedAIError extends Error {
    constructor(
        public message: string = `A player cannot be named 'AI'! please choose a different name.`
    ) {
        super(message);
    }
}

class NoGameError extends Error {
    constructor(
        public message: string = 'No such game!'
    ) {
        super(message);
    }
}

class Player2HasntJoinedYetError extends Error {
    constructor(
        public message: string = `Player 2 hasn't joined yet! Please wait for player 2`,
    ) {
        super(message);
    }
}

class MaximumNumberOfPlayersError extends Error {
    constructor(
        public message: string = 'Maximum number of players has already reached. This game is not joinable!'
    ) {
        super(message);
    }
}

class NotAnUniqueNameError extends Error {
    constructor(
        public message: string = 'There is already a player with the same name in this game! Please choose a different name... How about Bob?'
    ) {
        super(message);
    }
}

class NotYourGameError extends Error {
    constructor(
        public message: string = 'You\'re not one of the players registered to this game. Go find your own game!'
    ) {
        super(message);
    }
}

class UnauthenticatedError extends Error {
    constructor(
        public message: string = 'You haven\'t provided a valid UUID! Are you trying to make the other players turn for him?'
    ) {
        super(message);
    }
}

class NotYourTurnError extends Error {
    constructor(
        public message: string = 'It is not your turn!'
    ) {
        super(message);
    }
}

class InvalidTurnError extends Error {
    constructor(
        public message: string = `The turn you\'ve attempted to make is not valid!`
    ) {
        super(message);
    }
}

class GameAlreadyOverError extends Error {
    constructor(
        public message: string = 'This game is already over, you cannot make any more turns!'
    ) {
        super(message);
    }
}

class ServerError extends Error {
    constructor(
        public message: string = 'A server error occurred!'
    ) {
        super(message);
    }
}

export {
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
};
