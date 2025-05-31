import { Component, Show, createEffect, onCleanup } from "solid-js";
import InfoIcon from "src/assets/icons/info-icon";
import { useAppContext } from "src/context/sessionContext";
import CloseXIcon from "src/assets/icons/closex-icon";

// NOTE: cannot do onCleanup to remove toast for all so it has to be done
// per table page

const ToastAlert: Component = () => {
  const { appState, setAppState } = useAppContext();

  const triggerShow = (showStatus: boolean) => {
    setAppState("toastState", "isShowing", showStatus);
  };

  createEffect(() => {
    triggerShow(appState.toastState.isShowing);
  });

  onCleanup(() => {
    setAppState("toastState", "isShowing", false);
    setAppState("toastState", "isHtmlMessage", false);
  });

  return (
    <Show when={appState.toastState.isShowing}>
      <div
        id={`toast-${appState.toastState.type}`}
        class="border flex items-center w-full px-2 py-1 mb-4 rounded-lg shadow dark:bg-black"
        classList={{
          "bg-green-50 text-green-800 dark:text-green-400 border-green-300 dark:border-green-800": appState.toastState.type === "success",
          "bg-yellow-50 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800": appState.toastState.type === "warning",
          "bg-red-50 text-red-800 dark:text-red-400 border-red-300 dark:border-red-800": appState.toastState.type === "danger",
        }}
        role="alert"
      >
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
          <InfoIcon class="w-4 h-4 flex-shrink-0" />
        </div>

        <Show when={!appState.toastState.isHtmlMessage}>
          <div class="ml-3 text-sm font-normal">
            {appState.toastState.message}
          </div>
        </Show>

        <Show when={appState.toastState.isHtmlMessage}>
          <div class="ml-3 text-sm font-normal">
            <div innerHTML={appState.toastState.message}></div>
          </div>
        </Show>

        <button
          type="button"
          class="ml-auto -mx-1.5 -my-1.5 dark:bg-black hover:bg-slate-200 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8"
          classList={{
            "text-green-800 dark:text-green-400": appState.toastState.type === "success",
            "text-yellow-800 dark:text-yellow-300": appState.toastState.type === "warning",
            "text-red-800 dark:text-red-400": appState.toastState.type === "danger",
          }}
          aria-label="Close"
          onClick={() => setAppState("toastState", "isShowing", false)}
        >
          <span class="sr-only">Close</span>
          <CloseXIcon class="w-3 h-3" />
        </button>
      </div>
    </Show>
  );
};

export default ToastAlert;
