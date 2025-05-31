import { createSignal, For, onMount, Show, type Component } from "solid-js";
import SearchInput from "./components/SearchInput";
import { useAppContext } from "./context/sessionContext";
import { getApps } from "./services/django-admin";
import { useModelAdmin } from "./hooks/useModelAdmin";
import { useAdminRoute } from "./hooks/useAdminRoute";
import { useNavigate } from "@solidjs/router";

type ModelRouteType = {
  app: string;
  model: string;
  route: string;
}

const App: Component = (props) => {
  const { appState, setAppState } = useAppContext();
  const { handleFetchError } = useModelAdmin();
  const { nonAuthRoute } = useAdminRoute();
  const navigate = useNavigate();
  const [modelRoutes, setModelRoutes] = createSignal<ModelRouteType[]>([]);
  const [searchResults, setSearchResults] = createSignal<ModelRouteType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal("");

  const builtinRoutes: ModelRouteType[] = [
    { app: "Settings", model: "Queues", route: "/dashboard/settings/queues" },
    { app: "Settings", model: "Query Reports", route: "/dashboard/settings/query-reports" },
  ];

  onMount(async () => {
    try {
      const apps = await getApps();
      let models: ModelRouteType[] = [];
      apps.forEach(app => {
        app.models.forEach(model => {
          models.push({
            app: app.name,
            model: model.name,
            route: model.adminUrl
          });
        })
      });
      models = [...models, ...builtinRoutes];
      setModelRoutes(models);
      setSearchResults(models);
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState("toastState", "type", "danger");
        setAppState("toastState", "isShowing", true);
        setAppState("toastState", "message", err.message ?? handler.message);
      }
    }
  });

  const onSearch = (searchText: string) => {
    setSearchTerm(searchText);

    const results = modelRoutes().filter(routes => {
      return routes.app.toLowerCase().includes(
        searchTerm().toLowerCase()
      ) || routes.model.toLowerCase().includes(
        searchText.toLowerCase()
      ); 
    });

    setSearchResults(results);
  }

  return (
    <Show when={modelRoutes()}>
      <h1 class="dark:text-white text-lg">Welcome to your admin dashboard</h1>
      <div class="my-8 flex items-center justify-center">
        <div class="w-full md:w-1/2">
          <SearchInput
            inputProps={{
              id: "app-search",
              placeholder: "Search here...",
              required: true,
              value: "",
            }}
            onChangeValue={(value: string, fieldName: string) => onSearch(value)}
          />
          <div
            classList={{
              "custom-scrollbar-dark": appState.themeMode === "dark",
            }} 
            class="z-10 w-full divide-y divide-gray-100 rounded-lg shadow-sm max-h-80 overflow-y-auto"
          >
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <For
                each={searchResults()}
              >
                {(modelRoute, i) => (
                  <div>
                    <li>
                      <a
                        href={modelRoute.route}
                        class="block px-4 py-2 hover:text-orange-500"
                      >
                        <span class="text-sm">{ modelRoute.app } - { modelRoute.model }</span>
                      </a>
                    </li>
                    <div class="flex justify-center px-4 py-0">
                      <hr class="border-gray-300 dark:border-gray-500 w-full" />
                    </div>
                  </div>
                )}
              </For>
            </ul>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default App;
