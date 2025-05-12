import JSONEditor from "jsoneditor";
import { JSONEditorOptions } from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { Component, createEffect, onMount, onCleanup } from "solid-js";

type JsonFieldProps = {
  id: string;
  isRequired: boolean;
  onChangeValue: (value: string, fieldName: string) => any;
  initialValue: any;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  isInvalid: boolean;
  onFocus: (e: Event) => void;
};

const JsonField: Component<JsonFieldProps> = (props) => {
  let container: HTMLElement;
  let editor: JSONEditor;
  let inputRef: HTMLInputElement;

  onMount(() => {
    inputRef!.value = props.initialValue ? props.initialValue : '';
  });

  createEffect(() => {
    container = document.getElementById(`${props.id}-editor`) as HTMLElement;

    const options: JSONEditorOptions = {
      mode: "tree",
      onChange: () => {
        let editorText = JSON.stringify(editor.get());
        inputRef!.value = editorText;
        props.onChangeValue(editorText, props.id);
      },
      onFocus: (e) => {
        props.onFocus(e);
      }
    };
    if (container) {
      editor = new JSONEditor(container, options);
      editor.set(props.initialValue);
    }
  });

  onCleanup(() => {
    if (editor) {
      editor.destroy();
    }
  });

  return (
    <>
      <input
        class="hidden" 
        id={props.id} 
        ref={inputRef!} 
        type="text" 
        required={props.isRequired} 
        onInvalid={(e) => {
          if (props.isRequired) {
            const target = e.target as HTMLInputElement;
            props.onInvalid(e, props.id, target.validationMessage);
          }
        }}
      />
      <div
        classList={{
          "border border-red-500 p-1": props.isInvalid,
          "border-none p-0": !props.isInvalid,
        }} 
      >
        <div id={`${props.id}-editor`} class="bg-gray-50"></div>
      </div>
    </>
  );
};

export default JsonField;
