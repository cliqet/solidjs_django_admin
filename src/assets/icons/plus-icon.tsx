import { Component } from "solid-js";

type PlusIconProps = {
    width: number,
    height: number
}

const PlusIcon: Component<PlusIconProps> = (props) => {
  return (
    <svg
      class={`w-${props.width} h-${props.height} text-custom-primary-lighter`}
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
        stroke-width="5"
        d="M5 12h14m-7 7V5"
      />
    </svg>
  );
};

export default PlusIcon;
