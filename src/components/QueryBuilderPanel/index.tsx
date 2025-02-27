import { createSignal, For, onMount, Show } from "solid-js";
import CloseCircleIcon from "src/assets/icons/close-circle-icon";
import PlusIcon from "src/assets/icons/plus-icon";
import InputTypeField from "src/components/form_fields/InputTypeField";
import Label from "src/components/form_fields/Label";
import SelectField, {
  SelectedOptionsType,
} from "src/components/form_fields/SelectField";
import { useAppContext } from "src/context/sessionContext";
import { AppSettingsType, ModelFieldsObjType } from "src/models/django-admin";
import { getApps, getModelFields } from "src/services/django-admin";
import { 
  addQueryBuilder, 
  changeQueryBuilder, 
  deleteQueryBuilder, 
  getBuildQueryResults, 
  getSavedQueryBuilders
} from "src/services/saved-queries";
import BorderedSection from "../BorderedSection";
import QueryReportsTable, {
  initialTableData,
  ReportsDataType,
} from "../QueryReportsTable";
import SaveIcon from "src/assets/icons/save-icon";
import PencilEditIcon from "src/assets/icons/pencil-edit-icon";
import TrashDeleteIcon from "src/assets/icons/trash-delete-icon";

type AppModelListType = {
  label: string;
  value: string;
  models: {
    label: string;
    value: string;
  }[];
};

type ConditionType = [string, string, any];

type QueryBuilderType = {
  app_name: string;
  model_name: string;
  conditions: ConditionType[];
  orderings: string[];
  query_limit: number | null;
};

type SavedQueryType = {
  id: number;
  name: string;
  query: QueryBuilderType;
};

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
  const [tableData, setTableData] =
    createSignal<ReportsDataType>(initialTableData);
  const [isSaving, setIsSaving] = createSignal(false);
  const [isEditing, setIsEditing] = createSignal(false);
  const [isInvalidQueryName, setIsInvalidQueryName] = createSignal(false);
  const [saveAsQueryName, setSaveAsQueryName] = createSignal("");
  const [savedQueries, setSavedQueries] = createSignal<SavedQueryType[]>([]);
  const [currentSavedQueryId, setCurrentSavedQueryId] = createSignal<number>(0);

  const resetQueryBuilder = () => {
    setConditions([]);
    setOrderings([]);
    setQueryLimit(null);
  };

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

      const savedQueriesResponse = await getSavedQueryBuilders();
      setSavedQueries(savedQueriesResponse.queries);

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

  const queryData = () => {
    return {
      app_name: currentApp(),
      model_name: currentModel(),
      conditions: conditions(),
      orderings: orderings(),
      query_limit: queryLimit(),
    };
  };

  const runQueryBuilder = async () => {
    try {
      const response = await getBuildQueryResults(queryData());
      setTableData(response);
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

  const onSaveQuery = async () => {
    if (!saveAsQueryName()) {
      setIsInvalidQueryName(true);
      return;
    }

    try {
      const response = await addQueryBuilder(saveAsQueryName(), queryData());

      const savedQueriesResponse = await getSavedQueryBuilders();
      setSavedQueries(savedQueriesResponse.queries);

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "message", response.message);
      setAppState("toastState", "type", "success");

      setIsInvalidQueryName(false);
      setIsSaving(false);
      setSaveAsQueryName("");
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ??
          err.validation_error ??
          "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  };

  const onCancelSaveQuery = () => {
    setIsInvalidQueryName(false);
    setIsSaving(false);
    setIsEditing(false);
    setSaveAsQueryName("");
  };

  const savedQueriesAsOptions = () => {
    let options = savedQueries().map((query) => {
      return { label: query.name, value: query.id, selected: false };
    });
    return [{ label: "-----------", value: 0, selected: true }, ...options];
  };

  const onSelectSavedQuery = async (id: number) => {
    setCurrentSavedQueryId(id);

    if (id === 0) {
      resetQueryBuilder();
      return;
    }

    try {
      const querySelected = savedQueries().find((query) => query.id === id);

      // Update app select field
      const appEl = document.getElementById('app-name') as HTMLSelectElement;
      if (appEl) {
        appEl.value = querySelected?.query.app_name as string;
        await onAppChange(querySelected?.query.app_name as string);
      }
      
      // Update model select field
      const modelEl = document.getElementById('model-name') as HTMLSelectElement;
      if (modelEl) {
        modelEl.value = querySelected?.query.model_name as string;
        await onModelChange(querySelected?.query.model_name as string);
      }

      // Update condition values in fields
      setConditions(querySelected?.query.conditions as ConditionType[]);
      conditions().forEach((condition, i) => {
        let fieldEl = document.getElementById(`field${i}`) as HTMLSelectElement;
        let operatorEl = document.getElementById(`operator${i}`) as HTMLSelectElement;
        let fieldValueEl = document.getElementById(`field-value${i}`) as HTMLInputElement;

        fieldEl.value = condition[0];
        operatorEl.value = condition[1];
        fieldValueEl.value = condition[2];
      });

      // Update orderings values in fields
      setOrderings(querySelected?.query.orderings as string[]);
      orderings().forEach((ordering, i) => {
        let orderingEl = document.getElementById(`ordering-field${i}`) as HTMLSelectElement;
        orderingEl.value = ordering;
      });

      // Update query limit field
      setQueryLimit(querySelected?.query.query_limit as number | null);
      let limitEl = document.getElementById('limit') as HTMLInputElement;
      limitEl.value = `${querySelected?.query.query_limit ?? ""}`;
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

  const onUpdateSavedQuery = async () => {
    if (!saveAsQueryName()) {
      setIsInvalidQueryName(true);
      return;
    }

    try {
      const response = await changeQueryBuilder(
        saveAsQueryName(), 
        queryData(), 
        currentSavedQueryId()
      );

      const savedQueriesResponse = await getSavedQueryBuilders();
      setSavedQueries(savedQueriesResponse.queries);

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "message", response.message);
      setAppState("toastState", "type", "success");

      setIsInvalidQueryName(false);
      setIsEditing(false);
      setSaveAsQueryName("");
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ??
          err.validation_error ??
          "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  }

  const onDeleteSavedQuery = async () => {
    if (currentSavedQueryId() === 0) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        "A query must be selected"
      );
      setAppState("toastState", "type", "danger");

      return;
    }

    try {
      const response = await deleteQueryBuilder(currentSavedQueryId());

      const savedQueriesResponse = await getSavedQueryBuilders();
      setSavedQueries(savedQueriesResponse.queries);

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "message", response.message);
      setAppState("toastState", "type", "success");

      setSaveAsQueryName("");
    } catch (err: any) {
      setAppState("toastState", "isShowing", true);
      setAppState(
        "toastState",
        "message",
        err.message ??
          err.validation_error ??
          "Something went wrong. Please refresh the page"
      );
      setAppState("toastState", "type", "danger");
    }
  }

  const saveButtonText = () => {
    return isSaving() ? "Save" : "Update"; 
  }

  return (
    <Show when={isDataReady()}>
      <BorderedSection>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="flex items-center gap-3">
            <div>
              <Label for="app-name" text="App" />
            </div>
            <div class="w-9/12">
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
          </div>

          <div class="flex items-center gap-3">
            <div>
              <Label for="model-name" text="Model" />
            </div>
            <div class="w-9/12">
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
        </div>
      </BorderedSection>

      <BorderedSection>
        <div class="flex gap-2">
          <h3 class="dark:text-white text-sm mb-2">Conditions</h3>
          <span class="cursor-pointer" onClick={addConditionRow}>
            <PlusIcon class="w-5 h-5 text-custom-primary-lighter"  />
          </span>
        </div>

        <For each={conditions()}>
          {(condition, i) => (
            <div class="flex flex-col sm:flex-row gap-3 sm:items-center mb-2">
              <div class="w-full sm:w-4/12">
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
              <div class="w-full sm:w-4/12">
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
              <div class="w-full sm:w-4/12">
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
                  <CloseCircleIcon class="w-6 h-6 text-gray-800" />
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
            <PlusIcon class="w-5 h-5 text-custom-primary-lighter" />
          </span>
        </div>

        <For each={orderings()}>
          {(ordering, i) => (
            <div class="flex gap-3 items-center mb-2">
              <div class="w-9/12 sm:w-1/2">
                <SelectField
                  selectProps={{
                    id: `ordering-field${i()}`,
                    class: "text-xs",
                  }}
                  options={modelFieldChoices()}
                  onChangeValue={(value, _) => {
                    onSelectOrderingField(i(), value);
                  }}
                />
              </div>
              <div class="w-3/12 sm:w-1/2">
                <span
                  class="cursor-pointer"
                  onClick={() => removeOrderingRow(i())}
                >
                  <CloseCircleIcon class="w-6 h-6 text-gray-800" />
                </span>
              </div>
            </div>
          )}
        </For>
      </BorderedSection>

      <BorderedSection>
        <h3 class="dark:text-white text-sm mb-2">Limit Results</h3>
        <div class="w-full sm:w-3/12">
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
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <h3 class="dark:text-white text-sm mb-2">Saved Queries</h3>
            <Show when={!isEditing()}>
              <span class="cursor-pointer" onClick={() => setIsSaving(true)}>
                <SaveIcon class="w-5 h-5 dark:text-white" />
              </span>
            </Show>
            <Show when={currentSavedQueryId() !== 0}>
              <Show when={!isSaving()}>
                <span class="cursor-pointer" onClick={() => {
                  setIsEditing(true);
                  const queryNameEl = document.getElementById('query-name') as HTMLInputElement;
                  if (queryNameEl) {
                    const currentQuery = savedQueries().find(query => query.id === currentSavedQueryId());
                    queryNameEl.value = currentQuery?.name as string;
                    setSaveAsQueryName(queryNameEl.value);
                  }
                }}>
                  <PencilEditIcon class="w-5 h-5 dark:text-white" />
                </span>
              </Show>

              <Show when={!isSaving() && !isEditing()}>
                <span class="cursor-pointer" onClick={onDeleteSavedQuery}>
                  <TrashDeleteIcon width={5} height={5} />
                </span>
              </Show>
            </Show>
          </div>

          <Show when={!isSaving()}>
            <div>
              <SelectField
                selectProps={{
                  id: "saved-query",
                  class: "text-xs",
                }}
                options={savedQueriesAsOptions()}
                onChangeValue={(value, _) => {
                  onSelectSavedQuery(+value);
                }}
              />
            </div>
          </Show>

          <Show when={isSaving() || isEditing()}>
            <div class="flex flex-col gap-2">
              <div class="w-full sm:w-6/12">
                <InputTypeField
                  inputProps={{
                    id: "query-name",
                    type: "text",
                    value: "",
                    class: "text-xs",
                    placeholder: "Name of query",
                  }}
                  isInvalid={isInvalidQueryName()}
                  onInvalid={() => {}}
                  onFocus={() => setIsInvalidQueryName(false)}
                  onChangeValue={(value, _) => {
                    setSaveAsQueryName(value);
                  }}
                />
              </div>
            </div>
            <div>
              <button 
                type="button" 
                class="button" 
                onClick={async () => {
                  if (isSaving()) {
                    await onSaveQuery();
                  } else {
                    await onUpdateSavedQuery();
                  }  
                }}
              >
                {saveButtonText()}
              </button>
              <button
                type="button"
                class="button-outline"
                onClick={onCancelSaveQuery}
              >
                Cancel
              </button>
            </div>
          </Show>
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
