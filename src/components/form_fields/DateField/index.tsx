import { Component, JSX } from "solid-js";

type DateFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  divProps?: JSX.IntrinsicElements["div"];
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void; 
};

const DateField: Component<DateFieldProps> = (props) => {
  return (
    <div {...props.divProps}>
      <input
        {...props.inputProps}
        id={props.inputProps.id}
        type="date"
        placeholder="mm/dd/yyyy"
        onChange={(e) => props.onChangeValue(e.target.value, props.inputProps.id)}
        classList={{
          "border border-gray-300 text-sm rounded-lg focus:ring-custom-primary-lighter focus:border-custom-primary-lighter block w-full p-2.5": !props.isInvalid,
          "border border-red-500 text-sm rounded-lg block w-full p-2.5": props.isInvalid,
        }}
        onInvalid={(e) => {
          if (props.inputProps.required) {
            const target = e.target as HTMLInputElement;
            props.onInvalid(e, props.inputProps.id, target.validationMessage);
          }
        }}
        onFocus={(e) => props.onFocus(e)}
      />
    </div>
  );
};

export default DateField;
