import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, createEffect, Show, onMount } from "solid-js";
import {
  hasViewOnlyModelPermission,
  hasAppPermission,
  handleFetchError,
} from "src/hooks/useModelAdmin";
import { useAppContext } from "src/context/sessionContext";
import ViewModelForm from "src/components/ViewModelForm";
import { UserPermissionsType } from "src/models/user";
import ChangeModelForm from "src/components/ChangeModelForm";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import { getUserPermissions } from "src/services/users";
import { getQueuedJob } from "src/services/django-admin";

type JobType = {
  id: string;
  created_at: string;
  started_at: string;
  enqueued_at: string;
  ended_at: string;
  timeout: number;
  ttl: number | null;
  meta: any;
  callable: string;
  args: string[];
  kwargs: { [key: string]: any };
  execution_info: string;
};

const ViewChangeQueuedJobPage = () => {
  const params = useParams();
  const { appState, setAppState } = useAppContext();
  const navigate = useNavigate();
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [job, setJob] = createSignal<JobType | null>(null);

  // An object that contains the permissions allowed for the user. It has the app name,
  // where all model names as keys and has permission ids and permission actions
  const [userPermissions, setUserPermissions] =
    createSignal<UserPermissionsType | null>(null);

  onMount(async () => {
    try {
      setIsDataReady(false);

      const response = await getQueuedJob(params.queueName, params.jobId);
      setJob(response.job);
      console.log(response.job);

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
          !hasViewOnlyModelPermission(
            userPermissions() as UserPermissionsType,
            "django_rq",
            "queue"
          )
        }
      >
        <h1 class="text-white">You have no permissions for this page</h1>
      </Show>

      <Show
        when={hasViewOnlyModelPermission(
          userPermissions() as UserPermissionsType,
          "django_rq",
          "queue"
        )}
      >
        <h1 class="text-white">Job Detail {params.jobId}</h1>
        {/* <ViewModelForm
          appLabel={params.appLabel}
          modelName={params.modelName}
          pk={params.pk}
          modelAdminSettings={modelAdminSettings()}
          modelFields={modelFields()}
        /> */}
      </Show>

      {/* <ChangeModelForm
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
        /> */}
    </Show>
  );
};

export default ViewChangeQueuedJobPage;
