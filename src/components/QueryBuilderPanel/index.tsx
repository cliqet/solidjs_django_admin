import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import CloseCircle from "src/assets/icons/close-circle";
import PlusIcon from "src/assets/icons/plus-icon";
import InputTypeField from "src/components/form_fields/InputTypeField";
import Label from "src/components/form_fields/Label";
import SelectField, {
  SelectedOptionsType,
} from "src/components/form_fields/SelectField";
import { useAppContext } from "src/context/sessionContext";
import { AppSettingsType, ModelFieldsObjType } from "src/models/django-admin";
import { getApps, getBuildQueryResults, getModelFields } from "src/services/django-admin";
import BorderedSection from "../BorderedSection";
import QueryReportsTable, { ReportsDataType } from "../QueryReportsTable";

type AppModelListType = {
  label: string;
  value: string;
  models: {
    label: string;
    value: string;
  }[];
};

type ConditionType = [string, string, any];


const QueryBuilderPanel = () => {
  const [conditions, setConditions] = createSignal<ConditionType[]>([]);
  const [orderings, setOrderings] = createSignal<string[]>([]);
  const [queryLimit, setQueryLimit] = createSignal<number | null>(null);
  const [appModelList, setAppModelList] = createSignal<AppModelListType[]>([]);
  const [currentApp, setCurrentApp] = createSignal("");
  const [currentModel, setCurrentModel] = createSignal("");
  const [modelChoices, setModelChoices] = createSignal<SelectedOptionsType[]>(
    []
  );
  const { setAppState } = useAppContext();
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType>({});
  const [modelFieldChoices, setModelFieldChoices] = createSignal<
    SelectedOptionsType[]
  >([]);
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [tableData, setTableData] = createSignal<ReportsDataType | null>(null);

  const transformToAppModelList = (appList: AppSettingsType[]) => {
    const appModelList = appList.map((app) => {
      const modelList = app.models.map((model) => {
        return { label: model.name, value: model.objectName };
      });

      return {
        label: app.name,
        value: app.appLabel,
        models: modelList,
      };
    });

    return appModelList;
  };

  const appListChoices = () => {
    let choices: SelectedOptionsType[] = [];

    appModelList().forEach((app, i) => {
      choices.push({
        selected: i === 0 ? true : false,
        value: app.value,
        label: app.label,
      });
    });

    return choices;
  };

  const createModelListChoices = (appValue: string) => {
    let choices: SelectedOptionsType[] = [];

    appModelList().forEach((app) => {
      if (app.value === appValue) {
        app.models.forEach((model, i) => {
          choices.push({
            selected: i === 0 ? true : false,
            value: model.value,
            label: model.label,
          });
        });
      }
    });

    setModelChoices(choices);
    return choices;
  };

  const createModelFieldChoices = (modelFields: ModelFieldsObjType) => {
    let choices: SelectedOptionsType[] = [];

    Object.keys(modelFields).forEach((fieldName, i) => {
      choices.push({
        selected: i === 0 ? true : false,
        value: fieldName,
        label: modelFields[fieldName]["label"],
      });
    });

    setModelFieldChoices(choices);
    return choices;
  };

  const updateModelFieldsAndFieldChoices = async (
    appName: string,
    modelName: string
  ) => {
    const modelFieldsData = await getModelFields(appName, modelName);
    setModelFields(modelFieldsData.fields);
    return createModelFieldChoices(modelFieldsData.fields);
  };

  onMount(async () => {
    // get list of apps
    try {
      const appResponse = await getApps();
      const transformedList = transformToAppModelList(appResponse);
      setAppModelList(transformedList);
      setCurrentApp(transformedList[0].value);
      setCurrentModel(transformedList[0].models[0].value);
      createModelListChoices(transformedList[0].value);

      await updateModelFieldsAndFieldChoices(currentApp(), currentModel());

      setIsDataReady(true);
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ?? "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  });

  const updateConditions = (firstModelField: string) => {
    const newConditions = conditions().map((condition) => {
      condition[0] = firstModelField;
      return condition;
    });

    setConditions(newConditions);
  };

  const updateOrderings = (firstModelField: string) => {
    const newOrderings = orderings().map((order) => {
      return firstModelField;
    });

    setOrderings(newOrderings);
  };

  // on app change
  const onAppChange = async (appSelected: string) => {
    setCurrentApp(appSelected);

    const newModelChoices = createModelListChoices(appSelected);
    setCurrentModel(newModelChoices[0].value);

    try {
      const newModelFieldChoices = await updateModelFieldsAndFieldChoices(
        currentApp(),
        newModelChoices[0].value
      );

      // update conditions
      updateConditions(newModelFieldChoices[0].value);

      // update orderings
      updateOrderings(newModelFieldChoices[0].value);
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ?? "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  };

  // on model change
  const onModelChange = async (modelSelected: string) => {
    setCurrentModel(modelSelected);

    try {
      const newModelFieldChoices = await updateModelFieldsAndFieldChoices(
        currentApp(),
        modelSelected
      );

      // update conditions
      updateConditions(newModelFieldChoices[0].value);

      // update orderings
      updateOrderings(newModelFieldChoices[0].value);
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ?? "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  };

  const addConditionRow = () => {
    const currentConditions = [...conditions()];
    currentConditions.push([modelFieldChoices()[0].value, "equals", null]);
    setConditions(currentConditions);
  };

  const removeConditionRow = (index: number) => {
    const currentConditions = [...conditions()];
    currentConditions.splice(index, 1);
    setConditions(currentConditions);
  };

  const addOrderingRow = () => {
    const currentOrderings = [...orderings()];
    currentOrderings.push(modelFieldChoices()[0].value);
    setOrderings(currentOrderings);
  };

  const removeOrderingRow = (index: number) => {
    const currentOrderings = [...orderings()];
    currentOrderings.splice(index, 1);
    setOrderings(currentOrderings);
  };

  const onSelectConditionField = (index: number, fieldName: string) => {
    let currentConditions = [...conditions()];
    currentConditions[index][0] = fieldName;
    setConditions(currentConditions);
  };

  const onSelectConditionOperator = (index: number, operator: string) => {
    let currentConditions = [...conditions()];
    currentConditions[index][1] = operator;
    setConditions(currentConditions);
  };

  const onChangeConditionValue = (index: number, value: any) => {
    let currentConditions = [...conditions()];
    currentConditions[index][2] = value;
    setConditions(currentConditions);
  };

  const onSelectOrderingField = (index: number, fieldName: string) => {
    let currentOrderings = [...orderings()];
    currentOrderings[index] = fieldName;
    setOrderings(currentOrderings);
  };

  const onChangeLimitValue = (value: string) => {
    setQueryLimit(+value);
  };

  const runQueryBuilder = async () => {
    const bodyData = {
      'app_name': currentApp(),
      'model_name': currentModel(),
      'conditions': conditions(),
      'orderings': orderings(),
      'query_limit': queryLimit()
    }

    try {
      const response = await getBuildQueryResults(bodyData);
      setTableData(response);
      console.log(response);
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ?? "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  };

  return (
    <Show when={isDataReady()}>
      <BorderedSection>
        <div class="flex items-center gap-4">
          <div>
            <Label for="app-name" text="App" />
          </div>
          <div class="w-4/12">
            <SelectField
              selectProps={{
                id: "app-name",
                class: "text-xs",
              }}
              options={appListChoices()}
              onChangeValue={async (value, _) => {
                await onAppChange(value);
              }}
            />
          </div>

          <div>
            <Label for="model-name" text="Model" />
          </div>
          <div class="w-4/12">
            <SelectField
              selectProps={{
                id: "model-name",
                class: "text-xs",
              }}
              options={modelChoices()}
              onChangeValue={async (value, _) => {
                onModelChange(value);
              }}
            />
          </div>
        </div>
      </BorderedSection>

      <BorderedSection>
        <div class="flex gap-2">
          <h3 class="dark:text-white text-sm mb-2">Conditions</h3>
          <span class="cursor-pointer" onClick={addConditionRow}>
            <PlusIcon width={5} height={5} />
          </span>
        </div>

        <For each={conditions()}>
          {(condition, i) => (
            <div class="flex gap-3 items-center mb-2">
              <div class="w-3/12">
                <SelectField
                  selectProps={{
                    id: `field${i()}`,
                    class: "text-xs",
                  }}
                  options={modelFieldChoices()}
                  onChangeValue={(value, _) => {
                    onSelectConditionField(i(), value);
                  }}
                />
              </div>
              <div class="w-3/12">
                <SelectField
                  selectProps={{
                    id: `operator${i()}`,
                    class: "text-xs",
                  }}
                  options={[
                    { selected: true, value: "equals", label: "equals" },
                    {
                      selected: false,
                      value: "not_equals",
                      label: "not equals",
                    },
                    { selected: false, value: "gt", label: ">" },
                    { selected: false, value: "gte", label: ">=" },
                    { selected: false, value: "lt", label: "<" },
                    { selected: false, value: "lte", label: "<=" },
                  ]}
                  onChangeValue={(value, _) => {
                    onSelectConditionOperator(i(), value);
                  }}
                />
              </div>
              <div class="w-3/12">
                <InputTypeField
                  inputProps={{
                    id: `field-value${i()}`,
                    type: "text",
                    value: "",
                    class: "text-xs",
                  }}
                  isInvalid={false}
                  onInvalid={() => {}}
                  onFocus={() => {}}
                  onChangeValue={(value, _) => {
                    onChangeConditionValue(i(), value);
                  }}
                />
              </div>
              <div class="w-1/2">
                <span
                  class="cursor-pointer"
                  onClick={() => removeConditionRow(i())}
                >
                  <CloseCircle />
                </span>
              </div>
            </div>
          )}
        </For>
      </BorderedSection>

      <BorderedSection>
        <div class="flex gap-2">
          <h3 class="dark:text-white text-sm mb-2">Ordering</h3>
          <span class="cursor-pointer" onClick={addOrderingRow}>
            <PlusIcon width={5} height={5} />
          </span>
        </div>

        <For each={orderings()}>
          {(ordering, i) => (
            <div class="flex gap-3 items-center mb-2">
              <div class="w-3/12">
                <SelectField
                  selectProps={{
                    id: `field${i()}`,
                    class: "text-xs",
                  }}
                  options={modelFieldChoices()}
                  onChangeValue={(value, _) => {
                    onSelectOrderingField(i(), value);
                  }}
                />
              </div>
              <div class="w-1/2">
                <span
                  class="cursor-pointer"
                  onClick={() => removeOrderingRow(i())}
                >
                  <CloseCircle />
                </span>
              </div>
            </div>
          )}
        </For>
      </BorderedSection>

      <BorderedSection>
        <h3 class="dark:text-white text-sm mb-2">Limit Results</h3>
        <div class="w-3/12">
          <InputTypeField
            inputProps={{
              id: "limit",
              type: "number",
              value: "",
              class: "text-xs",
              placeholder: "Leave empty for all results",
            }}
            isInvalid={false}
            onInvalid={() => {}}
            onFocus={() => {}}
            onChangeValue={(value, _) => {
              onChangeLimitValue(value);
            }}
          />
        </div>
      </BorderedSection>

      <BorderedSection>
        <button type="button" class="button" onClick={runQueryBuilder}>
          Run Query
        </button>
      </BorderedSection>

      <Show when={tableData()}>
        <BorderedSection>
          <QueryReportsTable data={tableData() as ReportsDataType} />
        </BorderedSection>
        </Show>
    </Show>
  );
};

export default QueryBuilderPanel;
