import AddModelForm from "src/components/AddModelForm";
import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";
import { getModelAdminSettings, getModelFields } from "src/services/django-admin";
import { ModelFieldsObjType, ModelAdminSettingsType, FieldsInFormStateType, FieldsetType, initialModelAdminSettings } from "src/models/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { handleFetchError, hasAddModelPermission } from "src/hooks/useModelAdmin";
import { UserPermissionsType } from "src/models/user";
import { getUserPermissions } from "src/services/users";
import { SelectedOptionsType } from "src/components/form_fields/SelectField";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import { FIELDTYPE } from "src/constants/django-admin";


const AddModelPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { appState, setAppState } = useAppContext();
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType>({});
  const [userPermissions, setUserPermissions] = createSignal<UserPermissionsType | null>(null);
  const [modelAdminSettings, setModelAdminSettings] =
    createSignal<ModelAdminSettingsType>(initialModelAdminSettings);
  const [fieldsInFormState, setFieldsInFormState] = createSignal<FieldsInFormStateType | null>(null);

  createEffect(async () => {
    try {
      // Setup model fields and model admin settings
      setIsDataReady(false);

      const modelFieldsData = await getModelFields(params.appLabel, params.modelName);
      setModelFields(modelFieldsData.fields);

      const modelAdminSettingsData = await getModelAdminSettings(params.appLabel, params.modelName);
      setModelAdminSettings(modelAdminSettingsData.model_admin_settings);

      // Setup permissions
      const permissionsData = await getUserPermissions(appState.user?.uid as string);
      setUserPermissions(permissionsData.permissions);

      // get all the fields and have each in formFieldState
      let formFields: FieldsInFormStateType = {};
      modelAdminSettings().fieldsets.forEach((fieldset: FieldsetType) => {
        fieldset.fields.forEach((field) => {
          // Handle datetime fields by adding the id with suffix time for its time field
          if (modelFields()[field].type === FIELDTYPE.DateTimeField) {
            formFields[`${field}-time`] = {
              fieldName: field,
              value: modelFields()[field].initial,
              isInvalid: false,
              errorMsg: '',
            }; 
          }

          // Add the actual field
          formFields[field] = {
            fieldName: field,
            value: modelFields()[field].initial,
            isInvalid: false,
            errorMsg: "",
          };

          // Handle the password2 field
          if (field === 'password') {
            formFields['password2'] = {
              fieldName: field,
              value: '',
              isInvalid: false,
              errorMsg: '',
            };
          }

          // Handle many to many field value as list of ids selected
          if (modelFields()[field].type === FIELDTYPE.ManyToManyField) {
            formFields[field].value = [];
          }

          // Handle file and image fields which uses metadata
          if ([FIELDTYPE.FileField, FIELDTYPE.ImageField].includes(modelFields()[field].type)) {
            formFields[field].metadata = {
              currentFilePathValue: '',
              hasChanged: false,
              isValid: false,  
              file: ""
            }
          }

          // Handle ForeignKey field value and set first choice
          if (modelFields()[field].type === FIELDTYPE.ForeignKey) {
            const choices = modelFields()[field].foreignkey_choices as SelectedOptionsType[];
            if (choices.length > 0) {
              formFields[field].value = choices[0].value;
            }
          }
        });
      });

      setFieldsInFormState(formFields);
      setIsDataReady(true);
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState('toastState', handler.newToastState);
      }
    }
  });

  return (
    <>
    <Show when={isDataReady()}>
      <Show when={!hasAddModelPermission(userPermissions() as UserPermissionsType, params.appLabel, params.modelName)}>
        <h2 class="dark:text-white text-lg">You have no permissions for this page</h2>
      </Show>

      <Show when={hasAddModelPermission(userPermissions() as UserPermissionsType, params.appLabel, params.modelName)}>
        <AddModelForm 
          appLabel={params.appLabel} 
          modelName={params.modelName}
          fieldsInFormState={fieldsInFormState()}
          setFieldsInFormState={setFieldsInFormState}
          modelAdminSettings={modelAdminSettings()}
          modelFields={modelFields()}
          canAdd={hasAddModelPermission(userPermissions() as UserPermissionsType, params.appLabel, params.modelName)} 
        />
      </Show>
    </Show>
    </>
  );
};

export default AddModelPage;
