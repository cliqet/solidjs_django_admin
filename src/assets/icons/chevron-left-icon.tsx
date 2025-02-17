import { Component } from "solid-js";

type ChevronLeftIconProps = {
    width: number;
    height: number;
}


const ChevronLeftIcon: Component<ChevronLeftIconProps> = (props) => {
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
        d="m17 16-4-4 4-4m-6 8-4-4 4-4"
      />
    </svg>
  );
};

export default ChevronLeftIcon;
