import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show } from "solid-js";
import {
  ModelFieldsObjType,
  ModelAdminSettingsType,
  initialModelAdminSettings,
} from "src/models/django-admin";
import { getModelAdminSettings, getModelFieldsEdit } from "src/services/django-admin";
import { getUserPermissions } from "src/services/users";
import {
  hasViewOnlyModelPermission,
  hasAppPermission,
  hasChangeModelPermission,
  handleFetchError,
} from "src/hooks/useModelAdmin";
import { useAppContext } from "src/context/sessionContext";
import ViewModelForm from "src/components/ViewModelForm";
import { UserPermissionsType } from "src/models/user";
import ChangeModelForm from "src/components/ChangeModelForm";
import { nonAuthRoute } from "src/hooks/useAdminRoute";

const ViewChangeModelPage = () => {
  const params = useParams();
  const { appState, setAppState } = useAppContext();
  const navigate = useNavigate();
  const [isDataReady, setIsDataReady] = createSignal(false);

  // An object which contains the field name as key and the value as an object with
  // field property types such as initial, type, etc
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType>({});

  // An object that contains the permissions allowed for the user. It has the app name,
  // where all model names as keys and has permission ids and permission actions
  const [userPermissions, setUserPermissions] =
    createSignal<UserPermissionsType | null>(null);
  const [modelAdminSettings, setModelAdminSettings] =
    createSignal<ModelAdminSettingsType>(initialModelAdminSettings);

  // setup model fields, model record, user permissions and model admin settings and fieldsInFormState
  createEffect(async () => {
    try {
      setIsDataReady(false);

      // Setup model fields and model admin settings
      const modelFieldsData = await getModelFieldsEdit(
        params.appLabel,
        params.modelName,
        params.pk
      );

      setModelFields(modelFieldsData.fields);

      const modelAdminSettingsData = await getModelAdminSettings(
        params.appLabel,
        params.modelName,
      );
      setModelAdminSettings(modelAdminSettingsData.model_admin_settings);

      // Setup permissions
      const permissionsData = await getUserPermissions(
        appState.user?.uid as string
      );
      setUserPermissions(permissionsData.permissions);

      setIsDataReady(true);
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState("toastState", handler.newToastState);
      }
    }
  });

  return (
    <Show when={isDataReady()}>
      <Show
        when={
          !hasAppPermission(
            userPermissions() as UserPermissionsType,
            params.appLabel
          )
        }
      >
        <h1 class="dark:text-white">You have no permissions for this page</h1>
      </Show>

      <Show
        when={hasViewOnlyModelPermission(
          userPermissions() as UserPermissionsType,
          params.appLabel,
          params.modelName
        )}
      >
        <ViewModelForm
          appLabel={params.appLabel}
          modelName={params.modelName}
          pk={params.pk}
          modelAdminSettings={modelAdminSettings()}
          modelFields={modelFields()}
        />
      </Show>

      <Show
        when={hasChangeModelPermission(
          userPermissions() as UserPermissionsType,
          params.appLabel,
          params.modelName
        )}
      >
        <ChangeModelForm
          appLabel={params.appLabel}
          modelName={params.modelName}
          pk={params.pk}
          modelAdminSettings={modelAdminSettings()}
          modelFields={modelFields()}
          setModelFields={setModelFields}
          canChange={hasChangeModelPermission(
            userPermissions() as UserPermissionsType,
            params.appLabel,
            params.modelName
          )}
        />
      </Show>
    </Show>
  );
};

export default ViewChangeModelPage;
