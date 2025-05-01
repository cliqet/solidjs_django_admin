import tinymce, { Editor } from "tinymce";
import "tinymce/icons/default/icons";
import "tinymce/themes/silver/theme";
import "tinymce/models/dom/model";
import "tinymce/skins/ui/oxide/skin.css";
import { Component, JSX, createSignal, createEffect, onCleanup } from "solid-js";

type HTMLFieldProps = {
  textareaProps: {
    id: string;
  } & JSX.IntrinsicElements["textarea"];
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void;
};

const HTMLField: Component<HTMLFieldProps> = (props) => {
  const [editor, setEditor] = createSignal<Editor | null>(null);
  const [isEditorReady, setIsEditorReady] = createSignal(false);
  let textareaRef: HTMLTextAreaElement;

  const initTinyMCE = () => {
    tinymce.init({
      selector: `#${props.textareaProps.id}`, // Change this to your textarea selector
      license_key: "gpl",
      menubar: "file edit view insert format tools table help",
      width: "auto",
      height: "600px",
      setup: (editorInstance) => {
        setEditor(editorInstance as Editor);

        // Set initial content
        if (props.textareaProps.value) {
          editorInstance.setContent(props.textareaProps.value as string);
        }

        // Listen for the change event
        editorInstance.on("change", () => {
          const content = editorInstance.getContent();
          textareaRef!.value = content;
          props.onChangeValue(content, props.textareaProps.id);
        });

        // Listen for the input event
        editorInstance.on("input", () => {
          const content = editorInstance.getContent();
          textareaRef!.value = content;
          props.onChangeValue(content, props.textareaProps.id);
        });

        // Listen for the change event
        editorInstance.on("focus", () => {
          textareaRef!.focus();

          // Create a synthetic focus event
          const syntheticEvent = new FocusEvent("focus", {
            bubbles: true,
            cancelable: true,
          });

          // Dispatch the synthetic event on the textarea
          textareaRef!.dispatchEvent(syntheticEvent);
        });

        // Make sure editor is ready before showing it to prevent 
        // rendering textarea only
        editorInstance.on("init", () => {
          setIsEditorReady(true);
        });
      },
    });
  };

  // Initialize TinyMCE on component mount
  createEffect(() => {
    initTinyMCE();
    isEditorReady();
  });

  onCleanup(() => {
    if (editor()) {
      editor()?.remove();
    }
  })

  return (
    <>
      <div
        classList={{
          "border border-red-500 p-1": props.isInvalid,
          "border-none p-0": !props.isInvalid,
          "hidden": !isEditorReady(),
          "block": isEditorReady(),
        }}
      >
        <textarea
          {...props.textareaProps}
          id={props.textareaProps?.id}
          ref={textareaRef!}
          onInvalid={(e) => {
            if (props.textareaProps.required) {
              const target = e.target as HTMLTextAreaElement;
              props.onInvalid(
                e,
                props.textareaProps.id,
                target.validationMessage
              );
            }
          }}
          onInput={(e) => {
            props.onChangeValue(e.target.value, props.textareaProps.id);
          }}
          onFocus={(e) => props.onFocus(e)}
          autocomplete="off"
        ></textarea>
      </div>
    </>
  );
};

export default HTMLField;
