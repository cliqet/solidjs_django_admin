import { Component } from "solid-js";

type AngleUpProps = {
    width: number;
    height: number;
}

const AngleUp: Component<AngleUpProps> = (props) => {
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
        d="m5 15 7-7 7 7"
      />
    </svg>
  );
};

export default AngleUp;
