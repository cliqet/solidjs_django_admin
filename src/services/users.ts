import { sessionClient, noSessionClient } from "src/hooks/useFetch";


export async function loginUser(email: string, password: string) : Promise<any> {
  const response = await noSessionClient.fetch({
    method: "POST",
    urlSegment: '/users/login',
    body: {
      email,
      password
    }
  });

  return response;
}

export async function logoutUser() : Promise<any> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/users/logout`,
  });
  return response;
}

export async function getUserPermissions(uid: string) : Promise<any> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/users/permissions/${uid}`,
  });

  return response;
}
