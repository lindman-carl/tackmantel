import { z } from "zod";
import {
  countPlayersInGame,
  countCommonersInGame,
  countUndercoversInGame,
  countVotes,
  getPlayerWithMostVotes,
} from "./gameUtils.js";

import { Game } from "./types.js";
import {
  generateChordData,
  getRandomWords,
  log,
  shuffleArray,
} from "./utils.js";

export const games = new Map<string, Game>();
export const playersInGame = new Map<string, string>();

export const logGame = (gameId: string): void => {
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

export const logAllPlayers = (): void => {
  log("game", `players:`);
  playersInGame.forEach((gameId, playerId) => {
    log("game", `  ${playerId}: ${gameId}`);
  });
};

export const logAllGames = (): void => {
  games.forEach((game) => {
    logGame(game.id);
  });
};

export const gameCreate = (
  gameId: string,
  hostId: string,
  hostName: string
): Game | null => {
  // create a new game with id and default values
  // and add it to the games map
  const trimmedGameId = gameId.trim();
  const trimmedHostName = hostName.trim();

  // validate input with zod
  const gameIdSchema = z
    .string()
    .min(4, { message: "Game id: min 4 characters long" })
    .max(20, { message: "Game id: max 20 charactes long" });
  const playerNameSchema = z
    .string()
    .min(1, { message: "Player name: min 1 character" })
    .max(12, { message: "Player name: max 12 characters" });

  try {
    gameIdSchema.parse(trimmedGameId);
    playerNameSchema.parse(trimmedHostName);
  } catch (err) {
    if (err instanceof z.ZodError) {
      log("game", err.issues[0].message);
      return null;
    }
  }

  // check if game already exists
  if (games.has(trimmedGameId)) {
    log("game", `game ${trimmedGameId} already exists`);
    return null;
  }

  const game: Game = {
    id: trimmedGameId,
    host: hostId,
    players: {
      [hostId]: {
        isUndercover: false,
        inGame: false,
        isHost: true,
        name: trimmedHostName,
        wins: 0,
        score: 0,
        hasVoted: false,
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
    votes: [{}],
    allowVote: false,
    message: null,
    accumulatedScoreForUndercoverPlayers: {},
  };

  games.set(trimmedGameId, game);

  // add player to playersInGame map
  playersInGame.set(hostId, trimmedGameId);
  return game;
};

export const gameAddPlayer = (
  gameId: string,
  playerId: string,
  playerName: string
): Game | null => {
  // add player to game object by id

  // validate input with zod
  const trimmedPlayerName = playerName.trim();
  const playerNameSchema = z
    .string()
    .min(1, { message: "Player name: min 1 character" })
    .max(12, { message: "Player name: max 12 characters" });

  try {
    playerNameSchema.parse(trimmedPlayerName);
  } catch (err) {
    if (err instanceof z.ZodError) {
      log("game", err.issues[0].message);
      return null;
    }
  }

  // check if player is already in game
  if (playersInGame.has(playerId)) {
    log("game", `player ${playerId} already in game`);
    return null;
  }

  // check if game exists
  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return null;
  }

  // check if the game has already started
  if (game.gameStarted) {
    log("game", `game ${gameId} has already started`);
    return null;
  }

  // add player to game
  const newPlayers = {
    ...game.players,
    [playerId]: {
      isUndercover: false,
      inGame: false,
      name: trimmedPlayerName,
      wins: 0,
      score: 0,
      hasVoted: false,
    },
  };

  const updatedGame: Game = {
    ...game,
    players: newPlayers,
  };

  // update game in games map
  games.set(game.id, updatedGame);

  // add player to playersInGame map
  playersInGame.set(playerId, gameId);

  log("game", `player ${playerId} added to game ${gameId}`);

  return updatedGame;
};

export const gameRemovePlayer = (
  gameId: string,
  playerId: string
): Game | null => {
  // remove player from game object by id
  // also remove player from playersInGame map

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return null;
  }

  // remove player from game
  const newPlayers = { ...game.players };
  delete newPlayers[playerId];
  const updatedGame = { ...game, players: newPlayers };

  // update game in games map
  games.set(game.id, updatedGame);

  // remove player from playersInGame map
  playersInGame.delete(playerId);

  log("game", `player ${playerId} removed from game ${gameId}`);

  return updatedGame;
};

export const gameEliminatePlayer = (
  gameId: string,
  playerId: string
): Game | null => {
  // eliminate player from game object by id
  // FOR TESTING ONLY

  // get game from games map
  const game = games.get(gameId);
  if (!game) {
    log("game", `game ${gameId} not found`);
    return null;
  }

  // remove player from game
  const newPlayers = { ...game.players };
  newPlayers[playerId] = {
    ...newPlayers[playerId],
    inGame: false,
  };
  const updatedGame = { ...game, players: newPlayers };

  // update game in games map
  games.set(game.id, updatedGame);

  log("game", `player ${playerId} eliminated from game ${gameId}`);

  return updatedGame;
};

export const gameStart = (
  startedBy: string,
  gameId: string,
  words: [string, string] | null,
  numUndercover: number
): Game | null => {
  // get game
  const game = games.get(gameId);
  if (!game) {
    console.log("could not find game");
    return null;
  }

  // check if the game is started by the host
  if (game.host !== startedBy) {
    console.log("game can only be started by the host");
    return null;
  }

  // check if game is already started
  if (game.gameStarted && !game.gameOver) {
    console.log("game already started");
    return null;
  }

  // check if there are enough players
  if (Object.keys(game.players).length < 3) {
    console.log("not enough players, need at least 3");
    return null;
  }

  // check for valid words
  if (words) {
    if (words[0] === words[1]) {
      console.log("words cannot be the same");
      return null;
    }

    // validate input with zod
    const wordSchema = z
      .string()
      .min(1, { message: "Word: min 1 character" })
      .max(12, { message: "Word: max 30 characters" });

    try {
      wordSchema.parse(words[0]);
      wordSchema.parse(words[1]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log(err.issues[0].message);
        return null;
      }
    }
  }

  // check for valid numUndercover
  // at least 1 is required
  // less than half of players is required
  // validate input with zod
  // ie:
  //    3-4 players: 1 undercover
  //    5-6 players: 1-2 undercover
  //    7-8 players: 1-3 undercover
  // calculate max number of undercovers
  const numPlayers = Object.keys(game.players).length;
  let maxUndercover = 1;
  if (numPlayers % 2 === 0) {
    maxUndercover = numPlayers / 2 - 1;
  } else {
    maxUndercover = (numPlayers - 1) / 2;
  }
  const numUndercoverSchema = z
    .number()
    .int({ message: "Number of undercover: must be an integer" })
    .min(1, { message: "Number of undercover: min 1" })
    .max(maxUndercover, {
      message: `Number of undercover: max ${maxUndercover}`,
    });

  try {
    numUndercoverSchema.parse(numUndercover);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.issues[0].message);
      return null;
    }
  }

  // set who is undercover
  // get random order of players
  const playerIds = Object.keys(game.players);
  let playerIdsInRandomOrder = shuffleArray([...playerIds]);

  // get ids of first numUndercover players
  const undercoverPlayerIds = [];
  for (let i = 0; i < numUndercover; i++) {
    undercoverPlayerIds.push(playerIdsInRandomOrder[i]);
  }

  // reset all players to not undercover
  // then set undercover players to undercover
  const updatedPlayers = { ...game.players };
  for (const playerId of playerIds) {
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      isUndercover: false,
    };
  }
  for (const playerId of undercoverPlayerIds) {
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      isUndercover: true,
    };
  }

  // set all players to inGame and not voted
  for (const playerId of playerIds) {
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      inGame: true,
      hasVoted: false,
    };
  }

  // set words
  let wordsToUse;
  if (words !== null) {
    const shuffledWords = shuffleArray([...words]);
    wordsToUse = {
      undercover: shuffledWords[0],
      common: shuffledWords[1],
    };
  } else {
    wordsToUse = getRandomWords();
  }

  // set who is the first player
  // rerandomize player order
  playerIdsInRandomOrder = shuffleArray([...playerIds]);
  const startPlayer = playerIdsInRandomOrder[0];

  const message = [
    "The game has started!",
    `${game.players[startPlayer].name} goes first.`,
  ];

  // update game
  const updatedGame: Game = {
    ...game,
    players: updatedPlayers,
    startPlayer,
    words: wordsToUse,
    gameStarted: true,
    gameOver: false,
    round: 0,
    message,
    numUndercover,
    accumulatedScoreForUndercoverPlayers: {},
  };

  // update games map
  games.set(gameId, updatedGame);

  // return success
  return updatedGame;
};

export const gameVote = (
  gameId: string,
  voterId: string,
  targetId: string
): { updatedGame: Game; newRound: boolean } | null => {
  // handles user voting for a player
  // returns updated game and whether a new round should start
  // the round is over when all players have voted
  // if the round is over, the votes are counted and a player is eliminated if they have more votes than all other players

  // check for voting for self
  if (voterId === targetId) {
    log("game-vote", `cannot vote for self: ${voterId} voted ${targetId}`);
    return null;
  }

  // get game
  const game = games.get(gameId);
  if (!game) {
    log("game-vote", `game not found: ${gameId}`);
    return null;
  }

  // check that the target is in the same game
  if (!Object.hasOwn(game.players, targetId)) {
    log("game-vote", `vote target is not in the same game ${targetId}`);
    return null;
  }

  // check that the target is not eliminated
  if (!game.players[targetId].inGame) {
    log("game-vote", `vote target is not in game: ${targetId}`);
    return null;
  }

  // update votes
  // add the vote as a key value (voter:target) pair to the first object in the votes array
  const currentRoundVotes = { ...game.votes[0] };
  currentRoundVotes[voterId] = targetId;

  // create updated votes array
  const updatedVotes = [currentRoundVotes, ...game.votes.slice(1)];

  // get number of votes cast, and max number of votes possible for this round
  const numVotes = Object.keys(currentRoundVotes).length;
  const numPlayersInGame = countPlayersInGame(game.players);

  // set player hasVoted to true
  const updatedPlayers = {
    ...game.players,
    [voterId]: { ...game.players[voterId], hasVoted: true },
  };

  // set default values for message and gameOver
  let message = null;
  let gameOver = false;

  if (numVotes === numPlayersInGame) {
    // end round if all votes are in
    /*
      all players have voted
      end round
      count votes
      eliminate player with most votes
      if there is a tie, no one is eliminated
      accumulate score for surviving undercover players
  */

    // count votes for each player
    // and get the player with the most votes
    const voteCounts = countVotes(currentRoundVotes);
    const playerIdWithMostVotes = getPlayerWithMostVotes(voteCounts);

    if (playerIdWithMostVotes !== null) {
      // if there is a player with the most votes, eliminate them
      updatedPlayers[playerIdWithMostVotes] = {
        ...updatedPlayers[playerIdWithMostVotes],
        inGame: false,
      };

      // make message
      const eliminatedPlayerName = updatedPlayers[playerIdWithMostVotes].name;
      message = [
        "The round is over!",
        `${eliminatedPlayerName} was eliminated.`,
      ];

      // check if game is over
      const numCommonersInGame = countCommonersInGame(updatedPlayers);
      const numUndercoversInGame = countUndercoversInGame(updatedPlayers);

      if (numUndercoversInGame === 0) {
        // if there are no undercover players left, the commoners win

        // make message for commoners win
        const survivingCommonersPlayerNames = Object.values(updatedPlayers)
          .filter((player) => !player.isUndercover && player.inGame)
          .map((player) => player.name);

        const undercoverScoreString = Object.entries(
          game.accumulatedScoreForUndercoverPlayers
        )
          .map(([playerId, score]) => {
            return `${updatedPlayers[playerId].name} get ${score}`;
          })
          .join(", ");

        message = [
          `${eliminatedPlayerName} was eliminated, the commoners won!`,

          `${survivingCommonersPlayerNames.join(
            ", "
          )} survived and are awarded 10 points!`,
          `${undercoverScoreString} points for surviving as long as they did.`,
        ];

        // set gameOver to true
        gameOver = true;

        // update score
        for (const playerId of Object.keys(updatedPlayers)) {
          // give wins and score to surviving commoners
          if (
            !updatedPlayers[playerId].isUndercover &&
            updatedPlayers[playerId].inGame
          ) {
            updatedPlayers[playerId] = {
              ...updatedPlayers[playerId],
              wins: updatedPlayers[playerId].wins + 1,
              score: updatedPlayers[playerId].score + 10,
            };
          }
          // give accumulated score to undercovers
          if (
            Object.hasOwn(game.accumulatedScoreForUndercoverPlayers, playerId)
          ) {
            updatedPlayers[playerId] = {
              ...updatedPlayers[playerId],
              score:
                updatedPlayers[playerId].score +
                game.accumulatedScoreForUndercoverPlayers[playerId],
            };
          }
        }
      } else if (numCommonersInGame <= numUndercoversInGame) {
        // if there are as many or fewer commoners than undercover players left, the undercover win

        // make message for undercover win
        const survivingUndercoverPlayerNames = Object.values(updatedPlayers)
          .filter((player) => player.isUndercover && player.inGame)
          .map((player) => player.name);

        const undercoverScoreString = Object.entries(
          game.accumulatedScoreForUndercoverPlayers
        )
          .map(([playerId, score]) => {
            return `${updatedPlayers[playerId].name} (${score})`;
          })
          .join(", ");

        message = [
          `${eliminatedPlayerName} was eliminated, the undercovers won!`,
          `${survivingUndercoverPlayerNames.join(
            ", "
          )} survived and are awarded 25 points.`,
          undercoverScoreString.length > 0
            ? `The undercover(s) also get ${undercoverScoreString} points for surviving as long as they did.`
            : "No points for the undercovers.",
        ];

        // set gameOver to true
        gameOver = true;

        // update score
        for (const playerId of Object.keys(updatedPlayers)) {
          // give wins and score to surviving undercovers
          if (updatedPlayers[playerId].isUndercover) {
            // give 25 points to surviving undercover for winning
            // also give 10 points for surviving another voting round
            // because the accumulatation happens after this piece of code
            let scoreIncrease = updatedPlayers[playerId].inGame ? 35 : 0;
            // if the player already has an accumulated score, add it to the score
            if (
              Object.hasOwn(game.accumulatedScoreForUndercoverPlayers, playerId)
            ) {
              scoreIncrease +=
                game.accumulatedScoreForUndercoverPlayers[playerId];
            }

            updatedPlayers[playerId] = {
              ...updatedPlayers[playerId],
              wins: updatedPlayers[playerId].wins + 1,
              score: updatedPlayers[playerId].score + scoreIncrease,
            };
          }
        }
      }
    } else {
      // if there is a tie, no one is eliminated
      message = [
        "The round is over!",
        "There was a tie, no one was eliminated.",
      ];
    }

    // accumulate score for each undercover player that is still in the game
    // they get 10 points for each round they are still in the game
    const updatedAccumulatedScore = {
      ...game.accumulatedScoreForUndercoverPlayers,
    };
    for (const playerId of Object.keys(updatedPlayers)) {
      if (
        updatedPlayers[playerId].isUndercover &&
        updatedPlayers[playerId].inGame
      ) {
        // if the player already has an accumulated score, add 10 to it
        if (Object.hasOwn(updatedAccumulatedScore, playerId)) {
          updatedAccumulatedScore[playerId] =
            updatedAccumulatedScore[playerId] + 10;
        } else {
          updatedAccumulatedScore[playerId] = 10;
        }
      }
    }

    // increment round
    const round = game.round + 1;

    // set all players to not have voted
    for (const playerId of Object.keys(updatedPlayers)) {
      updatedPlayers[playerId] = {
        ...updatedPlayers[playerId],
        hasVoted: false,
      };
    }

    // generate new chord data if a game is over
    let chordData = game.chordData;
    if (gameOver) {
      chordData = generateChordData(updatedVotes);
    }

    // new round, make new votes object in the beginning of the votes array
    updatedVotes.unshift({});

    // update game
    const updatedGame: Game = {
      ...game,
      votes: updatedVotes,
      round,
      players: updatedPlayers,
      message,
      gameOver,
      chordData,
      accumulatedScoreForUndercoverPlayers: updatedAccumulatedScore,
    };

    // update games map
    games.set(gameId, updatedGame);

    return { updatedGame, newRound: true };
  }

  // update game
  const updatedGame: Game = {
    ...game,
    votes: updatedVotes,
    players: updatedPlayers,
  };

  // update games map
  games.set(gameId, updatedGame);

  return { updatedGame, newRound: false };
};
