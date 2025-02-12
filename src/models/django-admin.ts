import { ModelFieldType } from "src/components/form_fields/DynamicFormField";

export type ModelFieldsObjType = {
  [key: string]: ModelFieldType;
};

export type FieldsetType = {
  title: string;
  fields: string[];
};

export type FieldStateType = {
  fieldName: string;
  value: any;
  isInvalid: boolean;
  errorMsg: string;
  metadata?: any;
};

export type FieldsInFormStateType = {
  [key: string]: FieldStateType;
};

export type CustomActionsType = {
  func: string;
  label: string;
};

export type TableFilterValues = {
  value: string | number | null;
  label: string;
}

export type TableFiltersType = {
  field: string;
  values: TableFilterValues[];
}

export type CustomInlineType = {
  app_label: string;
  model_name: string;
  model_name_label: string;
  list_display: string[];
  list_display_links: string[];
  custom_change_link: string;
  list_per_page: number;
  class_name: string;
}

export type ModelAdminSettingsType = {
  model_name: string;
  app_label: string;
  fieldsets: FieldsetType[];
  list_display: string[];
  list_display_links: string[];
  list_per_page: number;
  search_fields: string[];
  search_help_text: string;
  list_filter: string[];
  readonly_fields: string[];
  ordering: string[];
  custom_actions: CustomActionsType[];
  autocomplete_fields: string[];
  table_filters: TableFiltersType[];
  custom_inlines: CustomInlineType[];
  extra_inlines: string[];
  custom_change_link: string;
};

export const initialModelAdminSettings = {
  model_name: "",
  app_label: "",
  fieldsets: [],
  list_display: [],
  list_display_links: [],
  list_per_page: 20,
  search_fields: [],
  search_help_text: "",
  list_filter: [],
  readonly_fields: [],
  ordering: [],
  custom_actions: [],
  autocomplete_fields: [],
  table_filters: [],
  custom_inlines: [],
  extra_inlines: [],
  custom_change_link: ''
};


export type ModelPermissionType = {
  add: boolean;
  change: boolean;
  delete: boolean;
  view: boolean;
};

export type AppModelType = {
  name: string;
  objectName: string;
  adminUrl: string;
  addUrl: string;
  perms: ModelPermissionType;
  viewOnly: boolean;
};

export type AppSettingsType = {
  name: string;
  appLabel: string;
  appUrl: string;
  hasModulePerms: boolean;
  models: AppModelType[];
};

