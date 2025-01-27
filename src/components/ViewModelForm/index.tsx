import { Component, createSignal, For, onMount, Show } from "solid-js";
import {
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import Label from "../form_fields/Label";
import DynamicViewOnlyField from "../form_fields/DynamicViewOnlyField";
import { getModelRecord } from "src/services/django-admin";

type ViewModelFormProps = {
  appLabel: string;
  modelName: string;
  pk: string;
  modelAdminSettings: ModelAdminSettingsType;
  modelFields: ModelFieldsObjType;
};

const ViewModelForm: Component<ViewModelFormProps> = (props) => {
  const [isDataReady, setIsDataReady] = createSignal(false);

  // An object which contains the values from the db for the record
  // It has the key as the field name and the value as the db value
  const [modelRecord, setModelRecord] = createSignal<ModelFieldsObjType | null>(
    null
  );

  onMount(async () => {
    // Setup model record
    const recordData = await getModelRecord(
      props.appLabel,
      props.modelName,
      props.pk
    );
    setModelRecord(recordData.record);

    setIsDataReady(true);
  });

  return (
    <Show when={isDataReady()}>
      <div>
        <h1 class="text-xl font-bold text-slate-200">
          View {props.modelAdminSettings.model_name}
        </h1>

        <div id="view-model-form" class="mt-3">
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
                          <Label
                            for={field}
                            text={props.modelFields[field].label}
                          />
                          <DynamicViewOnlyField 
                            modelRecord={modelRecord()}
                            fieldName={props.modelFields[field].name}
                            fieldType={props.modelFields[field].type}
                            modelField={props.modelFields[field]}
                          />
                        </div>
                        <hr class="border-t-1 border-slate-400 mb-3" />
                      </>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};

export default ViewModelForm;
