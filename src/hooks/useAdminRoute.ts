export const nonAuthRoute = {
  loginView: '/login',
  passwordResetLink: '/users/reset/:uidb64/:token',
}

export const authRoute = {
  dashboardHomeView: '/',
  addModelView: '/:appLabel/:modelName/add',
  viewChangeModelView: '/:appLabel/:modelName/:pk/change',
  listModelView: '/:appLabel/:modelName',
  documentationView: '/model-docs',
  settingsView: '/settings',
  queuesView: '/settings/queues',

  // For demo only
  customCountryProfileChangeView: '/custom-change/:modelName/:pk/change',
}

/**
 * 
 * @param route the authRoute
 * @returns the route that starts with /dashboard
 */
export const dashboardRoute = (route: string) : string => {
  if (route === '/') {
    return '/dashboard';
  }
  return `/dashboard${route}`;
}