import { createSignal, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { useAppContext } from "src/context/sessionContext";
import {
  authRoute,
  nonAuthRoute,
  dashboardRoute,
} from "src/hooks/useAdminRoute";
import { logoutUser } from "src/services/users";
import MoonIcon from "src/assets/icons/moon-icon";
import SunIcon from "src/assets/icons/sun-icon";

const HeaderBar = () => {
  const [isProfileDropdownShowing, setIsProfileDropdownShowing] =
    createSignal(false);
  const { appState, setAppState, setToDarkMode, setToLightMode } =
    useAppContext();
  const navigate = useNavigate();

  const toggleMode = () => {
    if (appState.themeMode === "light") {
      setToDarkMode();
    } else {
      setToLightMode();
    }
  };

  const handleClickOutsideProfileDropdown = (e: MouseEvent) => {
    if (isProfileDropdownShowing()) {
      setIsProfileDropdownShowing(false);
      document.removeEventListener("click", handleClickOutsideProfileDropdown);
    }
  };

  return (
    <>
      <nav
        id="header-bar"
        class="fixed flex items-center justify-between top-0 h-20 px-4 z-40 w-full border-b bg-custom-primary dark:bg-custom-dark dark:border-gray-700"
      >
        <div class="flex items-center justify-start">
          <span class="ml-2 self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-white">
            <A href={dashboardRoute(authRoute.dashboardHomeView)}>MainApp</A>
          </span>
        </div>

        <div class="flex items-center">
          <div class="mr-2">
            <span class="cursor-pointer" onClick={toggleMode}>
              <Show when={appState.themeMode === "dark"}>
                <MoonIcon class="w-5 h-5 text-white" />
              </Show>
              <Show when={appState.themeMode === "light"}>
                <SunIcon class="w-5 h-5 text-white" />
              </Show>
            </span>
          </div>

          <Show when={appState.user}>
            <div class="flex items-center ml-3">
              <div>
                <A href={dashboardRoute(authRoute.documentationView)}>
                  <span class="text-white text-xs underline mr-2 hover:cursor-pointer">
                    Docs
                  </span>
                </A>
              </div>

              <div class="hidden md:block">
                <span class="text-white text-xs mr-2">
                  {appState.user?.email}
                </span>
              </div>

              {/* user icon */}
              <div class="md:block">
                <button
                  type="button"
                  class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  aria-expanded="false"
                  onClick={() => {
                    setIsProfileDropdownShowing((showStatus) => !showStatus);
                    document.addEventListener(
                      "click",
                      handleClickOutsideProfileDropdown
                    );
                  }}
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="w-8 h-8 rounded-full relative bg-white flex items-center justify-center">
                    <span class="tracking-tight">
                      {appState.user?.initials}
                    </span>
                  </div>
                </button>
              </div>

              {/* Profile Dropdown */}
              <Show when={isProfileDropdownShowing()}>
                <div
                  class="absolute w-40 top-12 right-2 z-50 my-4 text-base list-none divide-y rounded shadow bg-slate-50 dark:bg-gray-700 divide-gray-600"
                  id="dropdown-user"
                >
                  <div class="px-4 py-3" role="none">
                    <p class="text-xs dark:text-white" role="none">
                      {appState.user?.first_name} {appState.user?.last_name}
                    </p>
                    <p
                      class="text-xs font-medium dark:text-white truncate"
                      role="none"
                    >
                      {appState.user?.email}
                    </p>
                  </div>
                  <ul class="py-1" role="none">
                    <li>
                      <span
                        onClick={() =>
                          navigate(dashboardRoute(authRoute.settingsView))
                        }
                        class="block cursor-pointer px-4 py-2 text-xs dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500"
                        role="menuitem"
                      >
                        Settings
                      </span>
                    </li>
                    <li>
                      <span
                        class="block cursor-pointer px-4 py-2 text-xs dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500"
                        role="menuitem"
                        onClick={async () => {
                          try {
                            logoutUser();
                            localStorage.clear();
                            setAppState("user", null);
                            navigate(nonAuthRoute.loginView);
                          } catch (err: any) {
                            setAppState("toastState", {
                              ...appState.toastState,
                              isShowing: true,
                              message: "An error occured while logging out",
                              type: "danger",
                            });
                          }
                        }}
                      >
                        Sign out
                      </span>
                    </li>
                  </ul>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={!appState.user}>
            <div class="flex items-center ml-3">
              <div>
                <A href={dashboardRoute(nonAuthRoute.loginView)}>
                  <span class="text-white text-xs underline mr-2 hover:cursor-pointer">
                    Login
                  </span>
                </A>
              </div>
            </div>
          </Show>
        </div>
      </nav>
    </>
  );
};

export default HeaderBar;
