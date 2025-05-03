import { For } from "solid-js";
import InputTypeField from "src/components/form_fields/InputTypeField";
import Label from "src/components/form_fields/Label";
import FieldErrorMessage from "src/components/form_fields/FieldErrorMessage";
import SelectField from "src/components/form_fields/SelectField";
import DateField from "src/components/form_fields/DateField";
import TextareaField from "src/components/form_fields/TextareaField";
import RadioField from "src/components/form_fields/RadioField";
import FileUploadField from "src/components/form_fields/FileUploadField";
import TimeField from "src/components/form_fields/TimeField";
import ManyToManyField from "src/components/form_fields/ManyToManyField";
import AutocompletField from "src/components/form_fields/AutocompleteField";

const Demo = () => {
  return (
    <>
      <div class="bg-gray-700 p-5 mb-2">
        <Label for="autocomple" text="Autocomplete" />
        <AutocompletField 
          inputProps={{
            id: 'autocomplete',
            required: true
          }}
          options={[
              {value: "male", label: "Male", selected: true},
              {value: "female", label: "Female", selected: false},
          ]}
          onChangeValue={() => {}}
          isInvalid={true}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <Label for="firstname" text="First Name" />
        <InputTypeField
          inputProps={{
            type: "text",
            id: "firstname",
            value: "",
            placeholder: "First Name",
            required: true,
          }}
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
        <FieldErrorMessage message="This is an error message" />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <Label for="firstname" text="Number" />
        <InputTypeField
          inputProps={{
            type: "number",
            id: "number",
            value: "1",
            required: true,
          }}
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <ManyToManyField
          fieldName="Pricelists"
          buttonProps={{
            id: "pricelist"
          }}
          data={[
            {id: "1", label: "Public", checked: true},
            {id: "12", label: "National", checked: false},
            {id: "14", label: "Commercial", checked: false},
          ]}
          initialValues={[]}
          isRequired={false}
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
          <SelectField
            selectProps={{
              id: 'select'
            }}
            options={[
                {value: "male", label: "Male", selected: true},
                {value: "female", label: "Female", selected: false},
            ]}
            onChangeValue={() => {}}
            isInvalid={false}
            onFocus={() => {}}
            onInvalid={() => {}}
          />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <DateField 
          inputProps={{ id: 'date'}}
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <TextareaField 
          textareaProps={{
            id: "message",
            rows: 4,
            placeholder: "Enter message here..."
          }}
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <For each={[
          {name: 'male', value: 'Male'},
          {name: 'female', value: 'Female'},
        ]}>
          {(choice, i) => (
            <RadioField 
              label={{
                for: choice.name,
                text: choice.value
              }}
              inputProps={{
                name: "gender"
              }}
            />
          )}
        </For>
      </div>

      <div class="bg-gray-700 p-5 mb-2">
        <FileUploadField 
          inputProps={{ id: 'fileupload'}}
          initialValue=""
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
          limits={{ fileSize: 2, fileType: '.jpg, .png' }}
        />
      </div>

      {/* <div class="bg-slate-300 dark:bg-gray-700 p-5 mb-2">
        <ToggleSwitchField textLabel="Is Active" checked={true} />
      </div> */}

      <div class="bg-gray-700 p-5 mb-2">
        <TimeField 
          inputProps={{ id: 'time'}}
          isInvalid={false}
          onChangeValue={() => {}}
          onFocus={() => {}}
          onInvalid={() => {}}
        />
      </div>
    </>
  );
};

export default Demo;
