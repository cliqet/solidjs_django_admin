import SearchIcon from "src/assets/icons/search-icon";
import { JSX, Component } from "solid-js";
import CloseXIcon from "src/assets/icons/closex-icon";
import { useAppContext } from "src/context/sessionContext";

type SearchInputProps = {
  inputProps: {
    id: string;
  } & JSX.IntrinsicElements["input"];
  onSearchClick?: (searchTerm: string) => any;
  onClearSearch?: (searchTerm: string) => any;
  isInvalid?: boolean;
  onInvalid?: (e: Event, id: string, validationMessage: string) => void;
  onChangeValue?: (value: string, fieldName: string) => any;
  onFocus?: (e: Event) => void;
};

const SearchInput: Component<SearchInputProps> = (props) => {
  let searchInputRef!: HTMLInputElement;
  const { appState } = useAppContext();

  return (
    <div class="flex-col">
      <div>
        <label
          for="default-search"
          class="text-sm font-medium text-gray-900 dark:text-white"
        >
          Search
        </label>
      </div>
      <div class="flex flex-col sm:flex-row">
        <div class="relative mt-2 w-full sm:w-1/2">
          <div class="absolute top-0 inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            {...props.inputProps}
            id={props.inputProps.id}
            type="text"
            ref={searchInputRef!}
            classList={{
              "search-input": !props.onInvalid,
              "valid-search-input": props.onInvalid && !props.isInvalid,
              "invalid-search-input": props.onInvalid && props.isInvalid,
            }}
            onInvalid={(e) => {
              if (props.inputProps.required && props.onInvalid) {
                const target = e.target as HTMLInputElement;
                props.onInvalid(
                  e,
                  props.inputProps.id,
                  target.validationMessage
                );
              }
            }}
            onInput={(e) => {
              if (props.onChangeValue) {
                props.onChangeValue(e.target.value, props.inputProps.id);
              }
            }}
            onFocus={(e) => {
              if (props.onFocus) {
                props.onFocus(e);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                if (props.onSearchClick && searchInputRef.value) {
                  props.onSearchClick(searchInputRef.value);
                }
              }
            }}
            autocomplete="off"
          />
          <span
            onClick={() => {
              searchInputRef.value = "";
              if (props.onChangeValue) {
                props.onChangeValue("", props.inputProps.id);
              }
              if (props.onClearSearch) {
                props.onClearSearch("");
              }
            }}
            class="absolute top-4 right-3 cursor-pointer"
            classList={{
              "hidden sm:block": !appState.isSidebarMinimized 
            }}
          >
            <CloseXIcon width={3} height={3} />
          </span>
        </div>

        <div class="mt-3 sm:mt-2 sm:ml-2">
          <button
            type="button"
            onClick={() => {
              if (props.onSearchClick) {
                props.onSearchClick(searchInputRef.value);
              }
            }}
            class="h-10 text-white bg-custom-primary hover:bg-custom-primary-lighter focus:ring-4 focus:outline-none focus:ring-custom-primary font-medium rounded-lg text-sm px-2 py-1"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
