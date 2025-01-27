import { Component, JSX } from "solid-js";

type RadioFieldProps = {
  inputProps: {
    name: string;
  } & JSX.IntrinsicElements["input"];
  label: {
    for: string;
    text: string;
  }
};

const RadioField: Component<RadioFieldProps> = (props) => {
  return (
    <div class="flex items-center mb-4">
      <input
        {...props.inputProps}
        type="radio"
        class="outline-none w-4 h-4"
      />
      <label
        for={props.label.for}
        class="block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        {props.label.text}
      </label>
    </div>
  );
};

export default RadioField;
