import { A, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";
import { getApps } from "src/services/django-admin";
import { getUserPermissions } from "src/services/users";
import PlusIcon from "src/assets/icons/plus-icon";
import {
  handleFetchError,
  hasAddModelPermission,
  hasAppPermission,
  hasModelPermission,
} from "src/hooks/useModelAdmin";
import { useAppContext } from "src/context/sessionContext";
import { UserPermissionsType } from "src/models/user";
import ChevronLeftIcon from "src/assets/icons/chevron-left-icon";
import ChevronRightIcon from "src/assets/icons/chevron-right-icon";
import AngleDown from "src/assets/icons/angle-down";
import AngleUp from "src/assets/icons/angle-up";
import { AppSettingsType } from "src/models/django-admin";
import { nonAuthRoute } from "src/hooks/useAdminRoute";

const SideBar = () => {
  const [apps, setApps] = createSignal<AppSettingsType[]>([]);
  const [userPermissions, setUserPermissions] =
    createSignal<UserPermissionsType | null>(null);
  const { appState, setAppState, toggleSidebarWidth } = useAppContext();
  const [appsIsOpen, setAppsIsOpen] = createSignal<boolean[]>([]);
  const navigate = useNavigate();

  createEffect(async () => {
    try {
      // get list of apps
      const appResponse = await getApps();
      setApps(appResponse);

      appResponse.forEach(() => {
        appsIsOpen().push(true);
      });

      // get user permissions
      const permissionResponse = await getUserPermissions(
        appState.user?.uid as string
      );
      setUserPermissions(permissionResponse.permissions);
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

  return (
    <Show when={apps() && userPermissions()}>
      <div
        id="logo-sidebar"
        class="relative h-full dark:bg-gray-800 p-2 dark:text-white text-sm overflow-y-auto overflow-x-hidden no-scrollbar"
        classList={{
          "w-full md:w-1/4 lg:w-1/5": !appState.isSidebarMinimized,
          "w-5": appState.isSidebarMinimized,
        }}
      >
        <div
          class="group flex flex-col gap-2 py-2 data-[collapsed=true]:py-2"
          data-collapsed="false"
          classList={{
            "": !appState.isSidebarMinimized,
            hidden: appState.isSidebarMinimized,
          }}
        >
          <For each={apps()}>
            {(app, i) => (
              <Show
                when={hasAppPermission(
                  userPermissions() as UserPermissionsType,
                  app.appLabel
                )}
              >
                <div
                  onClick={() => {
                    const openStates = [...appsIsOpen()];
                    openStates[i()] = !openStates[i()];
                    setAppsIsOpen(openStates);
                  }}
                  class="bg-custom-primary-lighter text-white px-2 py-1 flex items-center rounded-sm justify-between"
                >
                  <span class="font-bold">{app.name}</span>
                  <Show when={appsIsOpen()[i()]}>
                    <span class="cursor-pointer">
                      <AngleUp width={5} height={5} />
                    </span>
                  </Show>
                  <Show when={!appsIsOpen()[i()]}>
                    <span class="cursor-pointer">
                      <AngleDown width={5} height={5} />
                    </span>
                  </Show>
                </div>
                <nav
                  classList={{
                    hidden: !appsIsOpen()[i()],
                    "": appsIsOpen()[i()],
                  }}
                  class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
                >
                  <For each={app.models}>
                    {(model, j) => (
                      <Show
                        when={hasModelPermission(
                          userPermissions() as UserPermissionsType,
                          app.appLabel,
                          model.objectName.toLowerCase()
                        )}
                      >
                        <ul class="inline-flex items-center font-medium h-8 rounded-md px-3 text-sm justify-start">
                          <div class="mr-2">
                            <A href={model.adminUrl} class="hover:underline">
                              {model.name}
                            </A>
                          </div>
                          <span class="ml-auto">
                            <Show
                              when={hasAddModelPermission(
                                userPermissions() as UserPermissionsType,
                                app.appLabel,
                                model.objectName.toLowerCase()
                              )}
                            >
                              <A href={model.addUrl}>
                                <PlusIcon width={4} height={4} />
                              </A>
                            </Show>
                          </span>
                        </ul>
                      </Show>
                    )}
                  </For>
                </nav>
              </Show>
            )}
          </For>
        </div>
        <div class="absolute top-60 right-[-12px] rounded-full h-7 w-7 bg-custom-primary flex items-center justify-left">
          <span class="cursor-pointer" onClick={toggleSidebarWidth}>
            <Show when={appState.isSidebarMinimized}>
              <ChevronRightIcon width={5} height={5} />
            </Show>
            <Show when={!appState.isSidebarMinimized}>
              <ChevronLeftIcon width={5} height={5} />
            </Show>
          </span>
        </div>
      </div>
    </Show>
  );
};

export default SideBar;
