import { Component, createSignal, For, onMount, Setter, Show } from "solid-js";
import Label from "../form_fields/Label";
import DynamicFormField from "../form_fields/DynamicFormField";
import FieldErrorMessage from "../form_fields/FieldErrorMessage";
import {
  buildFieldStateOnError,
  buildFieldStateOnFieldChange,
  buildFieldStateOnFocus,
  buildModelFormData,
  initializeChangeFormFieldState,
  isReadOnlyField,
  updateFieldStateOnInvalidFields,
  updateModelFieldsWithDbValues,
} from "src/hooks/useModelAdmin";
import {
  FieldsInFormStateType,
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import { changeRecord, getModelFieldsEdit, getModelRecord } from "src/services/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { scrollToTopForm } from "src/hooks/useUI";
import PlusIcon from "src/assets/icons/plus-icon";
import { FIELDTYPE } from "src/constants/django-admin";

type InlineRowFormProps = {
  appLabel: string;
  modelName: string;
  pk: string;
  modelAdminSettings: ModelAdminSettingsType;
  onSave: () => void;
};

const InlineRowChangeForm: Component<InlineRowFormProps> = (props) => {
  const [isDataReady, setIsDataReady] = createSignal(false);

  // An object which contains the values from the db for the record
  // It has the key as the field name and the value as the db value
  const [modelRecord, setModelRecord] = createSignal<ModelFieldsObjType | null>(null);

  // An object which contains the field name as key and the value as an object with
  // field property types such as initial, type, etc
  const [modelFieldsEdit, setModelFieldsEdit] = createSignal<ModelFieldsObjType>({});

  // An object that contains the key as the field name and its state such as the value,
  // isInvalid, etc from initial data load and whenever a field changes value
  // This is where form data gets values to pass to the backend
  const [fieldsInFormState, setFieldsInFormState] = createSignal<FieldsInFormStateType | null>(null);
  const { appState, setAppState } = useAppContext();

  onMount(async () => {
    try {
      // Setup model record
      const recordData = await getModelRecord(
        props.appLabel,
        props.modelName,
        props.pk
      );
      setModelRecord(recordData.record);

      // Setup model fields for edit
      const modelFieldsData = await getModelFieldsEdit(
        props.appLabel,
        props.modelName,
        props.pk
      );
      setModelFieldsEdit(modelFieldsData.fields);

      // Setup form fields state
      const formFields = initializeChangeFormFieldState(
        props.modelAdminSettings,
        modelRecord() as ModelFieldsObjType,
        modelFieldsEdit()
      );
      setFieldsInFormState(formFields);

      // UPDATE model fields with modelRecord data to have those values as initial values
      const newModelFields = updateModelFieldsWithDbValues(
        modelFieldsEdit(), 
        modelRecord() as ModelFieldsObjType
      );
      setModelFieldsEdit(newModelFields);

      setIsDataReady(true);
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured. Please refresh the page. ${err.message}`,
        type: "danger",
      });
    }
  });

  const onSave = async (e: Event) => {
    e.preventDefault();

    const formData = buildModelFormData(
      modelFieldsEdit(),
      fieldsInFormState() as FieldsInFormStateType,
      e.target as HTMLFormElement
    );

    try {
      await changeRecord(
        props.appLabel,
        props.modelName,
        props.pk,
        formData
      );

      props.onSave();
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
          message: `An error occured while saving. ${err.message}`,
          type: "danger",
        });
      }

      // Scroll up to show error message
      scrollToTopForm("change-model-row-form");
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

    scrollToTopForm("change-model-row-form");
  };

  const handleOnFocus = (field: string) => {
    const newFieldsState = buildFieldStateOnFocus(
      fieldsInFormState() as FieldsInFormStateType,
      field
    );
    setFieldsInFormState(newFieldsState);
  };

  return (
    <Show when={isDataReady()}>
      <div class="bg-white dark:bg-slate-800 p-2 rounded-md">
        <h1 class="text-xl font-bold dark:text-slate-200">
          Change {props.modelAdminSettings.model_name}
        </h1>

        <form id="change-model-row-form" class="mt-3" onSubmit={(e) => onSave(e)}>
          <For each={props.modelAdminSettings.fieldsets}>
            {(fieldset, i) => (
              <div>
                <div class="bg-custom-primary p-2 rounded-t-md my-3">
                  <h3 class="text-white">{fieldset.title}</h3>
                </div>
                <div class="w-1/2">
                  <For each={fieldset.fields}>
                    {(field, j) => (
                      <>
                        <div class="p-1 my-2">
                          <div class="flex">
                            <Label
                              for={field}
                              text={modelFieldsEdit()[field].label}
                            />
                            <Show
                              when={[
                                FIELDTYPE.ForeignKey,
                                FIELDTYPE.OneToOneField,
                              ].includes(modelFieldsEdit()[field].type)}
                            >
                              <span class="ml-3 cursor-pointer">
                                <a
                                  href={`/dashboard/${
                                    modelFieldsEdit()[field].foreignkey_app
                                  }/${modelFieldsEdit()[
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
                            field={modelFieldsEdit()[field]}
                            isReadonly={isReadOnlyField(
                              field,
                              props.modelAdminSettings.readonly_fields
                            )}
                            modelAdminSettings={props.modelAdminSettings}
                            isEditMode={true}
                          />

                          <Show when={modelFieldsEdit()[field].help_text}>
                            <div class="px-1">
                              <span class="text-xs text-slate-500 dark:text-slate-300">
                                {modelFieldsEdit()[field].help_text}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </Show>
  );
};

export default InlineRowChangeForm;
