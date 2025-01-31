import { onMount } from "solid-js";
import { getWorkerQueues } from "src/services/django-admin";

const QueuesPage = () => {
  onMount(async () => {
    try {
        const response = await getWorkerQueues();
        console.log(response);
    } catch (err: any) {

    }
  })

  return (
    <div class="flex-col justify-between p-1 items-center">
      <h1 class="text-xl text-white mb-5">Queues</h1>
    </div>
  );
};

export default QueuesPage;
