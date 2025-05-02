/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { AppContextProvider } from "./context/sessionContext";

import "./index.css";
import { useAdminRoute } from "./hooks/useAdminRoute";


const AuthLayout = lazy(() => import('src/layouts/AuthLayout'));
const NoAuthLayout = lazy(() => import('src/layouts/NoAuthLayout'));

const App = lazy(() => import('src/App'));
const LoginPage = lazy(() => import('src/pages/LoginPage'));
const NotFoundPage = lazy(() => import('src/pages/NotFoundPage'));
const PasswordResetLinkPage = lazy(() => import('src/pages/PasswordResetLinkPage'));

const AddModelPage = lazy(() => import('src/pages/AddModelPage'));
const ViewChangeModelPage = lazy(() => import('src/pages/ViewChangeModelPage'));
const ListModelViewPage = lazy(() => import('src/pages/ListModelViewPage'));
const DocumentationPage = lazy(() => import('src/pages/DocumentationPage'));
const SettingsPage = lazy(() => import('src/pages/SettingsPage'));
const QueuesPage = lazy(() => import('src/pages/QueuesPage'));
const QueuesFieldListViewPage = lazy(() => import('src/pages/QueuesFieldListViewPage'));
const ViewChangeQueuedJobPage = lazy(() => import('src/pages/ViewChangeQueuedJobPage'));
const ReportsPage = lazy(() => import('src/pages/ReportsPage'));

// For Demo only of custom change link page and can be deleted
const Demo = lazy(() => import('src/pages/Demo'));
const CustomCountryProfileChangePage = lazy(() => import('src/pages/CustomCountryProfileChangePage'));


const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

const { nonAuthRoute, authRoute } = useAdminRoute();

render(
  () => (
    <AppContextProvider>
      <Router>
        <Route path="/dashboard" component={AuthLayout}>
          <Route path="/" component={App}></Route>

          {/** Route for demo only and can be deleted */}
          {__IS_DEMO_MODE__ && <Route path={authRoute.customCountryProfileChangeView} component={CustomCountryProfileChangePage}></Route>}
          

          <Route path={authRoute.addModelView} component={AddModelPage}></Route>
          <Route path={authRoute.viewChangeModelView} component={ViewChangeModelPage}></Route>
          <Route path={authRoute.listModelView} component={ListModelViewPage}></Route>
          <Route path={authRoute.documentationView} component={DocumentationPage}></Route>
          <Route path={authRoute.settingsView} component={SettingsPage}></Route>
          <Route path={authRoute.queuesView} component={QueuesPage}></Route>
          <Route path={authRoute.queryReportsView} component={ReportsPage}></Route>
          <Route path={authRoute.queuesFieldListView} component={QueuesFieldListViewPage}></Route>
          <Route path={authRoute.viewChangeJobView} component={ViewChangeQueuedJobPage}></Route>
        </Route>

        <Route path="/" component={NoAuthLayout}>
          <Route path={nonAuthRoute.loginView} component={LoginPage}></Route>
          <Route path={nonAuthRoute.passwordResetLink} component={PasswordResetLinkPage}></Route>

          {/** FOR DEMO ONLY. This can be deleted */}
          {__IS_DEMO_MODE__ && <Route path="/demo" component={Demo}></Route>}          
          
          <Route path="*" component={NotFoundPage}></Route>
        </Route>
      </Router>
    </AppContextProvider>
  ),
  root!
);
