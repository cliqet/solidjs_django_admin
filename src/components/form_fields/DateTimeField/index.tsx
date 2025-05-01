import { Component, JSX, onMount } from "solid-js";

type DateTimeFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  divProps?: JSX.IntrinsicElements["div"];
  initialValues: {
    date: string;
    time: string;
  }
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue: (value: string, fieldName: string) => any;
  onFocus: (e: Event) => void;
};

const DateTimeField: Component<DateTimeFieldProps> = (props) => {
  let dateRef: HTMLInputElement;
  let timeRef: HTMLInputElement;

  onMount(() => {
    if (props.initialValues.date) {
      dateRef!.value = props.initialValues.date;
    }

    if (props.initialValues.time) {
      timeRef!.value = props.initialValues.time;
    }
  })

  const datetimeOnChange = (elementId: string) => {
    const dateValue = dateRef!.value;
    const timeValue = timeRef!.value;

    // Do not return anything unless they both have values
    if (!dateValue || !timeValue) {
      return;
    }

    // Split the time value to get hours, minutes, and seconds
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    // Create a new Date object using the input date and time
    const dateParts = dateValue.split('-').map(Number); 
    const dateTime = new Date(Date.UTC(dateParts[0] as number, dateParts[1] - 1 as number, dateParts[2] as number, hours, minutes));

    // Get the ISO string (in UTC)
    // Value will not be affected by timezone
    const dateTimeString = dateTime.toISOString();

    props.onChangeValue(dateTimeString, props.inputProps.id);
  }

  return (
    <div>
      <div class="mb-2">
        <input
          {...props.inputProps}
          id={props.inputProps.id}
          ref={dateRef!}
          type="date"
          placeholder="mm/dd/yyyy"
          onChange={() => datetimeOnChange(props.inputProps.id)}
          classList={{
            "border border-gray-300 text-sm rounded-lg focus:ring-custom-primary-lighter focus:border-custom-primary-lighter block w-full p-2.5":
              !props.isInvalid,
            "border border-red-500 text-sm rounded-lg block w-full p-2.5":
              props.isInvalid,
          }}
          onInvalid={(e) => {
            if (props.inputProps.required) {
              const target = e.target as HTMLInputElement;
              props.onInvalid(e, props.inputProps.id, target.validationMessage);
            }
          }}
          onFocus={(e) => props.onFocus(e)}
        />
      </div>

      <div class="flex">
        <input
          {...props.inputProps}
          id={`${props.inputProps.id}-time`}
          ref={timeRef!}
          type="time"
          classList={{
            "invalid-input": props.isInvalid,
            "valid-input": !props.isInvalid,
          }}
          onChange={() => datetimeOnChange(`${props.inputProps.id}-time`)}
          onInvalid={(e) => {
            if (props.inputProps.required) {
              const target = e.target as HTMLInputElement;
              props.onInvalid(e, props.inputProps.id, target.validationMessage);
            }
          }}
          onFocus={(e) => props.onFocus(e)}
        />
        <span class="inline-flex items-center px-3 text-sm text-gray-900 bg-custom-primary-lighter border rounded-s-0 border-s-0 border-gray-300 rounded-e-md dark:text-gray-400 dark:border-gray-600">
          <svg
            class="w-4 h-4 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default DateTimeField;
