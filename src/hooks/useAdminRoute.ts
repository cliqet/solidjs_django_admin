export const useAdminRoute = () => {
  const nonAuthRoute = {
    loginView: '/login',
    passwordResetLink: '/users/reset/:uidb64/:token',
  }
  
  const authRoute = {
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
  
    // For demo only and can be deleted
    customCountryProfileChangeView: '/custom-change/:modelName/:pk/change',
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