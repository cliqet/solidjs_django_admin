import { sql } from "@codemirror/lang-sql";
import { CodeMirror } from "@solid-codemirror/codemirror";
import { basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useAppContext } from "src/context/sessionContext";
import { createSignal, onMount, Show } from "solid-js";
import BorderedSection from "../BorderedSection";
import {
  addRawQuery,
  changeRawQuery,
  deleteRawQuery,
  getRawQueryResults,
  getSavedRawQueries,
} from "src/services/saved-queries";
import QueryReportsTable, {
  initialTableData,
  ReportsDataType,
} from "../QueryReportsTable";
import SaveIcon from "src/assets/icons/save-icon";
import PencilEditIcon from "src/assets/icons/pencil-edit-icon";
import TrashDeleteIcon from "src/assets/icons/trash-delete-icon";
import SelectField from "../form_fields/SelectField";
import InputTypeField from "../form_fields/InputTypeField";

type SavedQueryType = {
  id: number;
  name: string;
  query: string;
};

const SqlQueryPanel = () => {
  let view: EditorView | undefined;
  const { appState, setAppState } = useAppContext();
  const [sqlCode, setSqlCode] = createSignal("");
  const [tableData, setTableData] =
    createSignal<ReportsDataType>(initialTableData);
  const [isSaving, setIsSaving] = createSignal(false);
  const [isEditing, setIsEditing] = createSignal(false);
  const [savedQueries, setSavedQueries] = createSignal<SavedQueryType[]>([]);
  const [currentSavedQueryId, setCurrentSavedQueryId] = createSignal<number>(0);
  const [isInvalidQueryName, setIsInvalidQueryName] = createSignal(false);
  const [saveAsQueryName, setSaveAsQueryName] = createSignal("");
  const [isDataReady, setIsDataReady] = createSignal(false);

  onMount(async () => {
    try {
      const savedQueriesResponse = await getSavedRawQueries();
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

  const setEditorValue = (newValue: string) => {
    if (view) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newValue,
        },
      });
    }
  };

  const onValueChange = (codeValue: string) => {
    setSqlCode(codeValue);
  };

  const onSubmitQuery = async () => {
    try {
      const response = await getRawQueryResults(sqlCode());
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

  const savedQueriesAsOptions = () => {
    let options = savedQueries().map((query) => {
      return { label: query.name, value: query.id, selected: false };
    });
    return [{ label: "-----------", value: 0, selected: true }, ...options];
  };

  const onDeleteSavedQuery = async () => {
    if (currentSavedQueryId() === 0) {
      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "message", "A query must be selected");
      setAppState("toastState", "type", "danger");

      return;
    }

    try {
      const response = await deleteRawQuery(currentSavedQueryId());

      const savedQueriesResponse = await getSavedRawQueries();
      setSavedQueries(savedQueriesResponse.queries);

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "message", response.message);
      setAppState("toastState", "type", "success");

      setSaveAsQueryName("");
      setSqlCode("");
      setEditorValue("");
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

  const onSelectSavedQuery = async (id: number) => {
    setCurrentSavedQueryId(id);
    if (id === 0) {
      setSqlCode("");
      setEditorValue(sqlCode());
      return;
    }

    const querySelected = savedQueries().find((query) => query.id === id);
    setSqlCode(querySelected?.query!);
    setEditorValue(sqlCode());
  };

  const onSaveQuery = async () => {
    if (!saveAsQueryName() || sqlCode() === "") {
      setIsInvalidQueryName(true);
      return;
    }

    try {
      const response = await addRawQuery(saveAsQueryName(), sqlCode());

      const savedQueriesResponse = await getSavedRawQueries();
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

  const onUpdateSavedQuery = async () => {
    if (!saveAsQueryName()) {
      setIsInvalidQueryName(true);
      return;
    }

    try {
      const response = await changeRawQuery(
        saveAsQueryName(),
        sqlCode(),
        currentSavedQueryId()
      );

      const savedQueriesResponse = await getSavedRawQueries();
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
  };

  const saveButtonText = () => {
    return isSaving() ? "Save" : "Update";
  };

  const onCancelSaveQuery = () => {
    setIsInvalidQueryName(false);
    setIsSaving(false);
    setIsEditing(false);
    setSaveAsQueryName("");
  };

  return (
    <Show when={isDataReady()}>
      <h3 class="text-red-500 text-sm my-3">
        NOTE: Any queries that update the state of the db is not allowed.
      </h3>

      <BorderedSection>
        <CodeMirror
          onEditorMount={(v: any) => (view = v)}
          extensions={[basicSetup, sql()]}
          theme={appState.themeMode === "dark" ? oneDark : undefined}
          onValueChange={onValueChange}
        />
      </BorderedSection>

      <BorderedSection>
        <div class="flex flex-col gap-2">
          <div class="flex gap-2">
            <h3 class="dark:text-white text-sm mb-2">Saved Queries</h3>
            <Show when={!isEditing()}>
              <span class="cursor-pointer" onClick={() => setIsSaving(true)}>
                <SaveIcon class="w-5 h-5 text-green-500" />
              </span>
            </Show>
            <Show when={currentSavedQueryId() !== 0}>
              <Show when={!isSaving()}>
                <span
                  class="cursor-pointer"
                  onClick={() => {
                    setIsEditing(true);
                    const queryNameEl = document.getElementById(
                      "query-name"
                    ) as HTMLInputElement;
                    if (queryNameEl) {
                      const currentQuery = savedQueries().find(
                        (query) => query.id === currentSavedQueryId()
                      );
                      queryNameEl.value = currentQuery?.name as string;
                      setSaveAsQueryName(queryNameEl.value);
                    }
                  }}
                >
                  <PencilEditIcon class="w-5 h-5 dark:text-white" />
                </span>
              </Show>

              <Show when={!isSaving() && !isEditing()}>
                <span class="cursor-pointer" onClick={onDeleteSavedQuery}>
                  <TrashDeleteIcon class="w-5 h-5 dark:text-white" />
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
        <button type="button" onClick={onSubmitQuery} class="button">
          Submit
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

export default SqlQueryPanel;
