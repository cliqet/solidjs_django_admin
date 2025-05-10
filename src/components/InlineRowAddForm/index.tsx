import { Component, createSignal, For, onMount, Setter, Show } from "solid-js";
import Label from "../form_fields/Label";
import DynamicFormField from "../form_fields/DynamicFormField";
import FieldErrorMessage from "../form_fields/FieldErrorMessage";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import {
  AddModelFormProps,
  FieldsInFormStateType,
} from "src/models/django-admin";
import { useUI } from "src/hooks/useUI";
import { useAppContext } from "src/context/sessionContext";
import { addRecord } from "src/services/django-admin";
import PlusIcon from "src/assets/icons/plus-icon";
import { FIELDTYPE } from "src/constants/django-admin";


const InlineRowAddForm: Component<AddModelFormProps> = (props) => {
  const { scrollToTopForm } = useUI();
  const {
    buildFieldStateOnError,
    buildFieldStateOnFieldChange,
    buildFieldStateOnFocus,
    buildModelFormData,
    initializeAddFormFieldState,
    isReadOnlyField,
    updateFieldStateOnInvalidFields,
    helpTextPrefix,
  } = useModelAdmin();
  const { appState, setAppState } = useAppContext();
  const [fieldsInFormState, setFieldsInFormState] =
    createSignal<FieldsInFormStateType | null>(null);
  const formId = `add-inline-${crypto.randomUUID()}`;

  onMount(() => {
    try {
      // get all the fields and have each in formFieldState
      const formFields = initializeAddFormFieldState(
        props.modelAdminSettings,
        props.modelFields
      );

      setFieldsInFormState(formFields);
    } catch (err: any) {

    }
  });

  const onAdd = async (e: Event) => {
    e.preventDefault();

    const formData = buildModelFormData(
      props.modelFields,
      fieldsInFormState() as FieldsInFormStateType,
      e.target as HTMLFormElement
    );

    try {
      const response = await addRecord(
        props.appLabel,
        props.modelName,
        formData
      );

      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: response.message,
        type: "success",
      });

      props.onAddFn();
    } catch (err: any) {
      if (err.validation_error) {
        const newFieldsState = buildFieldStateOnError(
          fieldsInFormState() as FieldsInFormStateType,
          err
        );
        setFieldsInFormState(newFieldsState);
      }

      // Server error
      if (err.has_error) {
        setAppState("toastState", {
          ...appState.toastState,
          isShowing: true,
          message: err.message,
          type: "danger",
        });
      }

      // Scroll up to show error message
      scrollToTopForm(formId);
    }
  };

  // Update fields state for every changes in value of fields
  const handleFieldChangeValue = (
    value: any,
    fieldName: string,
    metadata?: any
  ) => {
    const newFieldsState = buildFieldStateOnFieldChange(
      fieldsInFormState() as FieldsInFormStateType,
      fieldName,
      value,
      metadata
    );

    setFieldsInFormState(newFieldsState);
  };

  const handleInvalidFields = (
    e: Event,
    id: string,
    validationMessage: string
  ) => {
    // prevent default error of browser for field
    e.preventDefault();

    updateFieldStateOnInvalidFields(
      id,
      fieldsInFormState() as FieldsInFormStateType,
      validationMessage,
      setFieldsInFormState as Setter<FieldsInFormStateType>
    );

    scrollToTopForm(formId);
  };

  const handleOnFocus = (field: string) => {
    const newFieldsState = buildFieldStateOnFocus(
      fieldsInFormState() as FieldsInFormStateType,
      field
    );
    setFieldsInFormState(newFieldsState);
  };

  return (
    <>
      <div>
        <h1 class="text-xl font-bold dark:text-slate-200">
          Add {props.modelAdminSettings.model_name}
        </h1>

        <form id={formId} class="mt-3" onSubmit={onAdd}>
          <For each={props.modelAdminSettings.fieldsets}>
            {(fieldset, i) => (
              <div>
                <div class="bg-custom-primary p-2 rounded-t-md my-3">
                  <h3 class="text-white">{fieldset.title}</h3>
                </div>
                <div class="w-full md:w-1/2">
                  <For each={fieldset.fields}>
                    {(field, j) => (
                      <>
                        <div class="p-1 my-2">
                          <div class="flex">
                            <Label
                              for={field}
                              text={props.modelFields[field].label}
                            />
                            <Show
                              when={[
                                FIELDTYPE.ForeignKey,
                                FIELDTYPE.OneToOneField,
                              ].includes(props.modelFields[field].type)}
                            >
                              <span class="ml-3 cursor-pointer">
                                <a
                                  href={`/dashboard/${
                                    props.modelFields[field].foreignkey_app
                                  }/${props.modelFields[
                                    field
                                  ].foreignkey_model?.toLowerCase()}/add`}
                                  target="_blank"
                                >
                                  <PlusIcon class="w-5 h-5 text-custom-primary-lighter"  />
                                </a>
                              </span>
                            </Show>
                          </div>
                          <DynamicFormField
                            onFocus={() => handleOnFocus(field)}
                            onInvalid={(
                              e: Event,
                              id: string,
                              validationMessage: string
                            ) => {
                              handleInvalidFields(e, id, validationMessage);
                            }}
                            onFieldChangeValue={(
                              value,
                              fieldName,
                              metadata
                            ) => {
                              handleFieldChangeValue(
                                value,
                                fieldName,
                                metadata
                              );
                            }}
                            isInvalid={
                              fieldsInFormState()?.[field]
                                .isInvalid as boolean
                            }
                            field={props.modelFields[field]}
                            isReadonly={isReadOnlyField(
                              field,
                              props.modelAdminSettings.readonly_fields
                            )}
                            modelAdminSettings={props.modelAdminSettings}
                          />

                          <Show when={props.modelFields[field].help_text}>
                            <div class="px-1 py-1 text-xs text-slate-500 dark:text-slate-300 leading-tight">
                              <span
                                innerHTML={
                                  `${helpTextPrefix(
                                    props.modelFields[field].required
                                  )}${props.modelFields[field].help_text}`
                                }
                              >
                              </span>
                            </div>
                          </Show>

                          <Show
                            when={
                              !props.modelAdminSettings.readonly_fields.includes(
                                field
                              )
                            }
                          >
                            <div class="px-1">
                              <FieldErrorMessage
                                message={
                                  fieldsInFormState()?.[field]
                                    .errorMsg as string
                                }
                              />
                            </div>
                          </Show>
                        </div>
                        <hr class="border-t-1 border-slate-400 mb-3" />
                      </>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>

          <div>
            <button type="submit" class="button">
              Add
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InlineRowAddForm;
