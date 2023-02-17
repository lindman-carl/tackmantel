import DragHandleSvg from "../assets/drag-handle.svg";
import { Player } from "../types";

type Props = {
  players: { [id: string]: Player };
  editable: boolean;
  canVote: boolean;
  playerId: string;
  handleVote: (voteForId: string) => void;
};

const PlayerList = ({
  players,
  editable,
  canVote,
  playerId,
  handleVote,
}: Props) => {
  return (
    <div className="flex w-96 flex-col items-stretch justify-center rounded-md bg-rose-700 p-4 shadow-inner">
      <h3 className="mb-2 text-center text-xl font-semibold text-white underline decoration-rose-900 decoration-2 underline-offset-2 drop-shadow">
        Players
      </h3>
      <div className="flex flex-col items-center justify-center gap-y-2">
        {Object.entries(players).map(([id, player]) => (
          <div
            key={id}
            className="grid h-10 w-full grid-cols-3 rounded-md bg-white px-4 font-medium text-sky-900 shadow"
          >
            <div className="col-span-1 col-start-1 flex h-full items-center justify-start">
              {player.name}
            </div>
            {player.isHost && (
              <div className="col-span-1 col-start-2 flex h-full items-center justify-center">
                Host
              </div>
            )}
            {editable && (
              <div className="col-span-1 col-start-3 flex h-full items-center justify-end">
                <img
                  src={DragHandleSvg}
                  alt="drag handle"
                  width="32px"
                  height="32px"
                  className="pointer-events-none select-none drop-shadow-sm"
                />
              </div>
            )}
            {player.inGame && canVote && id !== playerId && (
              <div className="col-span-1 col-start-3 flex h-full items-center justify-end">
                <button onClick={() => handleVote(id)}>Vote for</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;