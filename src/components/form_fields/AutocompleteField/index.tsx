import { Component, createSignal, For, JSX, onMount, Show } from "solid-js";
import SearchIcon from "src/assets/icons/search-icon";

type DropdownOptionsType = {
  selected: boolean;
  value: any;
  label: string;
};

type CurrentSelectionType = {
  value: any;
  label: string;
};

type AutocompleteFieldProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  options: DropdownOptionsType[];
  isInvalid: boolean;
  onChangeValue: (value: string, fieldName: string) => any;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onFocus: (e: Event) => void;
};

const AutocompletField: Component<AutocompleteFieldProps> = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [currentSelection, setCurrentSelection] =
    createSignal<CurrentSelectionType>({
      value: "",
      label: "",
    });
  const [displayedOptions, setDisplayedOptions] = createSignal<
    DropdownOptionsType[]
  >(props.options);
  let labelInputRef: HTMLInputElement;
  let valueInputRef: HTMLInputElement;

  onMount(() => {
    const selected = displayedOptions().find((option) => option.selected);
    if (selected) {
      setCurrentSelection({ value: selected.value, label: selected.label });
      labelInputRef.value = selected.label;
      valueInputRef.value = selected.value;
    }
  });

  const onSearch = () => {
    setIsDropdownOpen(true);
    const searchTerm = labelInputRef.value;
    if (searchTerm.length === 0) {
      setDisplayedOptions(props.options);
      return;
    }

    const searchData = displayedOptions().filter((data) => {
      return data.label.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setDisplayedOptions(searchData);
  };

  const onClickToOpenDropdown = () => {
    if (isDropdownOpen()) {
      labelInputRef.value = currentSelection().label;
    }
    setIsDropdownOpen((prev) => setIsDropdownOpen(!prev));
  };

  const onSelectOption = (value: any, label: string) => {
    setIsDropdownOpen(false);
    setCurrentSelection({ value, label });
    setDisplayedOptions(props.options);
    labelInputRef.value = label;
    props.onChangeValue(value, props.inputProps.id);
  };

  return (
    <div id="hs-combobox-basic-usage" class="relative">
      <div class="relative">
        <input
          ref={valueInputRef!}
          id={props.inputProps.id}
          type="text"
          class="hidden"
          onInvalid={(e) => {
            if (props.inputProps.required) {
              const target = e.target as HTMLInputElement;
              props.onInvalid(e, props.inputProps.id, target.validationMessage);
            }
          }}
        />
        <input
          {...props.inputProps}
          id={`${props.inputProps.id}2`}
          ref={labelInputRef!}
          class="pl-8"
          classList={{
            "p-2.5 block w-full border-red-500 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none": props.isInvalid,
            "p-2.5 block w-full border-gray-200 rounded-lg text-sm focus:border-custom-primary-lighter focus:ring-custom-primary-lighter disabled:opacity-50 disabled:pointer-events-none": !props.isInvalid,
          }}
          type="text"
          role="combobox"
          aria-expanded="false"
          onInput={onSearch}
          onFocus={(e) => props.onFocus(e)}
          onInvalid={(e) => {
            if (props.inputProps.required) {
              const target = e.target as HTMLInputElement;
              props.onInvalid(e, props.inputProps.id, target.validationMessage);
            }
          }}
        />
        <span class="absolute top-3 left-2">
          <SearchIcon />
        </span>
        <div
          class="absolute top-1/2 end-3 -translate-y-1/2"
          aria-expanded="false"
          onClick={onClickToOpenDropdown}
        >
          <svg
            class="shrink-0 size-3.5 text-gray-500 dark:text-neutral-500"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m7 15 5 5 5-5"></path>
            <path d="m7 9 5-5 5 5"></path>
          </svg>
        </div>
      </div>

      {/** Dropdown */}
      <Show when={isDropdownOpen()}>
        <div class="absolute z-50 w-full max-h-72 p-1 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
          <For each={displayedOptions()}>
            {(option, i) => (
              <div
                class="cursor-pointer py-2 px-2.5 w-full text-sm text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100"
                tabindex="0"
              >
                <div
                  id={option.value}
                  onClick={() => onSelectOption(option.value, option.label)}
                  class="flex justify-between items-center w-full"
                >
                  <span>{option.label}</span>
                  <Show when={option.value === currentSelection().value}>
                    <span>
                      <svg
                        class="shrink-0 size-3.5 text-custom-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                    </span>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default AutocompletField;
