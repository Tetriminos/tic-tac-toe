# Tic-Tac-Toe

## How To Run The Project
To run the project, first install the dependencies:
```sh
$ npm install
```

Make sure you have a Postgres instance running.

Then, create an .env file in the root directory, for example:
```.env
NODE_ENV=development
PORT=8080
DB_NAME=tictactoedb
DB_USER=postgres
DB_PORT=5432
DB_HOST=localhost
DB_PASS=test
```

Run the project:
```sh
$ npm run dev:start
```
or
```sh
$ npm run build && npm start
```
... which does the same as `npm run dev:start` right now.

If running with `NODE_ENV=development`, you'll have access to Apollo's graphql playground at `/graphql`

## Architecture considerations
* The folder structure is component based, so that one doesn't have to jump through multiple folders when developing the component (imports also become more manageable).
* `TypeORM` was used because it still seems to be the most popular option, and I've used TypeORM once before. In retrospect, `Prisma` might have been a better choice.
* Postgres is used as the db, and migrations are run upon connecting
* The board state is saved as a string - a clean board being '_________' (9 underscores), whereas a board in progress might look something like this: `_X_OXX_O_X`. This makes it a pussy's smoke to store in any db. The client also receives the board as a string. I don't think it matters if the client app receives it as a string, a nested array, or whatever else I could have thought of. The client's gonna have to do some processing to render a view anyways.
* Moves in the client API are numbered from 1 to 9, representing the board:
```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
```
* Postgres is also used as the pubsub backend for the `gameUpdate` subscription. If we were to use the default pubsub, we couldn't scale the app past one instance and retain correctness.
* Went without a DI library due to `tsyringe` and `typedi` not working intuitively enough for a TypeScript noob such as myself. Injecting via constructors is a compromise.
* Logs are send to STDOUT in a JSON format, containing the GameId as as separate property where applicable. This would make searching for a particular game easier for most log viewing/monitoring software.
* I've used `type-graphql` to auto-generate schemas since it felt like the lowest barrier of entry for a GraphQL/TypeScript noob. It has only one maintainer tho, and last publish was 7 months ago.
* To make sure a player cannot make a turn for the other player in game, I've used UUIDs. A UUID for player 1 is returned when creating a game, and another for player 2 when he joins. A turn cannot be made without providing the correct UUID.
* I've chosen not to have player registration, since the requirements read like this is one of those fire and forget games. Create a game, join the game, win the game, celebrate.
* The GraphQL schema is very relaxed, and lets the 

## Notes
This was done in some 10ish hours of design and reading up on TypeScript/GraphQL, and some 20ish hours of typing actual code.
The code just isn't nearly as clean as I'd like it to be, since I've spent too much time on things that someone experienced in TS/GraphQL would've done in minutes.
If I were to spend more time on the app, I would probably make add more verbose types for the Schema and the game itself (instead of basically everything being of a primitive type).

## Usage
Since I haven't figured out how to document the API (lol), here is an example of how you can play the game in the playground (change the game id and UUIDs appropriately):
1. Create a game:
```js
mutation {
  createGame(options: { playerId: "bob", isSingleplayer: false }) {
    id
    board
    player1Id
    player2Id
    currentTurnPlayer
    isGameOver
    winner
    turn
    player1UUID
  }
}
```
* Save the gameId to send to player 2. Save the playerUUID to authenticate yourself in the MakeAMove mutation

2. Subscribe to the game to get events:
```js
subscription {
  gameUpdate(id: 1) {
    board
    isGameOver
    isTie
    currentTurnPlayer
    winner
    turn
    event
  }
}
```

3. Join the game:
```js
mutation {
  joinGame(options: { playerId: "Alice", gameId: 1 }) {
    id
    board
    player1Id
    player2Id
    currentTurnPlayer
    isGameOver
    winner
    turn
    player2UUID
  }
}
```

4. Make some moves:
```js
mutation {
  makeAMove(
    options: {
      playerId: "Bob"
      gameId: 1
      move: 4
      playerUUID: "2d47d492-c994-4047-a099-da57c1e410be"
    }
  ) {
    id
    board
    player1Id
    player2Id
    currentTurnPlayer
    isGameOver
    winner
    turn
  }
}
```

5. Make some more moves until somebody wins the game, or it's a tie...

6. To get the game history so far:
```js
query {
  getGame(id: 1) {
    id
    board
    player1Id
    player2Id
    currentTurnPlayer
    isGameOver
    winner
    turn
    moves {
      playerId
      move
    }
  }
}
```

Events from the subscription: `GAME_JOINED`, `MOVE_MADE`, `GAME_WON`, `GAME_TIED`.