import { createSignal, onMount, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { useAppContext } from "src/context/sessionContext";
import {
  authRoute,
  nonAuthRoute,
  dashboardRoute,
} from "src/hooks/useAdminRoute";
import { logoutUser } from "src/services/users";
import MoonIcon from "src/assets/icons/moon-icon";
import useStorageEvent from "src/hooks/useStorageEvent";
import SunIcon from "src/assets/icons/sun-icon";

const HeaderBar = () => {
  // const { appState, setAppState } = useAppContext();
  const [isProfileDropdownShowing, setIsProfileDropdownShowing] =
    createSignal(false);
  const { appState, setAppState } = useAppContext();
  const navigate = useNavigate();
  const { LOCAL_STORAGE_KEYS } = useStorageEvent();
  const [themeMode, setThemeMode] = createSignal("dark");
  const colorTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.colorTheme);

  const setToLightMode = () => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem(LOCAL_STORAGE_KEYS.colorTheme, "light");
    setThemeMode("light");
  }

  const setToDarkMode = () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem(LOCAL_STORAGE_KEYS.colorTheme, "dark");
    setThemeMode("dark");
  }

  onMount(() => {
    if (colorTheme && colorTheme === "light") {
      setToLightMode();
    }
    if (colorTheme && colorTheme === "dark") {
      setToDarkMode();
    }
  });

  const toggleMode = () => {
    if (themeMode() === "light") {
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

  const onClickOutsideToCloseSidebar = (event: MouseEvent) => {
    let sidebar = document.getElementById("logo-sidebar");

    const backdrop = sidebar?.getBoundingClientRect();
    if (
      event.clientX < backdrop!.left ||
      event.clientX > backdrop!.right ||
      event.clientY < backdrop!.top ||
      event.clientY > backdrop!.bottom
    ) {
      sidebar!.classList.remove("transform-none");
      sidebar!.classList.add("-translate-x-full");
      document.removeEventListener("click", onClickOutsideToCloseSidebar);
    }
  };

  const showAndHideSidebar = () => {
    let sidebar = document.getElementById("logo-sidebar");

    // Show the sidebar
    if (sidebar!.classList.contains("-translate-x-full")) {
      sidebar!.classList.remove("-translate-x-full");
      sidebar!.classList.add("transform-none");

      document.addEventListener("click", onClickOutsideToCloseSidebar);

      // Hide the sidebar
    } else {
      sidebar!.classList.remove("transform-none");
      sidebar!.classList.add("-translate-x-full");
    }
  };

  return (
    <>
      <nav
        id="header-bar"
        class="fixed flex items-center justify-between top-0 h-20 px-4 z-40 w-full border-b dark:bg-custom-dark dark:border-gray-700"
      >
        <div class="flex items-center justify-start">
          <button
            data-drawer-target="logo-sidebar"
            data-drawer-toggle="logo-sidebar"
            aria-controls="logo-sidebar"
            type="button"
            onClick={showAndHideSidebar}
            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            <span class="sr-only">Open sidebar</span>
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>

          <span class="ml-2 self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-custom-primary-lighter">
            <A href={dashboardRoute(authRoute.dashboardHomeView)}>MainApp</A>
          </span>
        </div>

        <div class="flex items-center">
          <div class="mr-2">
            <span class="cursor-pointer" onClick={toggleMode}>
              <Show when={themeMode() === "dark"}>
                <MoonIcon width={5} height={5} />
              </Show>
              <Show when={themeMode() === "light"}>
                <SunIcon width={5} height={5} />
              </Show>
            </span>
          </div>

          <Show when={appState.user}>
            <div class="flex items-center ml-3">
              <div>
                <A href={dashboardRoute(authRoute.documentationView)}>
                  <span class="dark:text-white text-xs underline mr-2 hover:cursor-pointer">
                    Docs
                  </span>
                </A>
              </div>

              <div>
                <span class="dark:text-white text-xs mr-2">
                  {appState.user?.email}
                </span>
              </div>

              {/* user icon */}
              <div class="md:block">
                <button
                  type="button"
                  class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  aria-expanded="false"
                  data-dropdown-toggle="dropdown-user"
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
        </div>
      </nav>
    </>
  );
};

export default HeaderBar;
