import { Component, createSignal, JSX, Show } from "solid-js";
import Label from "../Label";

type PasswordFieldProps = {
  inputProps: {
    id: string;
    pattern: string;
  } & JSX.IntrinsicElements["input"];
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void;
  isEditMode?: boolean;
};

const PasswordField: Component<PasswordFieldProps> = (props) => {
  const [passwordState, setPasswordState] = createSignal({
    hasMinLength: false,
    hasOneDigit: false,
    isEqualPasswords: false,
    isValid: false,
  });
  const [isChangingOnEdit, setIsChangingOnEdit] = createSignal(false);
  let password1Ref: HTMLInputElement;
  let password2Ref: HTMLInputElement;

  const onPasswordUpdated = (e: Event) => {
    const element = e.target as HTMLInputElement;
    const regex = /\d/;

    if (regex.test(password1Ref.value)) {
      setPasswordState({ ...passwordState(), hasOneDigit: true });
    } else {
      setPasswordState({ ...passwordState(), hasOneDigit: false });
    }

    if (password1Ref.value.length >= 8) {
      setPasswordState({ ...passwordState(), hasMinLength: true });
    } else {
      setPasswordState({ ...passwordState(), hasMinLength: false });
    }

    if (password1Ref.value === password2Ref.value) {
      setPasswordState({ ...passwordState(), isEqualPasswords: true });
    } else {
      setPasswordState({ ...passwordState(), isEqualPasswords: false });
    }

    if (
      passwordState().hasMinLength &&
      passwordState().hasOneDigit &&
      passwordState().isEqualPasswords
    ) {
      setPasswordState({ ...passwordState(), isValid: true });
    } else {
      setPasswordState({ ...passwordState(), isValid: false });
    }

    if (element.id === "password") {
      props.onChangeValue(password1Ref.value, props.inputProps.id);
    } else {
      props.onChangeValue(password2Ref.value, `${props.inputProps.id}2`);
    }
  };

  return (
    <>
      <Show when={props.isEditMode && !isChangingOnEdit()}>
        <div>
          <span class="text-white mr-3">*************</span>
          <button onClick={() => setIsChangingOnEdit(true)} class="button">Change Password</button>
        </div>
      </Show>

      <Show when={!props.isEditMode || (props.isEditMode && isChangingOnEdit())}>
        <div>
          <input
            {...props.inputProps}
            required={
              props.isEditMode ? isChangingOnEdit() : props.inputProps.required
            }
            type="password"
            ref={password1Ref!}
            class="my-2"
            pattern={props.inputProps.pattern}
            classList={{
              "invalid-input": props.isInvalid,
              "valid-input": !props.isInvalid,
            }}
            onInput={(e) => onPasswordUpdated(e)}
            onInvalid={(e) => {
              if (props.inputProps.required) {
                const target = e.target as HTMLInputElement;
                props.onInvalid(
                  e,
                  props.inputProps.id,
                  target.validationMessage
                );
              }
            }}
            onFocus={(e) => props.onFocus(e)}
            autocomplete="off"
          />
          <Label for="" text="Confirm Password" />
          <input
            {...props.inputProps}
            required={
              props.isEditMode ? isChangingOnEdit() : props.inputProps.required
            }
            type="password"
            ref={password2Ref!}
            pattern={props.inputProps.pattern}
            id={`${props.inputProps.id}2`}
            classList={{
              "invalid-input": props.isInvalid,
              "valid-input": !props.isInvalid,
            }}
            onInput={(e) => onPasswordUpdated(e)}
            onInvalid={(e) => {
              if (props.inputProps.required) {
                const target = e.target as HTMLInputElement;
                props.onInvalid(
                  e,
                  `${props.inputProps.id}2`,
                  target.validationMessage
                );
              }
            }}
            onFocus={(e) => props.onFocus(e)}
          />
        </div>
      </Show>
    </>
  );
};

export default PasswordField;
