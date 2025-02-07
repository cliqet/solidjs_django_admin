import { Component, JSX, createSignal, onMount } from "solid-js";

type FileUploadFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  initialValue: string;
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string, metadata: any) => any;
  onFocus: (e: Event) => void;
  limits: { fileType: string, fileSize: number | null }
};

export type FileFieldMetadataType = {
  currentFilePathValue: string;
  hasChanged: boolean;
  isValid: boolean;
  file: File | "";
}

const FileUploadField: Component<FileUploadFieldProps> = (props) => {
  const [metadataPayload, setMetadataPayload] = createSignal<FileFieldMetadataType>({
    currentFilePathValue: props.initialValue,
    hasChanged: false,
    isValid: false,
    file: ""
  });
  let fileInputRef: HTMLInputElement;

  const handleChangeFile = () => {
    if (fileInputRef.files && fileInputRef.files.length > 0) {
      let isValidFile = true;
      const newFile: File = fileInputRef.files[0];
      const hasFilesizeLimit = props.limits.fileSize;

      if (
        hasFilesizeLimit && 
        typeof hasFilesizeLimit === 'number' &&
        !isNaN(hasFilesizeLimit) &&
        newFile.size > (props.limits.fileSize as number * 1024 * 1024)
      ) {
        isValidFile = false;
        fileInputRef.setCustomValidity(`File exceeds ${props.limits.fileSize} MB`);
        fileInputRef.reportValidity();
      } else {
        isValidFile = metadataPayload().currentFilePathValue ? true : false;
      }

      setMetadataPayload({ 
        currentFilePathValue: newFile.name, 
        hasChanged: true, 
        isValid: isValidFile,
        file: newFile as File
      });
      props.onChangeValue(newFile.name, props.inputProps.id, metadataPayload());
    }
  };

  onMount(() => {
    setMetadataPayload({
      ...metadataPayload(), 
      currentFilePathValue: props.initialValue,
    });
  })

  return (
    <>
      <div class="mb-2">
        <span class="text-xs dark:text-white">
          Current file: 
          <a 
            href={`${__API_ROOT_DOMAIN__}${metadataPayload().currentFilePathValue}`}
            class="text-custom-primary-lighter underline cursor-pointer"
          >{metadataPayload().currentFilePathValue}</a>
          <input 
            class="hidden" 
            type="text" 
            {...props.inputProps} 
            id={props.inputProps.id}
            value={metadataPayload().currentFilePathValue}
            onInvalid={(e) => {
              const target = e.target as HTMLInputElement;
              if (props.inputProps.required) {
                props.onInvalid(e, props.inputProps.id, target.validationMessage);
              }
            }} 
          />
        </span>
      </div>
      <div>
        <input
          id={`${props.inputProps.id}-file`}
          disabled={props.inputProps.disabled}
          ref={fileInputRef!}
          type="file"
          accept={props.limits.fileType}
          classList={{
            "block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none":
              !props.isInvalid,
            "block w-full text-sm border border-red-500 rounded-lg cursor-pointer bg-gray-50":
              props.isInvalid,
          }}
          onInvalid={(e) => {
            const target = e.target as HTMLInputElement;
            props.onInvalid(e, props.inputProps.id, target.validationMessage);
          }}
          onChange={handleChangeFile}
          onFocus={(e) => props.onFocus(e)}
        />
      </div>
    </>
  );
};

export default FileUploadField;
