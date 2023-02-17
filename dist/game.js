import { log } from "./utils.js";
export const games = new Map();
export const logGame = (gameId) => {
    // get game from games map
    const game = games.get(gameId);
    if (!game) {
        log("game", `game ${gameId} not found`);
        return;
    }
    log("game", `${game.id}`);
    log("game", `players:`);
    Object.entries(game.players).forEach(([id, player]) => {
        log("game", `  ${id}: ${JSON.stringify(player)}`);
    });
};
export const logAllGames = () => {
    games.forEach((game) => {
        logGame(game.id);
    });
};
export const createGame = (gameId, hostId, hostName) => {
    // create a new game with id and default values
    // and add it to the games map
    const game = {
        id: gameId,
        host: hostId,
        players: {
            [hostId]: {
                isUndercover: false,
                inGame: false,
                isHost: true,
                name: hostName,
            },
        },
        round: 0,
        gameOver: false,
        gameStarted: false,
        numUndercover: 1,
        words: {
            undercover: "undercover",
            common: "common",
        },
        startPlayer: null,
        votes: {},
        allowVote: false,
        expectedVotes: 0,
        currentVoteCount: 0,
        message: null,
    };
    games.set(gameId, game);
    return game;
};
export const addPlayerToGame = (gameId, playerId, playerName) => {
    // add player to game object by id
    // get game from games map
    const game = games.get(gameId);
    if (!game) {
        log("game", `game ${gameId} not found`);
        return null;
    }
    // add player to game
    const newPlayers = {
        ...game.players,
        [playerId]: {
            isUndercover: false,
            inGame: false,
            name: playerName,
        },
    };
    const updatedGame = { ...game, players: newPlayers };
    // update game in games map
    games.set(game.id, updatedGame);
    log("game", `player ${playerId} added to game ${gameId}`);
    return updatedGame;
};
//# sourceMappingURL=game.js.map