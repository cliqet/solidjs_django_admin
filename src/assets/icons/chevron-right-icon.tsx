import { Component } from "solid-js";

type ChevronRightIconProps = {
  class: string;
};

const ChevronRightIcon: Component<ChevronRightIconProps> = (props) => {
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
        d="m7 16 4-4-4-4m6 8 4-4-4-4"
      />
    </svg>
  );
};

export default ChevronRightIcon;
