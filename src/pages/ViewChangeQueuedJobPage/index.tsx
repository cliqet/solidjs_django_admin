import { useParams, useNavigate } from "@solidjs/router";
import { createSignal, Show, onMount, For } from "solid-js";
import {
  hasViewOnlyModelPermission,
  handleFetchError,
} from "src/hooks/useModelAdmin";
import { useAppContext } from "src/context/sessionContext";
import { UserPermissionsType } from "src/models/user";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import { getUserPermissions } from "src/services/users";
import { getQueuedJob } from "src/services/django-admin";
import Label from "src/components/form_fields/Label";

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

  const renderFieldValue = (value: any) => {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }

    return JSON.stringify(value);
  };

  const toTitleCase = (str: string) => {
    return str
      .split("_") // Split the string by underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" "); // Join the words with a space
  };

  return (
    <Show when={isDataReady() && job()}>
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
        <div>
          <h1 class="text-xl font-bold text-slate-200">
            {toTitleCase(params.field)}
          </h1>

          <div class="mt-3">
            <div>
              <div class="bg-custom-primary p-2 rounded-t-md my-3">
                <h3 class="text-white">Fields</h3>
              </div>
              <div class="w-1/2">
                <For each={Object.keys(job() as JobType)}>
                  {(fieldKey, j) => (
                    <>
                      <div class="p-1 my-2">
                        <Label for={fieldKey} text={fieldKey.toUpperCase()} />
                        <span class="text-white">
                          {renderFieldValue(job()?.[fieldKey as keyof JobType])}
                        </span>
                      </div>
                      <hr class="border-t-1 border-slate-400 mb-3" />
                    </>
                  )}
                </For>
              </div>

              <div>
                <button type="submit" class="button-danger">
                  Delete
                </button>
                <button type="submit" class="button">
                  Requeue
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
};

export default ViewChangeQueuedJobPage;
