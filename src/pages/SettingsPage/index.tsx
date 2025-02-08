import { useNavigate } from "@solidjs/router";
import { authRoute, dashboardRoute } from "src/hooks/useAdminRoute";

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div class="flex-col justify-between p-1 items-center">
      <h1 class="text-xl dark:text-white mb-5">
        Settings
      </h1>

      <div class="p-2 bg-custom-primary-lighter rounded-md mb-2 flex-col">
        <h3 
            onClick={() => navigate(dashboardRoute(authRoute.queuesView))}
            class="text-white cursor-pointer hover:underline"
        >
            Queues
        </h3>
      </div>
    </div>
  );
};

export default SettingsPage;
