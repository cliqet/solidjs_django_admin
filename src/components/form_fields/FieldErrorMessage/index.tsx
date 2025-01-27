import { Component } from "solid-js";

type FieldErrorMessageProps = {
  message: string;
};

const FieldErrorMessage: Component<FieldErrorMessageProps> = (props) => {
  return (
    <div>
      <span class="text-red-500 text-xs">{props.message}</span>
    </div>
  );
};

export default FieldErrorMessage;
