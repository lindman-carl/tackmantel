import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Button from "./components/Button";
import GameInfo from "./components/GameInfo";
import Logo from "./components/Logo";
import Menu from "./components/Menu";
import Modal from "./components/Modal";
import PlayerList from "./components/PlayerList";
import SignatureFooter from "./components/SignatureFooter";
import Spinner from "./components/Spinner";
import WordCard from "./components/WordCard";
import { ClientToServerEvents, Game, ServerToClientEvents } from "./types";

const SERVER_URI =
  process.env.NODE_ENV === "production"
    ? "https://tackmantel.lindman.dev"
    : "http://localhost:3000";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(SERVER_URI);

const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  const [game, setGame] = useState<Game | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const [playerWord, setPlayerWord] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("game-update", (game) => {
      console.log("updateing game", game);
      setGame(game);

      if (game.gameStarted) {
        if (game.players[socket.id].isUndercover) {
          setPlayerWord(game.words.undercover);
        } else {
          setPlayerWord(game.words.common);
        }
      }
    });

    socket.on("game-round-new", () => {
      setHasVoted(false);
    });

    return () => {
      // clean up socket listeners
      socket.off("connect");
      socket.off("disconnect");
      socket.off("game-update");
      socket.off("game-round-new");
    };
  }, []);

  useEffect(() => {
    if (game && game.message !== null) {
      setShowModal(true);
    }
  }, [game?.message]);

  // event handlers
  const handleCreateGame = (gameId: string, hostName: string) => {
    if (hostName.length < 1) {
      console.log("host name must be at least 1 character");
      return;
    }

    socket.emit("game-create", gameId, socket.id, hostName);
    setHasJoinedGame(true);
    setIsHost(true);
  };

  const handleJoinGame = (gameId: string, playerName: string) => {
    if (playerName.length < 1) {
      console.log("player name must be at least 1 character");
      return;
    }

    socket.emit("game-join", gameId, socket.id, playerName);
    setHasJoinedGame(true);
  };

  const handleStartGame = (gameId: string) => {
    if (!isHost) {
      console.log("only the host can start the game");
      return;
    }
    socket.emit("game-start", gameId);
  };

  const handleVote = (voteForId: string) => {
    if (!hasVoted && game) {
      socket.emit("game-vote", game.id, socket.id, voteForId);
      setHasVoted(true);
    }
  };

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-start text-lg text-white">
        <Logo />
        {isConnected ? (
          hasJoinedGame && game ? (
            <div className="flex flex-col items-center gap-y-4">
              <GameInfo game={game} />
              <WordCard word={playerWord} />
              <PlayerList
                players={game.players}
                editable={isHost && !game.gameStarted}
                canVote={
                  game.gameStarted &&
                  !hasVoted &&
                  !game.gameOver &&
                  game.players[socket.id].inGame
                }
                playerId={socket.id}
                handleVote={handleVote}
              />
              {isHost ? (
                game.gameStarted ? (
                  <div>Game has started</div>
                ) : (
                  <Button
                    onClick={() => handleStartGame(game.id)}
                    label={"Start Game"}
                  />
                )
              ) : (
                <div className="my-2">
                  Waiting for the host to start the game...
                </div>
              )}
            </div>
          ) : (
            <Menu
              handleCreateGame={handleCreateGame}
              handleJoinGame={handleJoinGame}
            />
          )
        ) : (
          <Spinner />
        )}
        <SignatureFooter />
      </div>
      {showModal && (
        <Modal
          heading={game?.gameOver ? "Game Over" : "Round Over"}
          message={game?.message ? game.message : "lol on you"}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default App;
