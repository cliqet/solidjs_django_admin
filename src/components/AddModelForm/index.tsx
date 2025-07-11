import { Component, createSignal, For, onMount, Setter, Show } from "solid-js";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import {
  FieldsInFormStateType,
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { addRecord } from "src/services/django-admin";
import { useNavigate } from "@solidjs/router";
import AngleUpIcon from "src/assets/icons/angle-up-icon";
import AngleDownIcon from "src/assets/icons/angle-down-icon";
import { useUI } from "src/hooks/useUI";
import Fieldset from "../Fieldset";

type AddModelFormProps = {
  appLabel: string;
  modelName: string;
  fieldsInFormState: FieldsInFormStateType | null;
  setFieldsInFormState: Setter<FieldsInFormStateType | null>;
  modelAdminSettings: ModelAdminSettingsType;
  modelFields: ModelFieldsObjType;
  canAdd: boolean;
};

const AddModeOptions = {
  DEFAULT: "DEFAULT",
  ADD_ANOTHER: "ADD_ANOTHER",
  ADD_CONTINUE: "ADD_CONTINUE",
};

const AddModelForm: Component<AddModelFormProps> = (props) => {
  const { appState, setAppState } = useAppContext();
  const [addMode, setAddMode] = createSignal(AddModeOptions.DEFAULT);
  const navigate = useNavigate();
  const { scrollToTopForm } = useUI();
  const {
    buildFieldStateOnError,
    buildModelFormData,
  } = useModelAdmin();
  const [fieldsetSectionsIsOpen, setFieldsetSectionsIsOpen] = createSignal<
    boolean[]
  >([]);
  const [isDataReady, setIsDataReady] = createSignal(false);

  onMount(() => {
    props.modelAdminSettings.fieldsets.forEach((fieldset) => {
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

      if (addMode() === AddModeOptions.DEFAULT) {
        navigate(`/dashboard/${props.appLabel}/${props.modelName}`);
      } else if (addMode() === AddModeOptions.ADD_ANOTHER) {
        navigate(`/dashboard/${props.appLabel}/${props.modelName}`);
        setTimeout(() => {
          navigate(`/dashboard/${props.appLabel}/${props.modelName}/add`);
        }, 100);
      } else {
        navigate(
          `/dashboard/${props.appLabel}/${props.modelName}/${response.pk}/change`
        );
      }
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
                      <AngleUpIcon class="w-4 h-4 dark:text-white" />
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
                      <AngleDownIcon class="w-4 h-4 dark:text-white" />
                    </span>
                  </Show>
                </div>

                <div
                  class="w-full"
                  classList={{
                    hidden: !fieldsetSectionsIsOpen()[i()],
                    "": fieldsetSectionsIsOpen()[i()],
                  }}
                >
                  <For each={fieldset.fields}>
                    {(field, j) => (
                      <Fieldset 
                        field={field}
                        modelFields={props.modelFields}
                        fieldsInFormState={props.fieldsInFormState}
                        setFieldsInFormState={props.setFieldsInFormState}
                        modelAdminSettings={props.modelAdminSettings}
                      />
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>

          <Show when={props.canAdd}>
            <div>
              <button
                type="submit"
                class="button"
                onClick={() => setAddMode(AddModeOptions.DEFAULT)}
              >
                Add
              </button>
              <button
                type="submit"
                class="button"
                onClick={() => setAddMode(AddModeOptions.ADD_ANOTHER)}
              >
                Add and Add Another
              </button>
              <button
                type="submit"
                class="button"
                onClick={() => setAddMode(AddModeOptions.ADD_CONTINUE)}
              >
                Add and Continue
              </button>
            </div>
          </Show>
        </form>
      </div>
    </Show>
  );
};

export default AddModelForm;
