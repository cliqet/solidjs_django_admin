import { Component, createSignal, For, onMount, Setter, Show } from "solid-js";
import Label from "../form_fields/Label";
import DynamicFormField from "../form_fields/DynamicFormField";
import FieldErrorMessage from "../form_fields/FieldErrorMessage";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import {
  FieldsInFormStateType,
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { addRecord } from "src/services/django-admin";
import PlusIcon from "src/assets/icons/plus-icon";
import { useNavigate } from "@solidjs/router";
import { FIELDTYPE } from "src/constants/django-admin";
import AngleUpIcon from "src/assets/icons/angle-up-icon";
import AngleDownIcon from "src/assets/icons/angle-down-icon";
import { useUI } from "src/hooks/useUI";

type AddModelFormProps = {
  appLabel: string;
  modelName: string;
  fieldsInFormState: FieldsInFormStateType | null;
  setFieldsInFormState: Setter<FieldsInFormStateType | null>;
  modelAdminSettings: ModelAdminSettingsType;
  modelFields: ModelFieldsObjType;
  canAdd: boolean;
};

const AddModelForm: Component<AddModelFormProps> = (props) => {
  const { appState, setAppState } = useAppContext();
  const navigate = useNavigate();
  const { scrollToTopForm } = useUI();
  const {
    buildFieldStateOnError,
    buildFieldStateOnFieldChange,
    buildFieldStateOnFocus,
    buildModelFormData,
    isReadOnlyField,
    updateFieldStateOnInvalidFields,
  } = useModelAdmin();
  const [fieldsetSectionsIsOpen, setFieldsetSectionsIsOpen] = createSignal<boolean[]>([]);
  const [isDataReady, setIsDataReady] = createSignal(false);

  onMount(() => {
    props.modelAdminSettings.fieldsets.forEach(fieldset => {
      fieldsetSectionsIsOpen().push(true);
    });
    setIsDataReady(true);
  });

  const onAdd = async (e: Event) => {
    e.preventDefault();

    const formData = buildModelFormData(
      props.modelFields,
      props.fieldsInFormState as FieldsInFormStateType,
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
        persist: true,
      });

      navigate(`/dashboard/${props.appLabel}/${props.modelName}`);
    } catch (err: any) {
      if (err.validation_error) {
        const newFieldsState = buildFieldStateOnError(
          props.fieldsInFormState as FieldsInFormStateType,
          err
        );
        props.setFieldsInFormState(newFieldsState);
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
      scrollToTopForm("add-model-form");
    }
  };

  // Update fields state for every changes in value of fields
  const handleFieldChangeValue = (
    value: any,
    fieldName: string,
    metadata?: any
  ) => {
    const newFieldsState = buildFieldStateOnFieldChange(
      props.fieldsInFormState as FieldsInFormStateType,
      fieldName,
      value,
      metadata
    );

    props.setFieldsInFormState(newFieldsState);
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
      props.fieldsInFormState as FieldsInFormStateType,
      validationMessage,
      props.setFieldsInFormState as Setter<FieldsInFormStateType>
    );

    scrollToTopForm("add-model-form");
  };

  const handleOnFocus = (field: string) => {
    const newFieldsState = buildFieldStateOnFocus(
      props.fieldsInFormState as FieldsInFormStateType,
      field
    );
    props.setFieldsInFormState(newFieldsState);
  };

  const helpTextPrefix = (isRequired: boolean) => {
    return isRequired ? "Required: " : "Optional: ";
  };

  return (
    <Show when={isDataReady()}>
      <div>
        <h1 class="text-xl font-bold dark:text-slate-200">
          Add {props.modelAdminSettings.model_name}
        </h1>

        <form id="add-model-form" class="mt-3" onSubmit={onAdd}>
          <For each={props.modelAdminSettings.fieldsets}>
            {(fieldset, i) => (
              <div>
                <div class="bg-custom-primary p-2 rounded-t-md my-3 flex justify-between">
                  <h3 class="text-white">{fieldset.title}</h3>
                  <Show when={fieldsetSectionsIsOpen()[i()]}>
                    <span
                      onClick={() => {
                        let sections = [...fieldsetSectionsIsOpen()];
                        sections[i()] = false;
                        setFieldsetSectionsIsOpen(sections);
                      }}
                      class="cursor-pointer"
                    >
                      <AngleUpIcon class="w-5 h-5 dark:text-white" />
                    </span>
                  </Show>
                  <Show when={!fieldsetSectionsIsOpen()[i()]}>
                    <span
                      onClick={() => {
                        let sections = [...fieldsetSectionsIsOpen()];
                        sections[i()] = true;
                        setFieldsetSectionsIsOpen(sections);
                      }}
                      class="cursor-pointer"
                    >
                      <AngleDownIcon class="w-5 h-5 dark:text-white" />
                    </span>
                  </Show>
                </div>

                <div 
                  class="w-full sm:w-3/4 lg:w-1/2"
                  classList={{
                    "hidden": !fieldsetSectionsIsOpen()[i()],
                    "": fieldsetSectionsIsOpen()[i()]
                  }}
                >
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
                                  <PlusIcon class="w-5 h-5 text-custom-primary-lighter" />
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
                              props.fieldsInFormState?.[field]
                                .isInvalid as boolean
                            }
                            field={props.modelFields[field]}
                            isReadonly={isReadOnlyField(
                              field,
                              props.modelAdminSettings.readonly_fields
                            )}
                            modelAdminSettings={props.modelAdminSettings}
                          />

                          <div class="px-1">
                            <span class="text-xs text-slate-500 dark:text-slate-300">
                              {helpTextPrefix(
                                props.modelFields[field].required
                              )}
                              {props.modelFields[field].help_text}
                            </span>
                          </div>

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
                                  props.fieldsInFormState?.[field]
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

          <Show when={props.canAdd}>
            <div>
              <button type="submit" class="button">
                Add
              </button>
            </div>
          </Show>
        </form>
      </div>
    </Show>
  );
};

export default AddModelForm;
