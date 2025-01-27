import { Component, JSX } from "solid-js";

type CheckboxFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  checked: boolean;
  onChangeValue: (value: boolean, fieldName: string) => any;
};

const CheckboxField: Component<CheckboxFieldProps> = (props) => {
  return (
    <input
      {...props.inputProps}
      type="checkbox"
      checked={props.checked}
      onChange={(e) => props.onChangeValue(e.target.checked, props.inputProps?.id)}
      class="w-4 h-4 text-teal-400 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    ></input>
  );
};

export default CheckboxField;
