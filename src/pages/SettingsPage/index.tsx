import { useNavigate } from "@solidjs/router";
import PostgresIcon from "src/assets/icons/postgres-icon";
import RedisIcon from "src/assets/icons/redis-icon";
import { useAdminRoute } from "src/hooks/useAdminRoute";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { authRoute, dashboardRoute } = useAdminRoute();

  return (
    <div class="flex-col justify-between p-1 items-center">
      <h1 class="text-xl dark:text-white mb-5">Settings</h1>

      <div class="p-2 bg-green-100 dark:bg-gray-700 rounded-md flex-col mb-5">
        <div class="flex items-center gap-2">
          <div class="w-8">
            <RedisIcon class="w-7 h-7 text-red-500" />
          </div>
          <h3
            onClick={() => navigate(dashboardRoute(authRoute.queuesView))}
            class="text-red-600 cursor-pointer hover:underline"
          >
            Queues
          </h3>
        </div>
      </div>

      <div class="p-2 bg-green-100 dark:bg-gray-700 rounded-md flex-col mb-5">
        <div class="flex items-center gap-2">
          <div class="w-8">
            <PostgresIcon class="w-7 h-7 text-blue-500" />
          </div>
          <h3
            onClick={() => navigate(dashboardRoute(authRoute.queryReportsView))}
            class="text-blue-500 cursor-pointer hover:underline"
          >
            Query Reports
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
