import { create } from "domain";
import { Component, JSX, Show, createSignal, onMount } from "solid-js";
import FileUploadIcon from "src/assets/icons/file-upload-icon";

type FileUploadFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  initialValue: string;
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string, metadata: any) => any;
  onFocus: (e: Event) => void;
  limits: { fileType: string; fileSize: number | null };
};

export type FileFieldMetadataType = {
  currentFilePathValue: string;
  hasChanged: boolean;
  isValid: boolean;
  file: File | "";
};

const FileUploadField: Component<FileUploadFieldProps> = (props) => {
  const [metadataPayload, setMetadataPayload] =
    createSignal<FileFieldMetadataType>({
      currentFilePathValue: props.initialValue,
      hasChanged: false,
      isValid: false,
      file: "",
    });
    const [invalidFileMsg, setInvalidFileMsg] = createSignal("");
  let fileInputRef: HTMLInputElement;

  const processFile = (newFile: File) => {
    setInvalidFileMsg("");

    let isValidFile = true;
    const hasFilesizeLimit = props.limits.fileSize;
    const acceptedFileTypes = props.limits.fileType.split(',');
    const fileExtension = newFile.name.split('.').at(-1);

    if (acceptedFileTypes[0] !== 'Any' && !acceptedFileTypes.includes(`.${fileExtension}`)) {
      isValidFile = false;
      setInvalidFileMsg(`Invalid file type: ${newFile.name}`);
    }

    if (
      hasFilesizeLimit &&
      typeof hasFilesizeLimit === "number" &&
      !isNaN(hasFilesizeLimit) &&
      newFile.size > (props.limits.fileSize as number) * 1024 * 1024
    ) {
      isValidFile = false;
      setInvalidFileMsg(
        `File exceeds ${props.limits.fileSize} MB: ${newFile.name.slice(0,5)}...${newFile.name.slice(-5)}`
      );
    }

    setMetadataPayload({
      currentFilePathValue: isValidFile ? newFile.name : "",
      hasChanged: true,
      isValid: isValidFile,
      file: isValidFile ? newFile as File : "",
    });
    props.onChangeValue(newFile.name, props.inputProps.id, metadataPayload());

    setTimeout(() => {
      fileInputRef.classList.remove('hidden');
      fileInputRef.focus();
      fileInputRef.classList.add('hidden');
    }, 1000);
  }

  const handleChangeFile = () => {
    if (fileInputRef.files && fileInputRef.files.length > 0) {
      const newFile: File = fileInputRef.files[0];
      processFile(newFile);
    }
  };

  const handleDrop = (event: DragEvent) => {
    setInvalidFileMsg("");
    event.preventDefault(); 
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const newFile: File = event.dataTransfer.files[0];
      processFile(newFile);
    }
  };

  onMount(() => {
    setMetadataPayload({
      ...metadataPayload(),
      currentFilePathValue: props.initialValue,
    });
  });

  const onClickOpenFile = () => {
    setInvalidFileMsg("");
    fileInputRef.click();
  }

  return (
    <>
      <div class="mb-2">
        <span class="text-xs dark:text-white">
          Current file:
          <a
            href={`${__API_ROOT_DOMAIN__}${
              metadataPayload().currentFilePathValue
            }`}
            class="text-custom-primary-lighter underline cursor-pointer ml-3"
          >
            {metadataPayload().currentFilePathValue}
          </a>
          <input
            class="hidden"
            type="text"
            {...props.inputProps}
            id={props.inputProps.id}
            value={metadataPayload().currentFilePathValue}
            onInvalid={(e) => {
              const target = e.target as HTMLInputElement;
              if (props.inputProps.required) {
                props.onInvalid(
                  e,
                  props.inputProps.id,
                  target.validationMessage
                );
              }
            }}
          />
        </span>
      </div>

      <div 
        class="flex items-center justify-center w-full"
        classList={{
          "border border-red-500": props.isInvalid,
          "": !props.isInvalid
        }}
      >
        <div
          onClick={onClickOpenFile}
          onDragOver={(e) => {
            e.preventDefault(); 
            e.stopPropagation();
          }} 
          onDrop={handleDrop} 
          class="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <FileUploadIcon width={8} height={8} />
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span class="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <Show when={invalidFileMsg()}>
              <div class="w-80 mx-auto text-center">
              <p class="text-xs text-red-500">
                {invalidFileMsg()}
              </p>
              </div>
            </Show>
          </div>
          <input 
            ref={fileInputRef!} 
            type="file" 
            class="hidden" 
            onChange={handleChangeFile}
            id={`${props.inputProps.id}-file`}
            accept={props.limits.fileType}
            onInvalid={(e) => {
              const target = e.target as HTMLInputElement;
              props.onInvalid(e, props.inputProps.id, target.validationMessage);
            }}
            onFocus={(e) => {
              props.onFocus(e);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default FileUploadField;
