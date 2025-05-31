import { Component, For, JSX, createSignal, onMount } from "solid-js";
import { ManyToManyCheckboxDataType } from "src/models/django-admin";

type ManyToManyInitialValuesType = string|number[];

type ManyToManyFieldProps = {
  fieldName: string;
  buttonProps: {
    id: string;
  } & JSX.IntrinsicElements["button"];
  data: ManyToManyCheckboxDataType[];
  initialValues: ManyToManyInitialValuesType[] | null;
  onChangeValue: (value: number[] | string[], fieldName: string) => any;
  isRequired: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  isInvalid: boolean;
  onFocus: (e: Event) => void;
};

const ManyToManyField: Component<ManyToManyFieldProps> = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [allData, _] = createSignal([...props.data]);
  const [displayedData, setDisplayedData] = createSignal([...props.data]);
  const [selectedData, setSelectedData] = createSignal<
    ManyToManyCheckboxDataType[]
  >([]);
  let checkboxRefs = Array(props.data.length).fill(undefined);
  let searchfieldRef: HTMLInputElement;
  let inputRef: HTMLInputElement;

  onMount(() => {
    let initialSelectedData: ManyToManyCheckboxDataType[] = [];
    
    // Checked the ones based on current db values
    if (props.initialValues && props.initialValues.length > 0) {
      allData().forEach((data, index) => {
        const found = props.initialValues?.find((item) => item === data.id);
        if (found) {
          initialSelectedData.push({ ...data, checked: true });
          checkboxRefs[index].checked = true;
        }
      });
    }
    setSelectedData(initialSelectedData);

    if (selectedData().length === 0) {
      inputRef!.value = "";
    } else {
      inputRef!.value = JSON.stringify(selectedData());
    }
  });

  const onFilterAllData = () => {
    setDisplayedData(allData());
  };

  const onFilterSelectedData = () => {
    setDisplayedData(selectedData());
  };

  const onFilterUnselectedData = () => {
    const unselectedData = allData().filter((data) => !data.checked);
    setDisplayedData(unselectedData);
  };

  const onSearchData = (searchTerm: string) => {
    const searchData = allData().filter((data) => {
      return data.label.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setDisplayedData(searchData);
  };

  const onCheckAction = (
    item: ManyToManyCheckboxDataType,
    checkStatus: boolean
  ) => {
    let selectedDataCopy = [...selectedData()];
    const index = selectedDataCopy.findIndex((data) => data.id === item.id);

    // if item is unchecked and it is in currently selected data, remove it
    if (!checkStatus) {
      if (index !== -1) {
        selectedDataCopy.splice(index, 1);
        setSelectedData(selectedDataCopy);
      }
      // otherwise, add it
    } else {
      if (index === -1) {
        item.checked = true;
        selectedDataCopy.push(item);
        setSelectedData(selectedDataCopy);
      }
    }

    const selectedIds = selectedData().map((item) => item.id);
    props.onChangeValue(selectedIds, props.buttonProps.id);

    if (selectedData().length === 0) {
      inputRef!.value = "";
    } else {
      inputRef!.value = JSON.stringify(selectedData());
    }
  };

  const onSelectAll = () => {
    searchfieldRef!.value = "";
    setDisplayedData(allData());
    const copyAllData = displayedData().map((item, i) => {
      checkboxRefs[i].checked = true;
      return { ...item, checked: true };
    });
    setSelectedData([...copyAllData]);

    const selectedIds = selectedData().map((item) => item.id);
    props.onChangeValue(selectedIds, props.buttonProps.id);

    inputRef!.value = JSON.stringify(selectedData());
  };

  const onUnselectAll = () => {
    searchfieldRef!.value = "";
    setDisplayedData(allData());
    displayedData().forEach((item, i) => {
      checkboxRefs[i].checked = false;
    });
    setSelectedData([]);

    const selectedIds = selectedData().map((item) => item.id);
    props.onChangeValue(selectedIds, props.buttonProps.id);

    inputRef!.value = "";
  };

  const onButtonClick = () => {
    inputRef!.focus();

    // Create a synthetic focus event
    const syntheticEvent = new FocusEvent("focus", {
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the synthetic event on the textarea
    inputRef!.dispatchEvent(syntheticEvent);

    setIsDropdownOpen(!isDropdownOpen());
  };

  return (
    <>
      <input
        class="hidden"
        id={props.buttonProps.id}
        ref={inputRef!}
        type="text"
        required={props.isRequired}
        onInvalid={(e) => {
          if (props.isRequired) {
            const target = e.target as HTMLInputElement;
            props.onInvalid(e, props.buttonProps.id, target.validationMessage);
          }
        }}
        onFocus={(e) => props.onFocus(e)}
      />
      <button
        {...props.buttonProps}
        id={`${props.buttonProps.id}-btn`}
        onClick={onButtonClick}
        class="inline-flex items-center p-2 text-sm font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-400 focus:ring-2 focus:outline-none focus:ring-orange-500"
        classList={{
          "border border-red-500": props.isInvalid,
          "border-none": !props.isInvalid,
        }}
        type="button"
      >
        {`${props.fieldName} `}
        <svg
          class="w-2.5 h-2.5 ms-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      <div
        id={`${props.buttonProps.id}-dropdown`}
        classList={{ hidden: !isDropdownOpen() }}
        class="z-10 bg-gray-50 rounded-lg shadow w-full"
      >
        <div class="p-3">
          <label
            for={`${props.buttonProps.id}-input-group-search`}
            class="sr-only"
          >
            Search
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                class="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              ref={searchfieldRef!}
              id={`${props.buttonProps.id}-input-group-search`}
              onInput={(e) => onSearchData(e.target.value)}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary-lighter focus:border-custom-primary-lighter block w-full ps-10 p-2.5"
              placeholder="Search"
            />
          </div>
        </div>

        <ul class="max-h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">
          <For each={displayedData()}>
            {(item, i) => (
              <li>
                <div class="flex items-center p-2 rounded hover:bg-gray-100">
                  <input
                    id={item.id}
                    ref={checkboxRefs[i()]!}
                    type="checkbox"
                    checked={item.checked}
                    value={item.id}
                    onChange={(e) => onCheckAction(item, e.target.checked)}
                    class="w-4 h-4 text-custom-primary bg-gray-100 border-gray-300 rounded focus:ring-custom-primary-lighter"
                  />
                  <label
                    for={item.id}
                    class="w-full ms-2 text-sm font-medium dark:text-gray-900 rounded"
                  >
                    {item.label}
                  </label>
                </div>
              </li>
            )}
          </For>
        </ul>

        <div class="flex">
          <button
            type="button"
            onClick={onFilterSelectedData}
            class="flex items-center p-3 text-sm font-medium text-custom-primary border-t border-gray-200 rounded-b-lg bg-gray-50 hover:underline"
          >
            Selected
          </button>
          <button
            type="button"
            onClick={onFilterUnselectedData}
            class="flex items-center p-3 text-sm font-medium text-custom-primary border-t border-gray-200 rounded-b-lg bg-gray-50 hover:underline"
          >
            Unselected
          </button>
          <button
            type="button"
            onClick={onFilterAllData}
            class="flex items-center p-3 text-sm font-medium text-custom-primary border-t border-gray-200 rounded-b-lg bg-gray-50 hover:underline"
          >
            All
          </button>
          <button
            type="button"
            onClick={onSelectAll}
            class="flex items-center p-3 text-sm font-medium text-custom-primary border-t border-gray-200 rounded-b-lg bg-gray-50 hover:underline"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={onUnselectAll}
            class="flex items-center p-3 text-sm font-medium text-custom-primary border-t border-gray-200 rounded-b-lg bg-gray-50 hover:underline"
          >
            Unselect All
          </button>
        </div>
      </div>
    </>
  );
};

export default ManyToManyField;
