import { useFetch } from "src/hooks/useFetch";
import { AppSettingsType, FailedJobsType, JobType, ListviewDataType, ModelAdminSettingsType, ModelDocumentationType, QueueType } from "src/models/django-admin";

const { noSessionClient, sessionClient } = useFetch();

export async function getApps(): Promise<AppSettingsType[]> {
  const { appList } = await sessionClient.fetch({
    method: "GET",
    urlSegment: "/django-admin/apps",
  });

  return appList;
}

export async function getModelFields(
  appLabel: string, 
  modelName: string
): Promise<{ fields: { [key:string]: any } }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/model-fields/${appLabel}/${modelName}`,
  });
  return response;
}

/**
 * 
 * @param appLabel 
 * @param modelName 
 * @param pk pass any string or number if you do not have a foreign key. 0 is recommended
 * @returns 
 */
export async function getModelAdminSettings(
  appLabel: string, 
  modelName: string,
  pk: string | number
): Promise<{ model_admin_settings: ModelAdminSettingsType }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/model-admin-settings/${appLabel}/${modelName}/${pk}`,
  });
  return response;
}

export async function getModelFieldsEdit(
  appLabel: string, 
  modelName: string, 
  pk: string
): Promise<{ fields: { [key:string]: any } }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/model-fields/${appLabel}/${modelName}/${pk}`,
  });
  return response;
}

export async function getModelRecord(
  appLabel: string, 
  modelName: string, 
  pk: string
): Promise<{ record: { [key:string]: any } }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/model/${appLabel}/${modelName}/${pk}`,
  });
  return response;
}


export async function changeRecord(
  appLabel: string, 
  modelName: string, 
  pk: string, 
  bodyData: any
): Promise<{ message: string, validation_error?: { [key: string]: string[] } }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/change-record/${appLabel}/${modelName}/${pk}`,
    useFormDataHeaders: true,
    body: bodyData
  });
  return response;
}

export async function addRecord(
  appLabel: string, 
  modelName: string, 
  bodyData: any
): Promise<{ message: string, pk: string | number }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/add-record/${appLabel}/${modelName}`,
    useFormDataHeaders: true,
    body: bodyData
  });
  return response;
}

export async function deleteRecord(
  appLabel: string, 
  modelName: string, 
  pk: string
): Promise<{ message: string, has_error: boolean }> {
  const response = await sessionClient.fetch({
    method: "DELETE",
    urlSegment: `/django-admin/delete-record/${appLabel}/${modelName}/${pk}`,
  });
  return response;
}

export async function applyCustomAction(
  appLabel: string, 
  modelName: string,
  func: string,
  bodyData: any
): Promise<{ message: string }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/model-listview-action/${appLabel}/${modelName}/${func}`,
    body: bodyData
  });
  return response;
}

export async function getModelListview(
  appLabel: string, 
  modelName: string,
  limit: number,
  offset: number,
  filters: string,
  searchTerm: string,
): Promise<ListviewDataType> {
  let url = `/django-admin/model-listview/${appLabel}/${modelName}?limit=${limit}&offset=${offset}${filters}`;
  if (searchTerm) {
    url += `&custom_search=${searchTerm}`;
  }

  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: url,
  });
  return response;
}

export async function getInlineListview(
  appLabel: string, 
  modelName: string,
  pk: string,
  limit: number,
  offset: number,
  inlineClass: string
): Promise<ListviewDataType> {
  const url = `/django-admin/inline-listview/${appLabel}/${modelName}/${pk}?limit=${limit}&offset=${offset}&inline_class=${inlineClass}`;

  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: url,
  });
  return response;
}

export async function getModelDocs(): Promise<{ docs: ModelDocumentationType[] }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: '/django-admin/model-docs',
  });
  return response;
}

export async function verifyCloudflareToken(
  token: string, 
): Promise<{ isValid: boolean }> {
  const response = await noSessionClient.fetch({
    method: "POST",
    urlSegment: '/django-admin/verify-cloudflare-token',
    body: {
      token
    }
  });
  return response;
}

export async function sendPasswordResetLink(
  uid: string, 
): Promise<{ success: boolean, message: string }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/users/send-password-reset-link/${uid}`,
  });
  return response;
}

export async function verifyPasswordResetLink(
  uidb64: string,
  token: string 
): Promise<{ valid: boolean, message: string }> {
  const response = await noSessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/users/verify-password-reset-link/${uidb64}/${token}`,
  });
  return response;
}

export async function resetPasswordViaLink(
  uidb64: string,
  token: string,
  password: string
): Promise<{ success: boolean, message: string }> {
  const response = await noSessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/users/reset-password-via-link/${uidb64}/${token}`,
    body: {
      password
    }
  });
  return response;
}

export async function getWorkerQueues(): Promise<{ queues: QueueType[] }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: "/django-admin/worker-queues",
  });
  return response;
}

export async function getFailedJobs(
  queueName: string,
): Promise<{ failed_jobs: FailedJobsType }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/worker-failed-jobs/${queueName}`,
  });
  return response;
}

export async function getQueuedJob(
  queueName: string,
  jobId: string
): Promise<{ job: JobType }> {
  const response = await sessionClient.fetch({
    method: "GET",
    urlSegment: `/django-admin/worker-jobs/${queueName}/${jobId}`,
  });
  return response;
}

export async function requeueJobs(
  queueName: string,
  jobIds: string[]
): Promise<{ success: boolean, message: string }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/worker-jobs/requeue`,
    body: {
      queue_name: queueName,
      job_ids: jobIds
    }
  });
  return response;
}

export async function deleteJobs(
  queueName: string,
  jobIds: string[]
): Promise<{ success: boolean, message: string }> {
  const response = await sessionClient.fetch({
    method: "POST",
    urlSegment: `/django-admin/worker-jobs/delete`,
    body: {
      queue_name: queueName,
      job_ids: jobIds
    }
  });
  return response;
}
