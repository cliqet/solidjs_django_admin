import { sql } from "@codemirror/lang-sql";
import { CodeMirror } from "@solid-codemirror/codemirror";
import { basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useAppContext } from "src/context/sessionContext";
import { createSignal, Show } from "solid-js";
import BorderedSection from "../BorderedSection";
import { getRawQueryResults } from "src/services/django-admin";
import QueryReportsTable, {
  initialTableData,
  ReportsDataType,
} from "../QueryReportsTable";

const SqlQueryPanel = () => {
  let view: EditorView | undefined;
  const { appState, setAppState } = useAppContext();
  const [sqlCode, setSqlCode] = createSignal("");
  const [tableData, setTableData] =
    createSignal<ReportsDataType>(initialTableData);

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

  return (
    <div>
      <h3 class="dark:text-white text-sm my-3">
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
        <button type="button" onClick={onSubmitQuery} class="button">
          Submit
        </button>
      </BorderedSection>

      <Show when={tableData()}>
        <BorderedSection>
          <QueryReportsTable data={tableData() as ReportsDataType} />
        </BorderedSection>
      </Show>
    </div>
  );
};

export default SqlQueryPanel;
