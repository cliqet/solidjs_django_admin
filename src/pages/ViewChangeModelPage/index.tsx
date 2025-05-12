import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show, For } from "solid-js";
import {
  ModelFieldsObjType,
  ModelAdminSettingsType,
  initialModelAdminSettings,
} from "src/models/django-admin";
import { getModelAdminSettings, getModelFieldsEdit } from "src/services/django-admin";
import { getUserPermissions } from "src/services/users";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import { useAppContext } from "src/context/sessionContext";
import ViewModelForm from "src/components/ViewModelForm";
import { UserPermissionsType } from "src/models/user";
import ChangeModelForm from "src/components/ChangeModelForm";
import { useAdminRoute } from "src/hooks/useAdminRoute";
import InlineTable from "src/components/InlineTable";
import DynamicExtraInline from "src/components/extra_inlines/DynamicExtraInline";

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

  const {
    hasViewOnlyModelPermission,
    hasAppPermission,
    hasChangeModelPermission,
    handleFetchError,
    hasDeleteModelPermission,
  } = useModelAdmin();
  const { nonAuthRoute } = useAdminRoute();

  // setup model fields, model record, user permissions and model admin settings and fieldsInFormState
  createEffect(async () => {
    try {
      setIsDataReady(false);

      const [
        modelFieldsData,
        modelAdminSettingsData,
        permissionsData
      ] = await Promise.all([
        getModelFieldsEdit(
          params.appLabel,
          params.modelName,
          params.pk
        ),
        getModelAdminSettings(
          params.appLabel,
          params.modelName,
          params.pk
        ),
        getUserPermissions(
          appState.user?.uid as string
        )
      ]);

      // Setup model fields and model admin settings
      setModelFields(modelFieldsData.fields);
      setModelAdminSettings(modelAdminSettingsData.model_admin_settings);
      setUserPermissions(permissionsData.permissions);

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
          canDelete={hasDeleteModelPermission(
            userPermissions() as UserPermissionsType,
            params.appLabel,
            params.modelName
          )}
        />
      </Show>

      {/** Custom Inlines */}
      <For each={modelAdminSettings().custom_inlines}>
        {(inline, _) => (
          <div class="flex-col p-2 rounded-md my-5 bg-green-100 dark:bg-gray-700">
            <InlineTable
              parentAppLabel={params.appLabel}
              parentModelName={params.modelName}
              parentPk={params.pk}
              inline={inline}
              userPermissions={userPermissions() as UserPermissionsType}
            />
          </div>
        )}
      </For>

      <For each={modelAdminSettings().extra_inlines}>
        {(inline, i) => (
          <div class="flex-col p-2 rounded-md mb-4 bg-green-100 dark:bg-gray-700">
            <DynamicExtraInline componentName={inline} />
          </div>
        )}
      </For>
    </Show>
  );
};

export default ViewChangeModelPage;
