import SearchIcon from "src/assets/icons/search-icon";
import { JSX, Component } from "solid-js";
import CloseXIcon from "src/assets/icons/closex-icon";

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

  return (
    <div class="flex-col w-full">
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <SearchIcon class="w-4 h-4 text-gray-500" />
        </div>
        <input
          {...props.inputProps}
          id={props.inputProps.id}
          type="text"
          ref={searchInputRef!}
          classList={{
            "valid-search-input": !props.isInvalid,
            "invalid-search-input": props.isInvalid,
          }}
          onInvalid={(e) => {
            if (props.inputProps.required && props.onInvalid) {
              const target = e.target as HTMLInputElement;
              props.onInvalid(e, props.inputProps.id, target.validationMessage);
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
          class="absolute top-3 end-24 cursor-pointer mr-2"
        >
          <CloseXIcon class="w-3 h-3" />
        </span>
        <button
          type="button"
          onClick={() => {
            if (props.onSearchClick) {
              props.onSearchClick(searchInputRef.value);
            }
          }}
          class="button absolute top-1 end-2.5 h-7 flex items-center justify-center"
        >
          <span class="text-sm">Search</span>
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
