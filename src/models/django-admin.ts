export type SelectedOptionsType = {
  selected: boolean;
  value: any;
  label: string;
};

export type ManyToManyCheckboxDataType = {
  id: string;
  checked: boolean;
  label: string;
};

export type ModelFieldType = {
  name: string;
  label: string;
  is_primary_key: boolean;
  max_length: number | null;
  editable: boolean;
  help_text: string;
  auto_created: boolean;
  type: string;
  initial: any;
  required: boolean;
  choices: SelectedOptionsType[] | null;
  foreignkey_choices?: SelectedOptionsType[] | null;
  foreignkey_app?: string;
  foreignkey_model?: string;
  regex_pattern?: string;
  min_value?: number;
  max_value?: number;
  manytomany_choices?: ManyToManyCheckboxDataType[];
};

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

export type InlineRowFormProps = {
  appLabel: string;
  modelName: string;
  pk: string;
  modelAdminSettings: ModelAdminSettingsType;
  onSave: () => void;
};

export type AddModelFormProps = {
  appLabel: string;
  modelName: string;
  modelAdminSettings: ModelAdminSettingsType;
  modelFields: ModelFieldsObjType;
  onAddFn: () => void;
};

export type ViewModelFormProps = {
  appLabel: string;
  modelName: string;
  pk: string;
  modelAdminSettings: ModelAdminSettingsType;
  modelFields: ModelFieldsObjType;
};

export type ModelDocumentationType = {
  id: number;
  appModelName: string;
  content: string;
};

export type AccordionDocType = {
  id: number;
  isOpen: boolean;
}

export type FilterCheckboxType = {
  field: string;
  values: {
    value: string | number | null;
    label: string;
    checked: boolean;
    checkboxId: string;
  }[];
};

export type FilterStateType = {
  checkboxes: FilterCheckboxType[];
  pageFilters: { [key: string]: any[] };
};

export type ListviewDataType = {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export type TableEventType = 'rowSelectAll' | 'rowSelect';

export type TableMetatdataType = {  
  rowsSelected?: { id: string; isChecked: boolean; }[];
  rowSelected?: { id: string; isChecked: boolean; };
}

export type ListModelViewTableProps = {
  appLabel: string;
  modelName: string;
  ordering: string[];
  listdisplayFields: string[];
  listdisplayLinks: string[];
  customChangeLink: string;
  listviewData: ListviewDataType;
  modelFields: ModelFieldsObjType;
  onTableEvent: (tableEvent: TableEventType, metadata: TableMetatdataType) => any;
}

export type QueueFieldListViewType = ListviewDataType & {
  table_fields: string[];
};

export type QueueStatFieldType = {
  label: string;
  value: string | number;
  field: string;
};

export type QueueType = {
  fields: QueueStatFieldType[];
  name: string;
};

export type JobType = {
  id: string;
  created_at: string;
  started_at: string;
  enqueued_at: string;
  ended_at: string;
  timeout: number;
  ttl: number | null;
  meta: any;
  callable: string;
  args: string[];
  kwargs: { [key: string]: any };
  execution_info: string;
};

export type FailedJobsType = {
  results: JobType[];
  count: number;
  table_fields: string[];
}

export type AppModelListType = {
  label: string;
  value: string;
  models: {
    label: string;
    value: string;
  }[];
};

export type ConditionType = [string, string, any];

export type QueryBuilderType = {
  app_name: string;
  model_name: string;
  conditions: ConditionType[];
  orderings: string[];
  query_limit: number | null;
};

export type SavedQueryType = {
  id: number;
  name: string;
  query: QueryBuilderType;
};