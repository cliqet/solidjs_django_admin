import { Component, createSignal, For, onMount, Setter, Show } from "solid-js";
import Label from "../form_fields/Label";
import DynamicFormField from "../form_fields/DynamicFormField";
import FieldErrorMessage from "../form_fields/FieldErrorMessage";
import {
  buildFieldStateOnError,
  buildFieldStateOnFieldChange,
  buildFieldStateOnFocus,
  buildModelFormData,
  handleFetchError,
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
import { changeRecord, deleteRecord, getModelRecord } from "src/services/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { scrollToTopForm } from "src/hooks/useUI";
import PlusIcon from "src/assets/icons/plus-icon";
import { FIELDTYPE } from "src/constants/django-admin";
import Modal from "../Modal";
import ActionModalMessage from "../ActionModalMessage";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import { useNavigate } from "@solidjs/router";

type ChangeModelFormProps = {
  appLabel: string;
  modelName: string;
  pk: string;
  modelAdminSettings: ModelAdminSettingsType;
  modelFields: ModelFieldsObjType;
  setModelFields: Setter<ModelFieldsObjType>;
  canDelete: boolean;
};

const ChangeModelForm: Component<ChangeModelFormProps> = (props) => {
  const [isDataReady, setIsDataReady] = createSignal(false);

  // An object which contains the values from the db for the record
  // It has the key as the field name and the value as the db value
  const [modelRecord, setModelRecord] = createSignal<ModelFieldsObjType | null>(
    null
  );

  // An object that contains the key as the field name and its state such as the value,
  // isInvalid, etc from initial data load and whenever a field changes value
  // This is where form data gets values to pass to the backend
  const [fieldsInFormState, setFieldsInFormState] =
    createSignal<FieldsInFormStateType | null>(null);

  const { appState, setAppState } = useAppContext();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const navigate = useNavigate();
  let modalEventPromise: (event: string) => void;

  onMount(async () => {
    // Setup model record
    const recordData = await getModelRecord(
      props.appLabel,
      props.modelName,
      props.pk
    );
    setModelRecord(recordData.record);

    // Setup state for formFields get all the fields and have each in formFieldState
    const formFields = initializeChangeFormFieldState(
      props.modelAdminSettings,
      modelRecord() as ModelFieldsObjType,
      props.modelFields
    );
    setFieldsInFormState(formFields);

    // UPDATE model fields with modelRecord data to have those values as initial values
    const newModelFields = updateModelFieldsWithDbValues(
      props.modelFields, 
      modelRecord() as ModelFieldsObjType
    );

    props.setModelFields(newModelFields);

    setIsDataReady(true);
  });

  const onModalEvent = async (modalEvent: string) => {
    setIsModalOpen(false);
    if (modalEventPromise) {
      modalEventPromise(modalEvent); // Resolve the promise with the modal event
    }
  };

  const onConfirmDelete = async () => {
    try {
      const response = await deleteRecord(props.appLabel, props.modelName, props.pk);

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "type", "success");
      setAppState("toastState", "message", response.message);
      setAppState("toastState", "persist", true);

      navigate(`/dashboard/${props.appLabel}/${props.modelName}`);
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState("toastState", "type", "danger");
        setAppState("toastState", "isShowing", true);
        setAppState("toastState", "message", err.message ?? handler.message);
        scrollToTopForm("change-model-form");
      }
    }
  }

  const onDelete = async () => {
    setIsModalOpen(true);

    // Return a promise that resolves based on user action
    await new Promise((resolve) => {
      modalEventPromise = resolve; // Store the resolve function
    }).then((event) => {
      if (event === "confirm") {
        onConfirmDelete(); // Proceed only if confirmed
      }
    });
  }

  const onSave = async (e: Event) => {
    e.preventDefault();

    const formData = buildModelFormData(
      props.modelFields,
      fieldsInFormState() as FieldsInFormStateType,
      e.target as HTMLFormElement
    );

    try {
      const response = await changeRecord(
        props.appLabel,
        props.modelName,
        props.pk,
        formData
      );

      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: response.message,
        type: "success",
      });

      scrollToTopForm("change-model-form");
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
      scrollToTopForm("change-model-form");
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

    scrollToTopForm("change-model-form");
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
      <div>
        <h1 class="text-xl font-bold dark:text-slate-200">
          Change {props.modelAdminSettings.model_name}
        </h1>

        <form id="change-model-form" class="mt-3" onSubmit={(e) => onSave(e)}>
          <For each={props.modelAdminSettings.fieldsets}>
            {(fieldset, i) => (
              <div>
                <div class="bg-custom-primary p-2 rounded-t-md my-3">
                  <h3 class="text-white">{fieldset.title}</h3>
                </div>
                <div class="w-full sm:w-3/4 lg:w-1/2">
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
                                  <PlusIcon width={5} height={5} />
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
                              fieldsInFormState()?.[field].isInvalid as boolean
                            }
                            field={props.modelFields[field]}
                            isReadonly={isReadOnlyField(
                              field,
                              props.modelAdminSettings.readonly_fields
                            )}
                            modelAdminSettings={props.modelAdminSettings}
                            isEditMode={true}
                          />

                          <Show when={props.modelFields[field].help_text}>
                            <div class="px-1">
                              <span class="text-xs text-slate-500 dark:text-slate-300">
                                {props.modelFields[field].help_text}
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
            <Show when={props.canDelete}>
              <button type="button" class="button-danger" onClick={onDelete}>
                Delete
              </button>
            </Show>
          </div>
        </form>
      </div>

      {/** Modal */}
      <Show when={isModalOpen()}>
        <Modal
          modalEvent={(modalEvent) => {
            onModalEvent(modalEvent);
          }}
          modalBody={<ActionModalMessage action="delete" />}
        />
      </Show>
    </Show>
  );
};

export default ChangeModelForm;
