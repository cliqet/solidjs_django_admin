import { useNavigate } from "@solidjs/router";
import RedisIcon from "src/assets/icons/redis-icon";
import ReportsIcon from "src/assets/icons/reports-icon";
import { authRoute, dashboardRoute } from "src/hooks/useAdminRoute";

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div class="flex-col justify-between p-1 items-center">
      <h1 class="text-xl dark:text-white mb-5">Settings</h1>

      <div class="p-2 bg-custom-primary-lighter rounded-md flex-col mb-5">
        <div class="flex items-center gap-2">
          <div class="w-8">
            <RedisIcon class="w-7 h-7 text-white" />
          </div>
          <h3
            onClick={() => navigate(dashboardRoute(authRoute.queuesView))}
            class="text-white cursor-pointer hover:underline"
          >
            Queues
          </h3>
        </div>
      </div>

      <div class="p-2 bg-custom-primary-lighter rounded-md flex-col mb-5">
        <div class="flex items-center gap-2">
          <div class="w-8">
            <ReportsIcon width={7} height={5} />
          </div>
          <h3
            onClick={() => navigate(dashboardRoute(authRoute.queryReportsView))}
            class="text-white cursor-pointer hover:underline"
          >
            Query Reports
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
