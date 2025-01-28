import { useParams } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import FieldErrorMessage from "src/components/form_fields/FieldErrorMessage";
import Label from "src/components/form_fields/Label";
import PasswordField from "src/components/form_fields/PasswordField";
import { useAppContext } from "src/context/sessionContext";
import {
  buildFieldStateOnFieldChange,
  buildFieldStateOnFocus,
  updateFieldStateOnInvalidFields,
} from "src/hooks/useModelAdmin";
import { FieldsInFormStateType } from "src/models/django-admin";
import { verifyPasswordResetLink } from "src/services/django-admin";

const initialState = {
  password: {
    fieldName: "password",
    value: "",
    isInvalid: false,
    errorMsg: "",
  },
  password2: {
    fieldName: "password2",
    value: "",
    isInvalid: false,
    errorMsg: "",
  },
};

const PasswordResetLinkPage = () => {
  const params = useParams();
  const { appState, setAppState } = useAppContext();
  const [isValidLink, setIsValidLink] = createSignal(false);
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [formFieldState, setFormFieldState] =
    createSignal<FieldsInFormStateType>(initialState);

  const handleOnFocus = () => {
    const newFieldState = buildFieldStateOnFocus(formFieldState(), "password");
    setFormFieldState(newFieldState);
  };

  onMount(async () => {
    try {
      const response = await verifyPasswordResetLink(
        params.uidb64,
        params.token
      );
      setIsDataReady(true);

      if (response.valid) {
        setIsValidLink(true);
      }
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "message", err.message);
      setAppState("toastState", "type", "danger");
    }
  });

  const handleInvalidFields = (
    e: Event,
    id: string,
    validationMessage: string
  ) => {
    updateFieldStateOnInvalidFields(
      id,
      formFieldState(),
      validationMessage,
      setFormFieldState
    );
  };

  const onReset = async (e: Event) => {
    e.preventDefault();
    console.log("state is", formFieldState());
  };

  const handleFieldChangeValue = (value: string, fieldName: string) => {
    const newFieldsState = buildFieldStateOnFieldChange(
      formFieldState(),
      fieldName,
      value,
      null
    );

    setFormFieldState(newFieldsState);
  };

  return (
    <Show when={isDataReady()}>
      <div class="w-full bg-custom-dark">
        <Show when={isValidLink()}>
          <form
            onSubmit={onReset}
            class="w-1/4 mx-auto mt-20 p-4 rounded-md border bg-custom-dark"
          >
            <h3 class="text-white text-lg mb-3">Reset Password</h3>

            <Show when={true}>
              <Label for="password" text="Enter Password" />
              <PasswordField
                onFocus={handleOnFocus}
                onInvalid={(
                  e: Event,
                  id: string,
                  validationMessage: string
                ) => {
                  handleInvalidFields(e, id, validationMessage);
                }}
                onChangeValue={(value, fieldName) => {
                  handleFieldChangeValue(value, fieldName);
                }}
                isInvalid={formFieldState()["password"].isInvalid}
                inputProps={{
                  id: "password",
                  pattern: "^(?=.*\\d).{8,}$",
                  required: true,
                }}
              />

              <Show when={true}>
                <FieldErrorMessage
                  message={formFieldState()["password"].errorMsg}
                />
              </Show>

              <div class="my-5">
                <button type="submit" class="button">
                  Reset
                </button>
              </div>
            </Show>
          </form>
        </Show>
      </div>
    </Show>
  );
};

export default PasswordResetLinkPage;
