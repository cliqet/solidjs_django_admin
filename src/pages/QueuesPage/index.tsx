import { A } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import { authRoute, dashboardRoute } from "src/hooks/useAdminRoute";
import { getWorkerQueues } from "src/services/django-admin";

type QueueStatFieldType = {
  label: string;
  value: string | number;
  field: string;
};

type QueueType = {
  fields: QueueStatFieldType[];
};

const QueuesPage = () => {
  const [queues, setQueues] = createSignal<QueueType[]>([]);
  const [isDataReady, setIsDataReady] = createSignal(false);

  const renderQueueStatField = (fieldObj: QueueStatFieldType) => {
    if (
      [
        "name",
        "oldest_job_timestamp",
        "host",
        "port",
        "db",
        "scheduler_pid",
      ].includes(fieldObj.field)
    ) {
      if (!fieldObj.value) {
        return <span>-</span>;
      } else {
        return <span>{fieldObj.value}</span>;
      }
    } else {
      return (
        <A 
            class="underline" 
            href={`${dashboardRoute(authRoute.queuesView)}/${fieldObj.field}`}
        >
          {fieldObj.value}
        </A>
      );
    }
  };

  onMount(async () => {
    try {
      const responseQueues = await getWorkerQueues();
      setQueues(responseQueues.queues);
      setIsDataReady(true);

    } catch (err: any) {}
  });

  return (
    <div class="flex-col justify-between p-1 items-center">
      <h1 class="text-xl text-white mb-5">Queues</h1>

      <Show when={isDataReady()}>
        <For each={queues()}>
          {(queue, i) => (
            <div class="w-full border rounded-lg shadow-sm bg-gray-800 border-gray-700 my-5">
              <ul class="text-sm font-medium text-center text-white divide-x rounded-lg sm:flex divide-gray-600 rtl:divide-x-reverse">
                <li class="w-full">
                  <span class="inline-block w-full p-4 rounded-ss-lg focus:outline-none bg-gray-700">
                    Statistics
                  </span>
                </li>
              </ul>
              <div class="border-t border-gray-600">
                <div class="p-4 rounded-lg md:p-8 bg-gray-800">
                  <dl class="grid max-w-screen-xl grid-cols-2 gap-8 p-4 mx-auto sm:grid-cols-3 xl:grid-cols-6 text-white sm:p-8">
                    <For each={queue.fields}>
                      {(field, j) => (
                        <div class="flex flex-col items-center justify-center">
                          <dt class="mb-2 text-lg font-bold">
                            {renderQueueStatField(field)}
                          </dt>
                          <dd class="text-gray-400 text-center">
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
