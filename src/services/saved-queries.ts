import { ReportsDataType } from "src/components/QueryReportsTable";
import { sessionClient } from "src/hooks/useFetch";
import { SavedQueryType } from "src/models/django-admin";

export async function getBuildQueryResults(
  bodyData: any
): Promise<ReportsDataType & { message?: string }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/saved-queries/query-builder/get-data`,
    body: bodyData
  });
  return response;
}

export async function getRawQueryResults(
  sqlCode: string
): Promise<ReportsDataType & { message?: string }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/saved-queries/raw-query/get-data`,
    body: {
      query: sqlCode
    }
  });
  return response;
}

export async function addQueryBuilder(
  queryName: string,
  queryBody: any
): Promise<{ message: string, validation_error?: string[] }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/saved-queries/query-builder/add`,
    body: {
      name: queryName,
      query: queryBody
    }
  });
  return response;
}

export async function changeQueryBuilder(
  queryName: string,
  queryBody: any,
  id: number,
): Promise<{ message: string, validation_error?: string[] }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/saved-queries/query-builder/change/${id}`,
    body: {
      name: queryName,
      query: queryBody
    }
  });
  return response;
}

export async function deleteQueryBuilder(
  id: number,
): Promise<{ message: string }> {
  const response = await sessionClient.fetch({
    method: "DELETE",
    urlSegment: `/django-admin/saved-queries/query-builder/delete/${id}`,
  });
  return response;
}



export async function getSavedQueryBuilders(): Promise<{ queries: SavedQueryType[] }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/saved-queries/query-builder`,
  });
  return response;
}

export async function addRawQuery(
  queryName: string,
  queryBody: any
): Promise<{ message: string, validation_error?: string[] }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/saved-queries/raw-query/add`,
    body: {
      name: queryName,
      query: queryBody
    }
  });
  return response;
}

export async function changeRawQuery(
  queryName: string,
  queryBody: string,
  id: number,
): Promise<{ message: string, validation_error?: string[] }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/saved-queries/raw-query/change/${id}`,
    body: {
      name: queryName,
      query: queryBody
    }
  });
  return response;
}

export async function deleteRawQuery(
  id: number,
): Promise<{ message: string }> {
  const response = await sessionClient.fetch({
    method: "DELETE",
    urlSegment: `/django-admin/saved-queries/raw-query/delete/${id}`,
  });
  return response;
}



export async function getSavedRawQueries(): Promise<{ queries: SavedQueryType[] }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/saved-queries/raw-query`,
  });
  return response;
}
