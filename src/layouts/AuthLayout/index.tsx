import { Component, ErrorBoundary, JSX, onMount } from "solid-js";
import HeaderBar from "src/components/HeaderBar";
import SideBar from "src/components/SideBar";
import { useAppContext } from "src/context/sessionContext";
import { User } from "src/models/user";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "@solidjs/router";
import { useAdminRoute } from "src/hooks/useAdminRoute";
import ToastAlert from "src/components/ToastAlert";
import ErrorBoundaryContent from "src/components/ErrorBoundaryContent";
import { useStorageEvent } from "src/hooks/useStorageEvent";

type AuthLayoutProps = {
  children?: JSX.Element | JSX.Element[]; // Type for children
};

const AuthLayout: Component<AuthLayoutProps> = (props: any) => {
  const { appState, setAppState } = useAppContext();
  const { LOCAL_STORAGE_KEYS } = useStorageEvent();
  const navigate = useNavigate();
  const { nonAuthRoute } = useAdminRoute();

  onMount(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.token);

    if (token) {
      try {
        const tokenPayload: User = jwtDecode(token);
        setAppState("user", { ...tokenPayload });
      } catch (err) {
        setAppState("user", null);
        navigate(
          `${nonAuthRoute.loginView}?redirect=${encodeURI(location.pathname)}`
        );
        setAppState("toastState", {
          ...appState.toastState,
          isShowing: true,
          message: "Invalid token",
          type: "danger",
        });
        localStorage.clear();
      }
    } else {
      setAppState("user", null);
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: "Please sign in to access dashboard",
        type: "danger",
      });
      navigate(
        `${nonAuthRoute.loginView}?redirect=${encodeURI(location.pathname)}`
      );
    }
  });

  return (
    <div>
      <div class="h-screen flex flex-col overflow-hidden dark:bg-black">
        <HeaderBar />

        <div class="pt-20 flex flex-1 overflow-hidden">
          <SideBar />
          <div
            id="auth-main"
            classList={{
              "hidden": !appState.isSidebarMinimized && appState.screenSize === 'xs',
              "custom-scrollbar-dark": appState.themeMode === "dark",
            }}
            class="border-l border-slate-300 container px-4 pt-4 pb-20 flex-1 overflow-auto dark:bg-black"
          >
            <ErrorBoundary
              fallback={(err, reset) => <ErrorBoundaryContent error={err} />}
            >
              <ToastAlert />
              {props.children}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
