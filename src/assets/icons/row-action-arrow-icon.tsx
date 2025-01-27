interface RowActionArrowIconProps {
    class: string;
  }
  
  const RowActionArrowIcon = (props: RowActionArrowIconProps) => {
    return (
      <svg
        class={props.class}
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    );
  };
  
  export default RowActionArrowIcon;
  