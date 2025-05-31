import { useLocation, useNavigate } from "@solidjs/router";
import { jwtDecode } from "jwt-decode";
import { Component, JSX, onMount } from "solid-js";
import HeaderBar from "src/components/HeaderBar";
import ToastAlert from "src/components/ToastAlert";
import { useAppContext } from "src/context/sessionContext";
import { useAdminRoute } from "src/hooks/useAdminRoute";
import { useStorageEvent } from "src/hooks/useStorageEvent";
import { User } from "src/models/user";

type NoAuthLayoutProps = {
  children?: JSX.Element | JSX.Element[]; // Type for children
};

const NoAuthLayout: Component<NoAuthLayoutProps> = (props) => {
  const { setAppState } = useAppContext();
  const { LOCAL_STORAGE_KEYS } = useStorageEvent();
  const navigate = useNavigate();
  const location = useLocation();
  const { authRoute, dashboardRoute, nonAuthRoute } = useAdminRoute();

  onMount(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.token);

    if (token) {
      try {
        const tokenPayload: User = jwtDecode(token);
        setAppState('user', {...tokenPayload});

        navigate(dashboardRoute(authRoute.dashboardHomeView));
      } catch (err) {
        localStorage.clear();

        if (location.pathname === '/') {
          navigate(nonAuthRoute.loginView);
        }
      }
    } else {
      if (location.pathname === '/') {
        navigate(nonAuthRoute.loginView);
      }
    }
  })

  return (
    <div class="h-screen flex flex-col overflow-hidden">
      <HeaderBar />

      <div class="mt-20 flex-col h-lvh dark:bg-black overflow-auto px-4 pt-4">
        <ToastAlert />
        <div class="w-full">{props.children}</div>
      </div>
    </div>
  );
};

export default NoAuthLayout;
