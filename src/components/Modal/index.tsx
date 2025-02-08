import { Component, JSX, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import CloseModalIcon from "./close-modal-icon";

export type ModalEventType = "close" | "confirm" | "cancel" | "clickedOutside";

const Modal: Component<{
  modalEvent: (modalEvent: ModalEventType) => any;
  modalBody: JSX.Element | Component;
  confirmBtnTxt?: string;
  cancelBtnTxt?: string;
}> = (props) => {
  let outerModalRef: HTMLDivElement;
  let innerModalRef: HTMLDivElement;
  let closeBtnRef: HTMLButtonElement;

  const handleClickOutside = (event: any) => {
    if (
      !innerModalRef.contains(event.target) &&
      event.target === outerModalRef
    ) {
      props.modalEvent("clickedOutside");
    }
  };

  const disableTab = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      const activeElement = document.activeElement;
      // Check if the currently focused element is inside the modal
      if (!innerModalRef.contains(activeElement)) {
        event.preventDefault(); // Prevent tabbing out of the modal
      }
    }
  };

  onMount(() => {
    outerModalRef.addEventListener("click", handleClickOutside);
    innerModalRef.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", disableTab);
    closeBtnRef.focus();
  });

  onCleanup(() => {
    outerModalRef.removeEventListener("click", handleClickOutside);
    innerModalRef.removeEventListener("click", handleClickOutside);
    window.removeEventListener("keydown", disableTab);
  });

  return (
    <Portal>
      <div
        ref={outerModalRef!}
        id="popup-modal"
        tabindex="-1"
        class="bg-opacity-50 bg-gray-200 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div
            ref={innerModalRef!}
            class="relative rounded-lg shadow bg-slate-50 dark:bg-gray-700"
          >
            <button
              ref={closeBtnRef!}
              type="button"
              class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="popup-modal"
            >
              <CloseModalIcon
                onClose={() => {
                  props.modalEvent("close");
                }}
              />
              <span class="sr-only">Close modal</span>
            </button>
            <div class="p-4 md:p-5 text-center">
              <Show when={props.modalBody}>{props.modalBody}</Show>

              <button
                data-modal-hide="popup-modal"
                type="button"
                onClick={() => {
                  props.modalEvent("confirm");
                }}
                class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2"
              >
                {props.confirmBtnTxt || "Yes, I'm sure"}
              </button>
              <button
                data-modal-hide="popup-modal"
                type="button"
                onClick={() => {
                  props.modalEvent("cancel");
                }}
                class="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600"
              >
                {props.cancelBtnTxt || "No, cancel"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
