import { useFetch } from "src/hooks/useFetch";

const { noSessionClient, sessionClient } = useFetch();

export async function loginUser(email: string, password: string) : Promise<{ access: string }> {
  const response = await noSessionClient.fetch({
    method: "POST",
    urlSegment: '/django-admin/users/login',
    body: {
      email,
      password
    }
  });

  return response;
}

export async function logoutUser() : Promise<{ message: string }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/users/logout`,
  });
  return response;
}

export async function getUserPermissions(uid: string) : Promise<{ permissions: { [key:string]: any} }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/users/permissions/${uid}`,
  });

  return response;
}
