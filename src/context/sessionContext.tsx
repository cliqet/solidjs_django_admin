import { createContext, onCleanup, onMount, ParentComponent, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { isExtraSmallScreen, isLargeScreen, isMediumScreen, isSmallScreen, ScreenSizeType } from "src/hooks/useScreenWidth";
import useStorageEvent from "src/hooks/useStorageEvent";
import { User } from "src/models/user";

export type ToastType = "success" | "warning" | "danger";

export type ToastState = {
    message: string,        // message to show on Toast
    type: ToastType,        // type of toast
    isShowing: boolean,     // whether toast is shown
    persist?: boolean,      // whether toast is persisted when unmounted from another component
    isHtmlMessage?: boolean  // whether message is html string or plain string
}

export type AppStoreType = {
    user: User | null,  // the current user based on the token and contains all properties of users
    isLoading: boolean,  // loading state to be used while fetching resources
    // isForcedLoggedOut: boolean,  // state when user is forcefully logged out due to idle time
    toastState: ToastState,  // store state of Toast to be shown
    themeMode: "light" | "dark",
    isSidebarMinimized: boolean,
    screenSize: ScreenSizeType,
}

export default createStore<AppStoreType>({
    user: null,
    isLoading: false,
    // isForcedLoggedOut: false,
    toastState: {
        isShowing: false,
        message: "",
        type: "success",
        persist: false,
        isHtmlMessage: false,
    },
    themeMode: "dark",
    isSidebarMinimized: true,
    screenSize: 'lg',
});


const initialAppContext: AppStoreType = {
  user: null,
  isLoading: false,
  // isForcedLoggedOut: false,
  toastState: {
    isShowing: false,
    message: "",
    type: "success",
    persist: false,
    isHtmlMessage: false,
  },
  themeMode: "dark",
  isSidebarMinimized: true,
  screenSize: 'lg',
};

type CreateContextType = {
  appState: AppStoreType;
  setAppState: SetStoreFunction<AppStoreType>;
  setToDarkMode: () => void,
  setToLightMode: () => void,
  toggleSidebarWidth: () => void,
}

const initialAppStore = createStore<AppStoreType>(initialAppContext);

export const AppContext = createContext<CreateContextType>();

export const AppContextProvider: ParentComponent = (props) => {
  const [context, setContext] = initialAppStore;
  const { LOCAL_STORAGE_KEYS } = useStorageEvent();
  const colorTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.colorTheme);

  const setScreenSize = () => {
    if (isExtraSmallScreen()) {
      setContext('screenSize', 'xs');
    } else if (isSmallScreen()) {
      setContext('screenSize', 'sm');
    } else if (isMediumScreen()) {
      setContext('screenSize', 'md');
    } else if (isLargeScreen()) {
      setContext('screenSize', 'lg');
    } else {
      setContext('screenSize', '2xl');
    }
  }

  onMount(() => {
    setScreenSize();
    window.addEventListener('resize', setScreenSize);
  });

  onCleanup(() => {
    window.removeEventListener('resize', setScreenSize);
  });

  const setToLightMode = () => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem(LOCAL_STORAGE_KEYS.colorTheme, "light");
    setContext("themeMode", "light");
  }

  const setToDarkMode = () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem(LOCAL_STORAGE_KEYS.colorTheme, "dark");
    setContext("themeMode", "dark");
  }

  const toggleSidebarWidth = () => {
    setContext("isSidebarMinimized", !context.isSidebarMinimized);
  };

  onMount(() => {
    if (colorTheme && colorTheme === "light") {
      setToLightMode();
    }
    if (colorTheme && colorTheme === "dark") {
      setToDarkMode();
    }
  })

  return (
    <AppContext.Provider
      value={{ appState: context, setAppState: setContext, setToDarkMode, setToLightMode, toggleSidebarWidth }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext)!;

