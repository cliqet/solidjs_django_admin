import { A } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";
import { getApps } from "src/services/django-admin";
import { getUserPermissions } from "src/services/users";
import PlusIcon from "src/assets/icons/plus-icon";
import { hasAddModelPermission, hasAppPermission, hasModelPermission } from "src/hooks/useModelAdmin";
import { useAppContext } from "src/context/sessionContext";
import { UserPermissionsType } from "src/models/user";

type ModelPermissionType = {
  add: boolean;
  change: boolean;
  delete: boolean;
  view: boolean;
};

type AppModelType = {
  name: string;
  objectName: string;
  adminUrl: string;
  addUrl: string;
  perms: ModelPermissionType;
  viewOnly: boolean;
};

type AppSettingsType = {
  name: string;
  appLabel: string;
  appUrl: string;
  hasModulePerms: boolean;
  models: AppModelType[];
};

const SideBar = () => {
  const [apps, setApps] = createSignal<AppSettingsType[]>([]);
  const [userPermissions, setUserPermissions] = createSignal<UserPermissionsType | null>(null);
  const { appState, setAppState } = useAppContext();

  createEffect(async () => {
    try {
      // get list of apps
      const appResponse = await getApps();
      setApps(appResponse);

      // get user permissions
      const permissionResponse = await getUserPermissions(appState.user?.uid as string);
      setUserPermissions(permissionResponse.permissions);
    } catch (err: any) {
      setAppState('toastState', 'isShowing', true);
      setAppState('toastState', 'message', err.message ?? 'Something went wrong. Please refresh the page');
      setAppState('toastState', 'type', 'danger');
    }
  });

  return (
    <Show when={apps() && userPermissions()}>
      <div class="w-1/5 h-full bg-gray-800 p-2 text-white text-sm overflow-auto">
        <div
          class="group flex flex-col gap-2 py-2 data-[collapsed=true]:py-2"
          data-collapsed="false"
        >
          <For each={apps()}>
            {(app, i) => (
              <Show when={hasAppPermission(userPermissions() as UserPermissionsType, app.appLabel)}>
                <div class="bg-gray-600 px-2 flex items-center rounded-sm">
                  <span class="font-bold">{app.name}</span>
                </div>
                <nav class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                  <For each={app.models}>
                    {(model, j) => (
                      <Show 
                        when={
                          hasModelPermission(
                            userPermissions() as UserPermissionsType,
                            app.appLabel,
                            model.objectName.toLowerCase()
                          )
                        }
                      >
                        <ul
                        class="inline-flex items-center font-medium h-8 rounded-md px-3 text-sm justify-start"
                      >
                        <div class="mr-2">
                          <A href={model.adminUrl} class="hover:underline">{model.name}</A>
                        </div>
                        <span class="ml-auto">
                          <Show 
                            when={
                              hasAddModelPermission(
                                userPermissions() as UserPermissionsType,
                                app.appLabel,
                                model.objectName.toLowerCase()
                              )
                            }
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
      </div>
    </Show>
  );
};

export default SideBar;
