import { Component, Show, For } from "solid-js";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import { A } from "@solidjs/router";
import { FIELDTYPE } from "src/constants/django-admin";
import { ModelFieldType } from "src/models/django-admin";

type DynamicViewOnlyFieldProps = {
  modelRecord: any;
  modelField: ModelFieldType;
  fieldName: string;
  fieldType: string;
};

const DynamicViewOnlyField: Component<DynamicViewOnlyFieldProps> = (props) => {
  const { formatDateString } = useModelAdmin();

  const isDateTime = () => {
    return props.fieldType === FIELDTYPE.DateTimeField;
  }

  const isBoolean = () => {
    return props.fieldType === FIELDTYPE.BooleanField;
  }

  const isForeignKey = () => {
    return [FIELDTYPE.ForeignKey, FIELDTYPE.OneToOneField].includes(props.modelField.type);
  }

  const isFileUrl = () => {
    return [FIELDTYPE.FileField, FIELDTYPE.ImageField].includes(props.modelField.type);
  }

  const getForeignkeyString = (pk: string | number) => {
    const instance = props.modelField.foreignkey_choices?.find(item => {
      return item.value === pk;
    });
    return instance?.label;
  }

  const isRawData = () => {
    return (
        (typeof props.modelRecord[props.fieldName] === "string" || 
        typeof props.modelRecord[props.fieldName] === "number") &&
        !isForeignKey() &&
        !isFileUrl()
    );
  }

  const isJson = () => {
    return (
        typeof props.modelRecord[props.fieldName] === 'object' &&
        props.modelRecord[props.fieldName] !== null &&
        !Array.isArray(props.modelRecord[props.fieldName]) &&
        props.modelRecord[props.fieldName].constructor === Object
    );
  }

  const isArray = () => {
    return Array.isArray(props.modelRecord[props.fieldName]);
  }

  return (
    <>
      <Show when={isDateTime()}>
        <span class="dark:text-white">{`${formatDateString(props.modelRecord[props.fieldName])}`}</span>
      </Show>

      <Show when={isRawData() && !isDateTime()}>
        <span class="dark:text-white">{`${props.modelRecord[props.fieldName]}`}</span>
      </Show>

      <Show when={isBoolean()}>
        <span class="dark:text-white">{`${String(props.modelRecord[props.fieldName])}`}</span>
      </Show>

      <Show when={isFileUrl()}>
        <span class="dark:text-white">
          <A 
            href={`${__API_ROOT_DOMAIN__}${props.modelRecord[props.fieldName]}`} 
            target="_blank"
          >
            <span class="underline text-custom-primary-lighter">
              {props.modelRecord[props.fieldName]}
            </span>
          </A>
        </span>
      </Show>

      <Show when={isForeignKey()}>
        <span class="dark:text-white">{`${getForeignkeyString(props.modelRecord[props.fieldName])}`}</span>
      </Show>

      <Show when={isArray()}>
        <ul>
          <For each={props.modelRecord[props.fieldName]}>
            {(item, k) => (
              <li>
                <span class="dark:text-white">- {item.string_value}</span>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={isJson()}>
        <span class="dark:text-white">
          {`${JSON.stringify(
            props.modelRecord[props.fieldName]
          )}`}
        </span>
      </Show>
    </>
  );
};

export default DynamicViewOnlyField;
