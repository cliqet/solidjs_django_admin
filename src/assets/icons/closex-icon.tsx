import { Component } from "solid-js";

type CloseXIconProps = {
    width: number;
    height: number;
}

const CloseXIcon: Component<CloseXIconProps> = (props) => {
  return (
    <svg
      class={`w-${props.width} h-${props.height}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
      />
    </svg>
  );
};

export default CloseXIcon;
