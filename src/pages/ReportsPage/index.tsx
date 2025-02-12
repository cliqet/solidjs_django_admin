import { createSignal } from "solid-js";
import QueryBuilderPanel from "src/components/QueryBuilderPanel";

const TABS = {
  QUERY_BUILDER: "QUERY_BUILDER",
  SQL_QUERY: "SQL_QUERY",
};

const ReportsPage = () => {
  const [activeTab, setActiveTab] = createSignal(TABS.QUERY_BUILDER);

  return (
    <div>
      <h1 class="text-xl dark:text-white mb-5">Reports</h1>

      <div class="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul class="flex flex-wrap -mb-px">
          <li class="me-2">
            <span
              onClick={() => setActiveTab(TABS.QUERY_BUILDER)}
              classList={{
                "text-custom-primary border-b-2 border-custom-primary":
                  activeTab() === TABS.QUERY_BUILDER,
                "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 border-transparent":
                  activeTab() !== TABS.QUERY_BUILDER,
              }}
              class="inline-block p-4 rounded-t-lg cursor-pointer"
            >
              Query Builder
            </span>
          </li>
          <li class="me-2">
            <span
              onClick={() => setActiveTab(TABS.SQL_QUERY)}
              classList={{
                "text-custom-primary border-b-2 border-custom-primary":
                  activeTab() === TABS.SQL_QUERY,
                "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 border-transparent":
                  activeTab() !== TABS.SQL_QUERY,
              }}
              class="inline-block p-4 rounded-t-lg cursor-pointer"
            >
              SQL Query
            </span>
          </li>
        </ul>
      </div>

      {/** Content */}
      <QueryBuilderPanel />
    </div>
  );
};

export default ReportsPage;
