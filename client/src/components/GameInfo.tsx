import { ReactNode } from "react";

// i can not figure out for the life of me how i can use tailwind to change the color of svgs in external files
// so here they are
const GroupSvg = () => (
  <svg
    viewBox="0 0 1200 1200"
    enable-background="new 0 0 1200 1200"
    width="32px"
    height="32px"
  >
    <path
      d="M596.847,188.488c-103.344,0-187.12,97.81-187.12,218.465
	c0,83.678,40.296,156.352,99.468,193.047l-68.617,31.801l-182.599,84.688c-17.64,8.821-26.444,23.778-26.444,44.947
	c0,67.034,0,134.067,0,201.102c1.451,25.143,16.537,48.577,40.996,48.974h649.62c27.924-2.428,42.05-24.92,42.325-48.974
	c0-67.034,0-134.068,0-201.102c0-21.169-8.804-36.126-26.443-44.947l-175.988-84.688l-73.138-34.65
	c56.744-37.521,95.061-108.624,95.061-190.197C783.967,286.298,700.19,188.488,596.847,188.488L596.847,188.488z M295.023,265.312
	c-44.473,1.689-79.719,20.933-106.497,51.596c-29.62,36.918-44.06,80.75-44.339,124.354c1.819,64.478,30.669,125.518,82.029,157.446
	L21.163,693.997C7.05,699.289,0,711.636,0,731.041v161.398c1.102,21.405,12.216,39.395,33.055,39.703h136.284V761.436
	c2.255-45.639,23.687-82.529,62.196-100.531l136.247-64.817c10.584-6.175,20.731-14.568,30.433-25.152
	c-56.176-86.676-63.977-190.491-27.773-281.801C346.895,274.724,320.432,265.463,295.023,265.312L295.023,265.312z M903.609,265.312
	c-29.083,0.609-55.96,11.319-78.039,26.444c35.217,92.137,25.503,196.016-26.482,276.52c11.467,13.23,23.404,23.377,35.753,30.434
	l130.965,62.195c39.897,21.881,60.47,59.098,60.866,100.532v170.707h140.235c23.063-1.991,32.893-20.387,33.093-39.704V731.042
	c0-17.641-7.05-29.987-21.163-37.045l-202.431-96.618c52.498-38.708,78.859-96.72,79.369-156.117
	c-1.396-47.012-15.757-90.664-44.339-124.354C981.57,284.509,944.526,265.655,903.609,265.312L903.609,265.312z"
    />
  </svg>
);

const StatsSvg = () => (
  <svg viewBox="0 0 294 294" width="32px" height="32px">
    <g>
      <path d="M279,250H15c-8.284,0-15,6.716-15,15s6.716,15,15,15h264c8.284,0,15-6.716,15-15S287.284,250,279,250z" />
      <path
        d="M30.5,228h47c5.247,0,9.5-4.253,9.5-9.5v-130c0-5.247-4.253-9.5-9.5-9.5h-47c-5.247,0-9.5,4.253-9.5,9.5v130
C21,223.747,25.253,228,30.5,228z"
      />
      <path
        d="M123.5,228h47c5.247,0,9.5-4.253,9.5-9.5v-195c0-5.247-4.253-9.5-9.5-9.5h-47c-5.247,0-9.5,4.253-9.5,9.5v195
C114,223.747,118.253,228,123.5,228z"
      />
      <path
        d="M216.5,228h47c5.247,0,9.5-4.253,9.5-9.5v-105c0-5.247-4.253-9.5-9.5-9.5h-47c-5.247,0-9.5,4.253-9.5,9.5v105
C207,223.747,211.253,228,216.5,228z"
      />
    </g>
  </svg>
);

// buttons css for active and inactive state
const active = "shadow-inner fill-rose-900 bg-rose-800";
const inactive = "shadow fill-white bg-rose-700 bg-checkered-pattern";

type Props = {
  children: ReactNode;
  currentPage: "players" | "stats";
  setPage: (page: "players" | "stats") => void;
};

const GameInfo = ({ children, setPage, currentPage }: Props) => {
  return (
    <div className="w-screen px-4 sm:w-96">
      <div className="flex w-full flex-col items-stretch justify-center rounded-md bg-rose-700 p-4 shadow-inner">
        <div className="mb-4 flex w-full flex-row justify-center">
          <button
            className={`rounded-l-md border-2 border-rose-800 ${
              currentPage === "players" ? active : inactive
            } py-2 px-8`}
            onClick={() => setPage("players")}
          >
            <GroupSvg />
          </button>
          <button
            className={`rounded-r-md border-2 border-rose-800 ${
              currentPage === "stats" ? active : inactive
            } py-2 px-8`}
            onClick={() => setPage("stats")}
          >
            <StatsSvg />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default GameInfo;
