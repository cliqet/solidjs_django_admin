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
    <div class="max-w-md">
      <label
        for="default-search"
        class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Search
      </label>
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
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
            "invalid-search-input": props.onInvalid && props.isInvalid
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
            if (e.key === 'Enter') {
              if (props.onSearchClick && searchInputRef.value) {
                props.onSearchClick(searchInputRef.value);
              }
            }
          }}
          autocomplete="off"
        />
        <span
          onClick={() => {
            searchInputRef.value = '';
            if (props.onChangeValue) {
              props.onChangeValue('', props.inputProps.id);
            }
            if (props.onClearSearch) {
              props.onClearSearch('');
            }
          }} 
          class="absolute end-[84px] bottom-[17px] cursor-pointer"
        >
          <CloseXIcon width={3} height={3} />
        </span>
        <button
          type="button"
          onClick={() => {
            if (props.onSearchClick) {
              props.onSearchClick(searchInputRef.value);
            }
          }}
          class="text-white absolute end-2.5 bottom-2.5 bg-custom-primary hover:bg-custom-primary-lighter focus:ring-4 focus:outline-none focus:ring-custom-primary font-medium rounded-lg text-sm px-2 py-1"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
