import { Component, JSX } from "solid-js";

type TextareaFieldProps = {
  textareaProps: {
    id: string;
  } & JSX.IntrinsicElements["textarea"];
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void;  
};

const TextareaField: Component<TextareaFieldProps> = (props) => {
  return (
    <textarea
      {...props.textareaProps}
      id={props.textareaProps?.id}
      class="w-full"
      classList={{
        "invalid-input": props.isInvalid,
        "valid-input": !props.isInvalid,
      }}
      onInvalid={(e) => {
        if (props.textareaProps.required) {
          const target = e.target as HTMLTextAreaElement;
          props.onInvalid(e, props.textareaProps.id, target.validationMessage);
        }
      }}
      onInput={(e) => props.onChangeValue(e.target.value, props.textareaProps.id)}
      onFocus={(e) => props.onFocus(e)}
      autocomplete="off"
    ></textarea>
  );
};

export default TextareaField;
