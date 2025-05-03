import { A, useNavigate } from "@solidjs/router";
import {
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import RefreshIcon from "src/assets/icons/refresh-icon";
import CheckboxField from "src/components/form_fields/CheckboxField";
import InputTypeField from "src/components/form_fields/InputTypeField";
import SelectField from "src/components/form_fields/SelectField";
import { useAppContext } from "src/context/sessionContext";
import { useAdminRoute } from "src/hooks/useAdminRoute";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import { QueueStatFieldType, QueueType } from "src/models/django-admin";
import { getWorkerQueues } from "src/services/django-admin";



const REFRESH_UNITS = {
  SECONDS: "seconds",
  MINUTES: "minutes",
};

const QueuesPage = () => {
  const [queues, setQueues] = createSignal<QueueType[]>([]);
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [isAutoRefresh, setIsAutoRefresh] = createSignal(false);
  const [refreshNumber, setRefreshNumber] = createSignal("1");
  const [didRefresh, setDidRefresh] = createSignal(false);
  const [refreshNumberSeconds, setRefreshNumberSeconds] = createSignal(60);
  const [refreshUnit, setRefreshUnit] = createSignal(REFRESH_UNITS.MINUTES);
  const navigate = useNavigate();
  const { setAppState } = useAppContext();
  const { handleFetchError } = useModelAdmin();
  const {
    authRoute,
    dashboardRoute,
    nonAuthRoute,
  } = useAdminRoute();

  let intervalId: NodeJS.Timeout | null;

  const renderQueueStatField = (
    queueName: string,
    fieldObj: QueueStatFieldType
  ) => {
    if (fieldObj.field === 'failed_jobs') {
      return <A
        class="underline text-custom-primary-lighter"
        href={`${dashboardRoute(authRoute.queuesView)}/${queueName}/${
          fieldObj.field
        }`}
      >
        {fieldObj.value}
      </A>
    } else {
      if (fieldObj.value === null) {
        return <span>-</span>;
      }
      return <span>{fieldObj.value}</span>;
    }
  };

  onMount(async () => {
    try {
      const responseQueues = await getWorkerQueues();
      setQueues(responseQueues.queues);
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

  const showRefreshText = () => {
    setDidRefresh(true);

    // Set a timeout to hide the text after 1 second
    const showRefreshTextTimeout = setTimeout(() => {
      setDidRefresh(false); // Hide the refresh text
    }, 300);

    return () => clearTimeout(showRefreshTextTimeout);
  };

  // Auto-refresh logic
  createEffect(() => {
    let refreshNumberRate = +refreshNumber();
    if (refreshUnit() === REFRESH_UNITS.MINUTES) {
      refreshNumberRate *= 60;
      setRefreshNumberSeconds(refreshNumberRate);
    } else {
      setRefreshNumberSeconds(refreshNumberRate);
    }

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (isAutoRefresh()) {
      intervalId = setInterval(async () => {
        try {
          const responseQueues = await getWorkerQueues();
          setQueues(responseQueues.queues);
          showRefreshText();
        } catch (err: any) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          const handler = handleFetchError(err);
          if (handler.shouldNavigate) {
            navigate(nonAuthRoute.loginView);
          } else {
            setAppState("toastState", "type", "danger");
            setAppState("toastState", "isShowing", true);
            setAppState("toastState", "message", err.message ?? handler.message);
          }
        }
      }, refreshNumberRate * 1000);
    }
  });

  const onManualRefresh = async () => {
    try {
      const responseQueues = await getWorkerQueues();
      setQueues(responseQueues.queues);
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
  }

  return (
    <div class="flex-col justify-between p-1 items-center">
      <h1 class="text-xl dark:text-white mb-5">Queues</h1>

      <Show when={isDataReady()}>
        <div class="flex">
          <div class="flex items-center justify-end w-1/2">
            <Show when={didRefresh()}>
              <span class="dark:text-white text-xs text-nowrap mr-3">Refreshed</span>
            </Show>
          </div>
          <div class="flex items-center justify-end w-1/2 gap-3">
            <Show when={!isAutoRefresh()}>
              <span class="cursor-pointer" onClick={onManualRefresh}>
                <RefreshIcon class="w-5 h-5 dark:text-white" />
              </span>
            </Show>

            <span class="dark:text-white text-sm text-nowrap">Refresh Rate:</span>

            <Show when={isAutoRefresh()}>
              <InputTypeField
                onFocus={() => {}}
                onInvalid={() => {}}
                onChangeValue={(value: string, fieldName: string) => {
                  setRefreshNumber(value);
                }}
                isInvalid={false}
                inputProps={{
                  type: "number",
                  id: "refresh-number",
                  pattern: "d*",
                  value: refreshNumber(),
                }}
              />
              <SelectField
                onChangeValue={(value, fieldName) => {
                  setRefreshUnit(value);
                }}
                selectProps={{
                  id: "refresh-unit",
                }}
                options={[
                  {
                    selected: false,
                    value: REFRESH_UNITS.SECONDS,
                    label: "Second/s",
                  },
                  {
                    selected: true,
                    value: REFRESH_UNITS.MINUTES,
                    label: "Minute/s",
                  },
                ]}
              />
            </Show>

            <span class="dark:text-white text-sm text-nowrap">Auto Refresh</span>
            <CheckboxField
              inputProps={{
                id: "refresh-checkbox",
              }}
              checked={false}
              onChangeValue={(value: boolean, fieldName: string) => {
                setIsAutoRefresh(value);
              }}
            />
          </div>
        </div>

        <For each={queues()}>
          {(queue, i) => (
            <div class="w-full border border-custom-primary-lighter rounded-lg shadow-sm bg-dark-gray-800 my-5">
              <ul class="text-sm font-medium text-center text-white divide-x rounded-lg sm:flex divide-gray-600 rtl:divide-x-reverse">
                <li class="w-full">
                  <span class="inline-block w-full p-4 rounded-ss-lg focus:outline-none bg-custom-primary-lighter">
                    NAME: {queue.name}
                  </span>
                </li>
              </ul>
              <div class="border-t dark:border-gray-600">
                <div class="p-4 rounded-lg md:p-8 dark:bg-gray-800">
                  <dl class="grid max-w-screen-xl grid-cols-2 gap-8 p-4 mx-auto sm:grid-cols-3 xl:grid-cols-6 dark:text-white sm:p-8">
                    <For each={queue.fields}>
                      {(field, j) => (
                        <div class="flex flex-col items-center justify-center">
                          <dt class="mb-2 text-lg font-bold">
                            {renderQueueStatField(queue.name, field)}
                          </dt>
                          <dd class="dark:text-gray-400 text-center">
                            {field.label}
                          </dd>
                        </div>
                      )}
                    </For>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default QueuesPage;
