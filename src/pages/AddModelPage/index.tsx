import AddModelForm from "src/components/AddModelForm";
import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";
import { getModelAdminSettings, getModelFields } from "src/services/django-admin";
import { ModelFieldsObjType, ModelAdminSettingsType, FieldsInFormStateType, initialModelAdminSettings } from "src/models/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { handleFetchError, hasAddModelPermission, initializeAddFormFieldState } from "src/hooks/useModelAdmin";
import { UserPermissionsType } from "src/models/user";
import { getUserPermissions } from "src/services/users";
import { nonAuthRoute } from "src/hooks/useAdminRoute";


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
      const formFields = initializeAddFormFieldState(
        modelAdminSettingsData.model_admin_settings,
        modelFieldsData.fields
      )

      setFieldsInFormState(formFields);
      setIsDataReady(true);
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState("toastState", "type", "danger");
        setAppState("toastState", "isShowing", true);
        setAppState("toastState", "message", err.message ?? handler.message);
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
