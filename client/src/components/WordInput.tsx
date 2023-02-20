import { useState } from "react";

// svgs
import EyeHideSvg from "../assets/eye-hide.svg";
import EyeShowSvg from "../assets/eye-show.svg";

type WordInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const WordInput = ({ placeholder, value, onChange }: WordInputProps) => {
  const [hide, setHide] = useState(false);
  return (
    <div className="flex w-full rounded-md bg-white shadow-inner">
      <input
        type={hide ? "password" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-l-md py-2 pl-4 text-sky-900 outline-none"
      />
      <div>
        <button onClick={() => setHide(!hide)} className="ml-2 mt-2 ">
          {hide ? (
            <img src={EyeShowSvg} alt="show" width="24px" height="24px" />
          ) : (
            <img src={EyeHideSvg} alt="hide" width="24px" height="24px" />
          )}
        </button>
      </div>
    </div>
  );
};

export default WordInput;
