import { Component } from "solid-js";
import { IconProps } from "../types";

const ChevronLeftIcon: Component<IconProps> = (props) => {
  return (
    <svg
      class={props.class}
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
