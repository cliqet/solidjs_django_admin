import AddModelForm from "src/components/AddModelForm";
import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";
import { getModelAdminSettings, getModelFields } from "src/services/django-admin";
import { ModelFieldsObjType, ModelAdminSettingsType, FieldsInFormStateType, initialModelAdminSettings } from "src/models/django-admin";
import { useAppContext } from "src/context/sessionContext";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import { UserPermissionsType } from "src/models/user";
import { getUserPermissions } from "src/services/users";
import { useAdminRoute } from "src/hooks/useAdminRoute";


const AddModelPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { nonAuthRoute } = useAdminRoute();
  const { appState, setAppState } = useAppContext();
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType>({});
  const [userPermissions, setUserPermissions] = createSignal<UserPermissionsType | null>(null);
  const [modelAdminSettings, setModelAdminSettings] =
    createSignal<ModelAdminSettingsType>(initialModelAdminSettings);
  const [fieldsInFormState, setFieldsInFormState] = createSignal<FieldsInFormStateType | null>(null);
  const { handleFetchError, hasAddModelPermission, initializeAddFormFieldState } = useModelAdmin();

  createEffect(async () => {
    try {
      // Setup model fields, model admin settings and user permissions
      setIsDataReady(false);

      const [
        modelFieldsData, modelAdminSettingsData, permissionsData
      ] = await Promise.all([
        getModelFields(params.appLabel, params.modelName),
        getModelAdminSettings(params.appLabel, params.modelName, 0),
        getUserPermissions(appState.user?.uid as string)
      ]);

      setModelFields(modelFieldsData.fields);
      setModelAdminSettings(modelAdminSettingsData.model_admin_settings);
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
