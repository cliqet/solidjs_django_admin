import { Component } from "solid-js";

type AngleDownProps = {
    width: number;
    height: number;
}

const AngleDown: Component<AngleDownProps> = (props) => {
  return (
    <svg
      class={`w-${props.width} h-${props.height} text-white`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m19 9-7 7-7-7"
      />
    </svg>
  );
};

export default AngleDown;
