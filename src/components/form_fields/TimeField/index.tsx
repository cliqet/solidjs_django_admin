import { Component, JSX } from "solid-js";

type TimeFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void; 
};

const TimeField: Component<TimeFieldProps> = (props) => {
  return (
    <div class="flex">
      <input
        {...props.inputProps}
        id={props.inputProps.id}
        type="time"
        classList={{
          "invalid-input": props.isInvalid,
          "valid-input": !props.isInvalid,
        }}
        onChange={(e) => props.onChangeValue(e.target.value, props.inputProps.id)}
        onInvalid={(e) => {
          if (props.inputProps.required) {
            const target = e.target as HTMLInputElement;
            props.onInvalid(e, props.inputProps.id, target.validationMessage);
          }
        }}
        onFocus={(e) => props.onFocus(e)}
      />
      <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
};

export default TimeField;
