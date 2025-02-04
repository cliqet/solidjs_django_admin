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
        class="border flex items-center w-full p-2 mb-4 rounded-lg shadow bg-gray-800"
        classList={{
          "text-green-500": appState.toastState.type === "success",
          "text-yellow-500": appState.toastState.type === "warning",
          "text-red-500": appState.toastState.type === "danger",
        }}
        role="alert"
      >
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
          <InfoIcon width={4} height={4} />
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
          class="ml-auto -mx-1.5 -my-1.5 bg-gray-800 hover:bg-gray-600 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8"
          classList={{
            "text-green-500": appState.toastState.type === "success",
            "text-yellow-500 ": appState.toastState.type === "warning",
            "text-red-500": appState.toastState.type === "danger",
          }}
          aria-label="Close"
          onClick={() => setAppState("toastState", "isShowing", false)}
        >
          <span class="sr-only">Close</span>
          <CloseXIcon width={3} height={3} />
        </button>
      </div>
    </Show>
  );
};

export default ToastAlert;
