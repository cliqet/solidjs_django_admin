import { Component, For, JSX } from "solid-js";
import { SelectedOptionsType } from "src/models/django-admin";


type SelectFieldProps = {
  selectProps: {
    id: string;
  } & JSX.IntrinsicElements["select"];
  optionProps?: JSX.IntrinsicElements["option"];
  options: SelectedOptionsType[];
  onChangeValue: (value: string, fieldName: string) => any;
  isInvalid?: boolean;
  onInvalid?: (e: Event, id: string, validationMessage: string) => void;
  onFocus?: (e: Event) => void;
};

const SelectField: Component<SelectFieldProps> = (props) => {
  return (
    <select
      {...props.selectProps}
      id={props.selectProps.id}
      onChange={(e) =>
        props.onChangeValue(e.target.value, props.selectProps.id)
      }
      onInvalid={(e) => {
        if (props.selectProps.required && props.onInvalid) {
          const target = e.target as HTMLInputElement;
          props.onInvalid(e, props.selectProps.id, target.validationMessage);
        }
      }}
      classList={{
        "block w-auto px-2 py-1 text-sm border border-red-500 rounded-lg": props.isInvalid,
        "block w-auto px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-custom-primary-lighter focus:border-custom-primary-lighter": !props.isInvalid
      }} 
    >
      <For each={props.options}>
        {(opt, i) => (
          <option
            {...props.optionProps}
            selected={opt.selected}
            value={opt.value}
          >
            {opt.label}
          </option>
        )}
      </For>
    </select>
  );
};

export default SelectField;
