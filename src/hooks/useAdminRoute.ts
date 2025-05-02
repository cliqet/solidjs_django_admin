export const useAdminRoute = () => {
  const nonAuthRoute: { [key: string]: string } = {
    loginView: '/login',
    passwordResetLink: '/users/reset/:uidb64/:token',
  }
  
  const authRoute: { [key: string]: string } = {
    dashboardHomeView: '/',
    addModelView: '/:appLabel/:modelName/add',
    viewChangeModelView: '/:appLabel/:modelName/:pk/change',
    listModelView: '/:appLabel/:modelName',
    documentationView: '/model-docs',
    settingsView: '/settings',
    queuesView: '/settings/queues',
    queryReportsView: '/settings/query-reports',
    queuesFieldListView: '/settings/queues/:queueName/:field',
    viewChangeJobView: '/settings/queues/:queueName/:field/:jobId',
  

  }

  if (__IS_DEMO_MODE__) {
    authRoute['customCountryProfileChangeView'] = '/custom-change/:modelName/:pk/change';
    authRoute['customClassificationAddView'] = '/custom/classification/customadd';
    authRoute['customClassificationListModelView'] = '/custom/classification';
  }
  
  /**
   * 
   * @param route the authRoute
   * @returns the route that starts with /dashboard
   */
  const dashboardRoute = (route: string) : string => {
    if (route === '/') {
      return '/dashboard';
    }
    return `/dashboard${route}`;
  }

  return {
    nonAuthRoute,
    authRoute,
    dashboardRoute,
  }
}