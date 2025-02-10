import { Component, ErrorBoundary, JSX, onMount } from "solid-js";
import HeaderBar from "src/components/HeaderBar";
import SideBar from "src/components/SideBar";
import { useAppContext } from "src/context/sessionContext";
import useStorageEvent from "src/hooks/useStorageEvent";
import { User } from "src/models/user";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "@solidjs/router";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import ToastAlert from "src/components/ToastAlert";
import ErrorBoundaryContent from "src/components/ErrorBoundaryContent";

type AuthLayoutProps = {
  children?: JSX.Element | JSX.Element[]; // Type for children
};

const AuthLayout: Component<AuthLayoutProps> = (props: any) => {
  const { appState, setAppState } = useAppContext();
  const { LOCAL_STORAGE_KEYS } = useStorageEvent();
  const navigate = useNavigate();

  onMount(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.token);

    if (token) {
      try {
        const tokenPayload: User = jwtDecode(token);
        setAppState("user", { ...tokenPayload });
      } catch (err) {
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
    // <ErrorBoundary
    //   fallback={(err, reset) => <ErrorBoundaryContent error={err} />}
    // >
      <div class="h-screen flex flex-col overflow-hidden dark:bg-gray-800">
        <HeaderBar />

        <div class="pt-20 flex flex-1 overflow-hidden">
          <SideBar />
          <div
            id="auth-main"
            class="border-l border-slate-300 container px-4 pt-4 pb-20 flex-1 overflow-auto dark:bg-gray-800 no-scrollbar"
          >
            <ToastAlert />
            {props.children}
          </div>
        </div>
      </div>
    // </ErrorBoundary>
  );
};

export default AuthLayout;
