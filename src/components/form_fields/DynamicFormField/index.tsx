import { Component, Show } from "solid-js";
import InputTypeField from "../InputTypeField";
import CheckboxField from "../CheckboxField";
import DateField from "../DateField";
import TimeField from "../TimeField";
import PasswordField from "../PasswordField";
import SelectField from "../SelectField";
import TextareaField from "../TextareaField";
import FileUploadField from "../FileUploadField";
import DateTimeField from "../DateTimeField";
import ManyToManyField from "../ManyToManyField";
import JsonField from "../JsonField";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import HTMLField from "../HTMLField";
import AutocompletField from "../AutocompleteField";
import { FIELDTYPE } from "src/constants/django-admin";
import { SelectedOptionsType, ManyToManyCheckboxDataType, ModelFieldType, ModelAdminSettingsType } from "src/models/django-admin";

type DynamicFormFieldProps = {
  field: ModelFieldType;
  isReadonly: boolean;
  isInvalid: boolean;
  onInvalid: (e: Event, id: string, validationMessage: string) => void;
  onFieldChangeValue: (value: any, fieldName: string, metadata?: any) => any;
  onFocus: (e: Event) => void;
  isEditMode?: boolean;
  modelAdminSettings: ModelAdminSettingsType;
};

const DynamicFormField: Component<DynamicFormFieldProps> = (props) => {
  const {
    formatTimeForInput, 
    getFilefieldLimits, 
    splitDateTimeString,
  } = useModelAdmin();

  const NotReadonlyCharfield = () => {
    return [FIELDTYPE.CharField].includes(props.field.type)&& !props.isReadonly;
  }

  const IsIntegerField = () => {
    return [
      FIELDTYPE.IntegerField, FIELDTYPE.PositiveIntegerField, FIELDTYPE.PositiveSmallIntegerField
    ].includes(props.field.type);
  }

  const IsFileField = () => {
    return props.field.type === FIELDTYPE.FileField || props.field.type === FIELDTYPE.ImageField;
  }

  const IsForeignKey = () => {
    return [FIELDTYPE.OneToOneField, FIELDTYPE.ForeignKey].includes(props.field.type);
  }

  const HasDropdown = () => {
    // TODO: include OneToOneField
    return props.field.choices || props.field.foreignkey_choices;
  }

  const IsSelectField = () => {
    const isInAutocomplete = props.modelAdminSettings.autocomplete_fields.includes(props.field.name);
    return (NotReadonlyCharfield() || IsForeignKey()) && HasDropdown() && !isInAutocomplete;
  }

  const IsAutocompleteField = () => {
    const isInAutocomplete = props.modelAdminSettings.autocomplete_fields.includes(props.field.name);
    return (NotReadonlyCharfield() || IsForeignKey()) && HasDropdown() && isInAutocomplete;
  }

  return (
    <>
      <Show when={props.isReadonly || props.field.type === FIELDTYPE.BigAutoField}>
        <div>
          <span class="text-sm text-slate-500 dark:text-slate-300">{props.field.initial ?? "-"}</span>
        </div>
      </Show>

      <Show 
        when={
          props.field.name !== "password" && 
          NotReadonlyCharfield() && 
          props.field.choices === null
        }
      >
        <InputTypeField
          onFocus={props.onFocus}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          inputProps={{
            type: "text",
            id: props.field.name,
            value: props.field.initial,
            disabled: !props.field.editable,
            ...(props.field.max_length !== null && {
              maxLength: props.field.max_length,
            }),
            placeholder: props.field.label,
            required: props.field.required
          }}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.EmailField && !props.isReadonly}>
        <InputTypeField
          onFocus={props.onFocus}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          inputProps={{
            type: "email",
            id: props.field.name,
            value: props.field.initial,
            disabled: !props.field.editable,
            ...(props.field.max_length !== null && {
              maxLength: props.field.max_length,
            }),
            placeholder: props.field.label,
            required: props.field.required
          }}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.BooleanField && !props.isReadonly}>
        <CheckboxField
          onChangeValue={props.onFieldChangeValue}
          checked={props.field.initial}
          inputProps={{
            id: props.field.name,
          }}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.DateField && !props.isReadonly}>
        <div class="mb-2">
          <DateField
            onFocus={props.onFocus}
            onInvalid={props.onInvalid}
            onChangeValue={props.onFieldChangeValue}
            isInvalid={props.isInvalid}
            inputProps={{
              id: `${props.field.name}`,
              required: props.field.required,
              value: props.field.initial,
            }}
          />
        </div>
      </Show>

      <Show when={props.field.type === FIELDTYPE.TimeField && !props.isReadonly}>
        <div class="mb-2">
          <TimeField
            onFocus={props.onFocus}
            onInvalid={props.onInvalid}
            onChangeValue={props.onFieldChangeValue}
            isInvalid={props.isInvalid}
            inputProps={{
              id: `${props.field.name}`,
              required: props.field.required,
              value: formatTimeForInput(props.field.initial),
            }}
          />
        </div>
      </Show>

      <Show when={props.field.type === FIELDTYPE.DateTimeField && !props.isReadonly}>
        <DateTimeField 
          onFocus={props.onFocus}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          inputProps={{
            id: `${props.field.name}`,
            required: props.field.required,
          }}
          initialValues={splitDateTimeString(props.field.initial)}
        />
      </Show>

      <Show 
        when={
          props.field.name === "password" && 
          NotReadonlyCharfield() && 
          props.field.choices === null
        }
      >
        <PasswordField
          onFocus={(e) => props.onFocus(e)}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          inputProps={{
            id: props.field.name,
            pattern: props.field.regex_pattern as string,
            required: props.field.required
          }}
          isEditMode={props.isEditMode}
        />
      </Show>

      {/* For field based on models.TextChoices */}
      <Show when={IsSelectField() && !IsForeignKey()}>
        <SelectField 
          onChangeValue={props.onFieldChangeValue}
          selectProps={{
            id: props.field.name,
            required: props.field.required
          }}
          isInvalid={props.isInvalid}
          onFocus={(e) => props.onFocus(e)}
          onInvalid={props.onInvalid}
          options={props.field.choices as SelectedOptionsType[]}
        />
      </Show>

      <Show when={IsAutocompleteField() && !IsForeignKey()}>
        <AutocompletField 
          onChangeValue={props.onFieldChangeValue}
          inputProps={{
            id: props.field.name,
            required: props.field.required
          }}
          isInvalid={props.isInvalid}
          onFocus={(e) => props.onFocus(e)}
          onInvalid={props.onInvalid}
          options={props.field.choices as SelectedOptionsType[]}
        />
      </Show>

      {/* For field based on models.ForeignKey */}
      <Show when={IsForeignKey() && IsSelectField()}>
          <SelectField 
            onChangeValue={props.onFieldChangeValue}
            selectProps={{
              id: props.field.name,
              required: props.field.required
            }}
            isInvalid={props.isInvalid}
            onFocus={(e) => props.onFocus(e)}
            onInvalid={props.onInvalid}
            options={props.field.foreignkey_choices as SelectedOptionsType[]}
          />
      </Show>

      <Show when={IsForeignKey() && IsAutocompleteField()}>
          <AutocompletField 
            onChangeValue={props.onFieldChangeValue}
            inputProps={{
              id: props.field.name,
              required: props.field.required
            }}
            isInvalid={props.isInvalid}
            onFocus={(e) => props.onFocus(e)}
            onInvalid={props.onInvalid}
            options={props.field.foreignkey_choices as SelectedOptionsType[]}
          />
      </Show>

      <Show when={IsIntegerField()}>
        <InputTypeField
          onFocus={(e) => props.onFocus(e)}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          inputProps={{
            type: "number",
            id: props.field.name,
            value: props.field.initial,
            min: props.field.min_value,
            max: props.field.max_value,
            disabled: !props.field.editable,
            placeholder: props.field.label,
            required: props.field.required
          }}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.DecimalField}>
        <InputTypeField
          onFocus={(e) => props.onFocus(e)}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          inputProps={{
            type: "text",
            id: props.field.name,
            value: props.field.initial,
            disabled: !props.field.editable,
            pattern: props.field.regex_pattern,
            placeholder: props.field.label,
            required: props.field.required
          }}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.TextField}>
        <TextareaField
          onFocus={props.onFocus}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          textareaProps={{
            id: props.field.name,
            value: props.field.initial,
            disabled: !props.field.editable,
            placeholder: props.field.label,
            required: props.field.required
          }}
        />
      </Show>

      <Show when={IsFileField()}>
          <FileUploadField 
            onFocus={props.onFocus}
            onInvalid={props.onInvalid}
            onChangeValue={props.onFieldChangeValue}
            isInvalid={props.isInvalid}
            inputProps={{
              id: props.field.name,
              disabled: !props.field.editable,
              required: props.field.required
            }}
            initialValue={props.field.initial}
            limits={getFilefieldLimits(props.field.help_text)}
          />
      </Show>

      <Show when={props.field.type === FIELDTYPE.ManyToManyField}>
        <ManyToManyField 
          onChangeValue={props.onFieldChangeValue}
          fieldName={props.field.label}
          buttonProps={{
            id: props.field.name,
          }}
          data={props.field.manytomany_choices as ManyToManyCheckboxDataType[]}
          initialValues={props.field.initial}
          isRequired={props.field.required}
          onInvalid={props.onInvalid}
          isInvalid={props.isInvalid}
          onFocus={props.onFocus}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.JSONField}>
        <JsonField 
          id={props.field.name}
          onChangeValue={props.onFieldChangeValue}
          initialValue={props.field.initial}
          onInvalid={props.onInvalid}
          isInvalid={props.isInvalid}
          isRequired={props.field.required}
          onFocus={props.onFocus}
        />
      </Show>

      <Show when={props.field.type === FIELDTYPE.HTMLField}>
        <HTMLField
          onFocus={props.onFocus}
          onInvalid={props.onInvalid}
          onChangeValue={props.onFieldChangeValue}
          isInvalid={props.isInvalid}
          textareaProps={{
            id: props.field.name,
            value: props.field.initial,
            disabled: !props.field.editable,
            required: props.field.required
          }}
        />
      </Show>
    </>
  );
};

export default DynamicFormField;
