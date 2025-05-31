import { Component, JSX } from "solid-js";

type InputTypeFieldProps = {
  inputProps: {
    id: string;
    type: string;
    value: string;
  } & JSX.IntrinsicElements["input"];
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void;  
};

const InputTypeField: Component<InputTypeFieldProps> = (props) => {
  return (
    <input
      {...props.inputProps}
      id={props.inputProps.id}
      class="w-full"
      classList={{
        "invalid-input": props.isInvalid,
        "valid-input": !props.isInvalid,
      }}
      onInvalid={(e) => {
        if (props.inputProps.required) {
          const target = e.target as HTMLInputElement;
          props.onInvalid(e, props.inputProps.id, target.validationMessage);
        }
      }}
      onInput={(e) => props.onChangeValue(e.target.value, props.inputProps.id)}
      onFocus={(e) => props.onFocus(e)}
      autocomplete="off"
    />
  );
};

export default InputTypeField;
