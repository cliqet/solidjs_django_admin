import { Component, For, Setter, Show } from "solid-js";
import Label from "../form_fields/Label";
import { FieldsInFormStateType, ModelAdminSettingsType, ModelFieldsObjType } from "src/models/django-admin";
import { FIELDTYPE } from "src/constants/django-admin";
import PlusIcon from "src/assets/icons/plus-icon";
import DynamicFormField from "../form_fields/DynamicFormField";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import { useUI } from "src/hooks/useUI";
import FieldErrorMessage from "../form_fields/FieldErrorMessage";

type FieldsetPropsType = {
  field: string | string[];
  modelFields: ModelFieldsObjType;
  fieldsInFormState: FieldsInFormStateType | null;
  setFieldsInFormState: Setter<FieldsInFormStateType | null>;
  modelAdminSettings: ModelAdminSettingsType;
}

const Fieldset: Component<FieldsetPropsType> = (props) => {
  const {
      buildFieldStateOnError,
      buildModelFormData,
      isReadOnlyField,
      handleInvalidFields,
      helpTextPrefix,
      handleOnFocus,
      handleFieldChangeValue,
    } = useModelAdmin();
    const { scrollToTopForm } = useUI();

  return (
    <>
      <Show when={typeof props.field === "string"}>
        <div class="p-1 my-2">
          <div class="flex">
            <Label
              for={props.field as string}
              text={props.modelFields[props.field as string].label}
            />
            <Show
              when={[FIELDTYPE.ForeignKey, FIELDTYPE.OneToOneField].includes(
                props.modelFields[props.field as string].type
              )}
            >
              <span class="ml-3 cursor-pointer">
                <a
                  href={`/dashboard/${
                    props.modelFields[props.field as string].foreignkey_app
                  }/${props.modelFields[
                    props.field as string
                  ].foreignkey_model?.toLowerCase()}/add`}
                  target="_blank"
                >
                  <PlusIcon class="w-5 h-5 text-orange-500" />
                </a>
              </span>
            </Show>
          </div>
          <DynamicFormField
            onFocus={() =>
              handleOnFocus(
                props.field as string,
                props.fieldsInFormState as FieldsInFormStateType,
                props.setFieldsInFormState as Setter<FieldsInFormStateType>
              )
            }
            // onFocus={() => handleOnFocus(field)}
            onInvalid={(e: Event, id: string, validationMessage: string) => {
              handleInvalidFields(
                e,
                id,
                validationMessage,
                props.fieldsInFormState as FieldsInFormStateType,
                props.setFieldsInFormState as Setter<FieldsInFormStateType>
              );
              scrollToTopForm("add-model-form");
            }}
            onFieldChangeValue={(value, fieldName, metadata) => {
              handleFieldChangeValue(
                value,
                fieldName,
                props.fieldsInFormState as FieldsInFormStateType,
                props.setFieldsInFormState as Setter<FieldsInFormStateType>,
                metadata
              );
            }}
            isInvalid={
              props.fieldsInFormState?.[props.field as string].isInvalid as boolean
            }
            field={props.modelFields[props.field as string]}
            isReadonly={isReadOnlyField(
              props.field as string,
              props.modelAdminSettings.readonly_fields
            )}
            modelAdminSettings={props.modelAdminSettings}
          />

          <Show when={props.modelFields[props.field as string].help_text}>
            <div class="px-1 py-1 text-xs text-slate-500 dark:text-slate-300 leading-tight">
              <span
                innerHTML={`${helpTextPrefix(
                  props.modelFields[props.field as string].required
                )}${props.modelFields[props.field as string].help_text}`}
              ></span>
            </div>
          </Show>

          <Show
            when={
              !props.modelAdminSettings.readonly_fields.includes(
                props.field as string
              )
            }
          >
            <div class="px-1">
              <FieldErrorMessage
                message={
                  props.fieldsInFormState?.[props.field as string].errorMsg as string
                }
              />
            </div>
          </Show>
        </div>
        <hr class="border-t-1 border-slate-400 mb-3" />
      </Show>

      <Show when={Array.isArray(props.field)}>
        <div class="flex flex-col sm:flex-row sm:gap-4">
          <For each={props.field as string[]}>
            {(nestedField, k) => (
              <div class="p-1 my-2">
                <div class="flex">
                  <Label
                    for={nestedField}
                    text={props.modelFields[nestedField].label}
                  />
                  <Show
                    when={[
                      FIELDTYPE.ForeignKey,
                      FIELDTYPE.OneToOneField,
                    ].includes(props.modelFields[nestedField].type)}
                  >
                    <span class="ml-3 cursor-pointer">
                      <a
                        href={`/dashboard/${
                          props.modelFields[nestedField].foreignkey_app
                        }/${props.modelFields[
                          nestedField
                        ].foreignkey_model?.toLowerCase()}/add`}
                        target="_blank"
                      >
                        <PlusIcon class="w-5 h-5 text-orange-500" />
                      </a>
                    </span>
                  </Show>
                </div>
                <DynamicFormField
                  onFocus={() =>
                    handleOnFocus(
                      nestedField,
                      props.fieldsInFormState as FieldsInFormStateType,
                      props.setFieldsInFormState as Setter<FieldsInFormStateType>
                    )
                  }
                  // onFocus={() => handleOnFocus(field)}
                  onInvalid={(
                    e: Event,
                    id: string,
                    validationMessage: string
                  ) => {
                    handleInvalidFields(
                      e,
                      id,
                      validationMessage,
                      props.fieldsInFormState as FieldsInFormStateType,
                      props.setFieldsInFormState as Setter<FieldsInFormStateType>
                    );
                    scrollToTopForm("add-model-form");
                  }}
                  onFieldChangeValue={(value, fieldName, metadata) => {
                    handleFieldChangeValue(
                      value,
                      fieldName,
                      props.fieldsInFormState as FieldsInFormStateType,
                      props.setFieldsInFormState as Setter<FieldsInFormStateType>,
                      metadata
                    );
                  }}
                  isInvalid={
                    props.fieldsInFormState?.[nestedField].isInvalid as boolean
                  }
                  field={props.modelFields[nestedField]}
                  isReadonly={isReadOnlyField(
                    nestedField,
                    props.modelAdminSettings.readonly_fields
                  )}
                  modelAdminSettings={props.modelAdminSettings}
                />

                <Show when={props.modelFields[nestedField].help_text}>
                  <div class="px-1 py-1 text-xs text-slate-500 dark:text-slate-300 leading-tight">
                    <span
                      innerHTML={`${helpTextPrefix(
                        props.modelFields[nestedField].required
                      )}${props.modelFields[nestedField].help_text}`}
                    ></span>
                  </div>
                </Show>

                <Show
                  when={
                    !props.modelAdminSettings.readonly_fields.includes(
                      nestedField
                    )
                  }
                >
                  <div class="px-1">
                    <FieldErrorMessage
                      message={
                        props.fieldsInFormState?.[nestedField]
                          .errorMsg as string
                      }
                    />
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
        <hr class="border-t-1 border-slate-400 mb-3" />
      </Show>
    </>
  );
};

export default Fieldset;
