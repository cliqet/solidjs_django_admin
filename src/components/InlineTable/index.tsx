import { A } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import AngleDownIcon from "src/assets/icons/angle-down-icon";
import AngleUpIcon from "src/assets/icons/angle-up-icon";
import CheckCircleIcon from "src/assets/icons/check-circle-icon";
import CloseCircleIcon from "src/assets/icons/close-circle-icon";
import { FIELDTYPE } from "src/constants/django-admin";
import {
  CustomInlineType,
  initialModelAdminSettings,
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import InlineRowChangeForm from "../InlineRowChangeForm";
import {
  deleteRecord,
  getInlineListview,
  getModelAdminSettings,
  getModelFields,
} from "src/services/django-admin";
import { useAppContext } from "src/context/sessionContext";
import PlusIcon from "src/assets/icons/plus-icon";
import { UserPermissionsType } from "src/models/user";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import InlineRowAddForm from "../InlineRowAddForm";
import EllipsisIcon from "src/assets/icons/ellipsis-icon";
import DynamicInlineTableHeader from "../inline_table_headers/DynamicInlineTableHeader";

export type ListviewDataType = {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
};

export type TableEventType = "rowSelectAll" | "rowSelect";

export type TableMetatdataType = {
  rowsSelected?: { id: string; isChecked: boolean }[];
  rowSelected?: { id: string; isChecked: boolean };
};

type InlineTableProps = {
  parentAppLabel: string;
  parentModelName: string;
  parentPk: string;
  inline: CustomInlineType;
  userPermissions: UserPermissionsType;
};

type TableRowFormType = {
  isOpen: boolean;
};

type TableRowActionType = {
  isOpen: boolean;
};

const InlineTable: Component<InlineTableProps> = (props) => {
  const { appState, setAppState } = useAppContext();
  const [isTableRowFormsReady, setIsTableRowFormsReady] = createSignal(false);
  const [pageLimit, setPageLimit] = createSignal(20);
  const [pageOffset, setPageOffset] = createSignal(0);
  const [currentPage, setCurrentPage] = createSignal(1);
  const [isRowAddFormOpen, setIsRowAddFormOpen] = createSignal(false);
  const [listviewData, setListviewData] = createSignal<ListviewDataType | null>(
    null
  );
  const [tableRowsFormState, setTableRowsFormState] = createSignal<
    TableRowFormType[]
  >([]);
  const [tableRowsActionState, setTableRowsActionState] = createSignal<
    TableRowActionType[]
  >([]);

  // An object which contains the field name as key and the value as an object with
  // field property types such as initial, type, etc
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType>({});

  const [modelAdminSettings, setModelAdminSettings] =
    createSignal<ModelAdminSettingsType>(initialModelAdminSettings);

  const [isTableOpen, setIsTableOpen] = createSignal(true);
  const { hasChangeModelPermission, hasViewModelPermission } = useModelAdmin();

  let tableRowForms: HTMLTableRowElement[] = new Array(length).fill(null);

  const createTableRowForms = () => {
    let tableRowForms: TableRowFormType[] = [];
    listviewData()?.results.forEach((record) => {
      tableRowForms.push({ isOpen: false });
    });
    return tableRowForms;
  };

  const createTableRowActions = () => {
    let tableRowActions: TableRowActionType[] = [];
    listviewData()?.results.forEach((record) => {
      tableRowActions.push({ isOpen: false });
    });
    return tableRowActions;
  };

  const getListviewData = async (modelAdminLimit?: number) => {
    // Get paginated data
    const limit = modelAdminLimit ?? pageLimit();

    try {
      return await getInlineListview(
        props.parentAppLabel,
        props.parentModelName,
        props.parentPk,
        limit,
        pageOffset(),
        props.inline.class_name
      );
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured while retrieving inline data. ${err.message}`,
        type: "danger",
      });
    }
  };

  onMount(async () => {
    try {
      // Setup page limit
      setPageLimit(props.inline.list_per_page);
      const parentPk = props.parentPk;

      const [listviewResponse, modelFieldsData, modelAdminSettingsData] =
        await Promise.all([
          getListviewData(props.inline.list_per_page),
          getModelFields(props.inline.app_label, props.inline.model_name),
          getModelAdminSettings(
            props.inline.app_label,
            props.inline.model_name,
            parentPk
          ),
        ]);

      setListviewData(listviewResponse as ListviewDataType);

      // Setup table row forms
      const tableRowForms = createTableRowForms();
      setTableRowsFormState(tableRowForms);

      // Setup table row actions
      const tableRowActions = createTableRowActions();
      setTableRowsActionState(tableRowActions);

      setModelFields(modelFieldsData.fields);

      setModelAdminSettings(modelAdminSettingsData.model_admin_settings);

      setIsTableRowFormsReady(true);
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured while retrieving data. ${err.message}`,
        type: "danger",
      });
    }
  });

  createEffect(async () => {
    pageLimit();
    pageOffset();

    setIsTableRowFormsReady(false);

    // Get paginated data
    const listviewResponse = await getListviewData();
    setListviewData(listviewResponse as ListviewDataType);

    // Setup table row forms
    const tableRowForms = createTableRowForms();
    setTableRowsFormState(tableRowForms);

    // Setup table row actions
    const tableRowActions = createTableRowActions();
    setTableRowsActionState(tableRowActions);

    setIsTableRowFormsReady(true);
  });

  const getPkField = (record: any): string => {
    if (record?.id) {
      return "id";
    } else {
      return "uid";
    }
  };

  const renderTableData = (
    fieldName: string,
    record: any,
    links: string[],
    customChangeLink: string
  ) => {
    let fieldData: any;

    fieldData = record[fieldName];

    // Handle field data that have choices. Use the string for forms
    if (modelFields()[fieldName]?.choices) {
      const choice = modelFields()[fieldName].choices?.find((choice) => {
        return choice.value === fieldData;
      });
      fieldData = choice?.label;
    }

    // Handle foreignkeys where pk are stored. Use label in foreignkey_choices
    if (modelFields()[fieldName]?.foreignkey_choices) {
      const choice = modelFields()[fieldName].foreignkey_choices?.find(
        (choice) => {
          return choice.value === fieldData;
        }
      );
      fieldData = choice?.label;
    }

    if (modelFields()[fieldName]?.type === FIELDTYPE.BooleanField) {
      if (fieldData) {
        return <CheckCircleIcon class="w-6 h-6 text-gray-800" />;
      } else {
        return <CloseCircleIcon class="w-6 h-6 text-gray-800" />;
      }
    } else {
      if (links.includes(fieldName)) {
        const pk = record[getPkField(record)];
        let initialLink = `/dashboard/${props.inline.app_label}/${props.inline.model_name}`;

        // Replace with custom change link if defined in modeladmin
        if (customChangeLink) {
          initialLink = customChangeLink;
        }

        return (
          <A
            class="cursor-pointer underline font-semibold text-green-700 dark:text-green-300"
            href={`${initialLink}/${pk}/change`}
          >
            {fieldData}
          </A>
        );
      }
      return <span>{fieldData}</span>;
    }
  };

  const onRowClick = async (index: number, pk: string | number) => {
    let newRowForms = [...tableRowsFormState()];
    newRowForms[index].isOpen = !newRowForms[index].isOpen;
    setTableRowsFormState(newRowForms);
  };

  const onActionOpenOrClose = (index: number) => {
    let newRowActions = [...tableRowsActionState()];
    const prevState = newRowActions[index].isOpen;
    newRowActions.forEach((action, i) => {
      newRowActions[i].isOpen = false;
    });
    newRowActions[index].isOpen = !prevState;
    setTableRowsActionState(newRowActions);
  };

  const onSaveRowForm = async (index: number, pk: string | number) => {
    onRowClick(index, pk);

    try {
      setIsTableRowFormsReady(false);

      // Get paginated data
      const listviewResponse = await getListviewData();
      setListviewData(listviewResponse as ListviewDataType);

      // Setup table row forms
      const tableRowForms = createTableRowForms();
      setTableRowsFormState(tableRowForms);

      // Setup table row actions
      const tableRowActions = createTableRowActions();
      setTableRowsActionState(tableRowActions);

      setIsTableRowFormsReady(true);
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured while saving. ${err.message}`,
        type: "danger",
      });
    }
  };

  const onAddRowForm = async () => {
    try {
      setIsTableRowFormsReady(false);

      const listviewResponse = await getListviewData();
      setListviewData(listviewResponse as ListviewDataType);
      setIsRowAddFormOpen(false);

      // Setup table row forms
      const tableRowForms = createTableRowForms();
      setTableRowsFormState(tableRowForms);

      // Setup table row actions
      const tableRowActions = createTableRowActions();
      setTableRowsActionState(tableRowActions);

      setIsTableRowFormsReady(true);
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured while retrieving inline data. ${err.message}`,
        type: "danger",
      });
    }
  };

  const onDeleteInlineRow = async (index: number, pk: string | number) => {
    onActionOpenOrClose(index);

    try {
      await deleteRecord(
        props.inline.app_label,
        props.inline.model_name,
        pk as string
      );

      // Get paginated data
      const listviewResponse = await getListviewData();
      setListviewData(listviewResponse as ListviewDataType);

      // Setup table row forms
      const tableRowForms = createTableRowForms();
      setTableRowsFormState(tableRowForms);
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured while deleting. ${err.message}`,
        type: "danger",
      });
    }
  };

  const addText = () => {
    return isRowAddFormOpen() ? "Close" : "Add";
  };

  return (
    <Show
      when={
        isTableRowFormsReady() &&
        hasViewModelPermission(
          props.userPermissions,
          props.inline.app_label,
          props.inline.model_name
        )
      }
    >
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg pb-5">
        <Show when={props.inline.table_header && isTableOpen()}>
          <div class="bg-white dark:bg-black rounded-sm p-2 mt-2 mb-5">
            <DynamicInlineTableHeader
              componentName="sample_table_header"
              parentAppLabel={props.parentAppLabel}
              parentModelName={props.parentModelName}
              parentPk={props.parentPk}
              inline={props.inline}
              userPermissions={props.userPermissions}
            />
          </div>
        </Show>
        
        <div class="flex justify-between my-2">
          <h3 class="text-lg dark:text-white">
            Inline:
            <a
              href={`/dashboard/${props.inline.app_label}/${props.inline.model_name}`}
              target="_blank"
              class="text-custom-primary-lighter cursor-pointer underline ml-2"
            >
              {props.inline.model_name_label}
            </a>
          </h3>
          <Show when={isTableOpen()}>
            <span class="cursor-pointer" onClick={() => setIsTableOpen(false)}>
              <AngleUpIcon class="w-4 h-4 dark:text-white" />
            </span>
          </Show>
          <Show when={!isTableOpen()}>
            <span class="cursor-pointer" onClick={() => setIsTableOpen(true)}>
              <AngleDownIcon class="w-4 h-4 dark:text-white" />
            </span>
          </Show>
        </div>

        <div
          classList={{
            hidden: !isTableOpen(),
            visible: isTableOpen(),
          }}
        >
          <table class="w-full text-sm text-left rtl:text-right table-auto">
            <thead class="text-xs text-white uppercase bg-custom-primary">
              <tr>
                <th scope="col" class="p-4">
                  <div class="flex items-center"></div>
                </th>
                <For each={props.inline.list_display}>
                  {(fieldName, fieldIndex) => (
                    <th scope="col" class="px-6 py-3">
                      {fieldName.toUpperCase()}
                    </th>
                  )}
                </For>
                <th scope="col" class="p-4">
                  <div class="flex items-center"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={listviewData()?.results}>
                {(record, i) => (
                  <>
                    <tr class="border-b bg-white dark:bg-gray-800 border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                      {/** Dropdown to open change form */}
                      <Show
                        when={hasChangeModelPermission(
                          props.userPermissions,
                          props.inline.app_label,
                          props.inline.model_name
                        )}
                      >
                        <td class="w-4 px-4 py-2">
                          <div class="flex items-center">
                            <span
                              onClick={() => {
                                onRowClick(i(), record.pk);
                              }}
                              class="cursor-pointer"
                            >
                              <Show
                                when={
                                  tableRowsFormState().length > 0 &&
                                  tableRowsFormState()[i()]?.isOpen
                                }
                              >
                                <AngleUpIcon class="w-3 h-3 dark:text-white" />
                              </Show>
                              <Show
                                when={
                                  tableRowsFormState().length > 0 &&
                                  !tableRowsFormState()[i()]?.isOpen
                                }
                              >
                                <AngleDownIcon class="w-3 h-3 dark:text-white" />
                              </Show>
                            </span>
                          </div>
                        </td>
                      </Show>

                      {/** Actual table data */}
                      <For each={props.inline.list_display}>
                        {(fieldName, fieldIndex) => (
                          <td class="px-6 py-2 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                            {renderTableData(
                              fieldName,
                              record,
                              props.inline.list_display_links,
                              props.inline.custom_change_link
                            )}
                          </td>
                        )}
                      </For>

                      {/** Row actions */}
                      <td class="relative px-6 py-2 dark:text-white flex justify-end">
                        <button onClick={() => onActionOpenOrClose(i())}>
                          <EllipsisIcon class="w-5 h-5 dark:text-white" />
                        </button>
                        <Show when={tableRowsActionState()[i()].isOpen}>
                          <div class="absolute right-0 top-full z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                            <div class="py-1">
                              <span
                                onClick={() =>
                                  onDeleteInlineRow(i(), record.pk)
                                }
                                class="cursor-pointer block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                              >
                                Delete
                              </span>
                            </div>
                          </div>
                        </Show>
                      </td>
                    </tr>

                    {/** Inline row change form */}
                    <Show
                      when={
                        tableRowsFormState().length > 0 &&
                        tableRowsFormState()[i()]?.isOpen
                      }
                    >
                      <tr
                        ref={tableRowForms[i()]}
                        class="border-b border-gray-700 w-full"
                      >
                        <td
                          colspan={props.inline.list_display.length + 3}
                          class="w-full"
                        >
                          <div class="p-2 rounded-md mb-2">
                            <InlineRowChangeForm
                              appLabel={props.inline.app_label}
                              modelName={props.inline.model_name}
                              pk={record.pk}
                              modelAdminSettings={modelAdminSettings()}
                              onSave={() => {
                                onSaveRowForm(i(), record.pk);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    </Show>
                  </>
                )}
              </For>
            </tbody>
          </table>

          {/** Add row form section */}
          <div class="flex items-center my-2 gap-2 p-2 rounded-md bg-white dark:bg-black">
            <span class="dark:text-white text-sm">{addText()}</span>
            <span
              class="cursor-pointer"
              onClick={() => setIsRowAddFormOpen((prev) => !prev)}
            >
              <Show when={!isRowAddFormOpen()}>
                <PlusIcon class="w-5 h-5 text-custom-primary-lighter" />
              </Show>
              <Show when={isRowAddFormOpen()}>
                <CloseCircleIcon class="w-6 h-6 text-gray-800" />
              </Show>
            </span>
          </div>

          <Show when={isRowAddFormOpen()}>
            <div class="p-2 bg-white dark:bg-black rounded-md mb-2 border border-custom-primary-lighter">
              <InlineRowAddForm
                appLabel={props.inline.app_label}
                modelName={props.inline.model_name}
                modelAdminSettings={modelAdminSettings()}
                modelFields={modelFields()}
                onAddFn={onAddRowForm}
              />
            </div>
          </Show>

          {/** Pagination */}
          <div class="p-2 bg-green-50 dark:bg-slate-600 rounded-md mb-2">
            <div class="flex items-center justify-center">
              <Show when={listviewData()?.previous}>
                <button
                  onClick={() => {
                    setPageOffset(0);
                    setCurrentPage(1);
                  }}
                  class="button"
                >
                  First
                </button>
              </Show>
              <Show when={listviewData()?.previous}>
                <button
                  onClick={() => {
                    setPageOffset((prev) => prev - pageLimit());
                    setCurrentPage((prev) => prev - 1);
                  }}
                  class="button"
                >
                  Previous
                </button>
              </Show>
              <Show when={listviewData()?.next}>
                <button
                  onClick={() => {
                    setPageOffset((prev) => prev + pageLimit());
                    setCurrentPage((prev) => prev + 1);
                  }}
                  class="button"
                >
                  Next
                </button>
              </Show>
              <Show when={listviewData()?.next}>
                <button
                  onClick={() => {
                    let lastPage;
                    const remainderRecords =
                      (listviewData()?.count as number) % pageLimit();
                    if (remainderRecords === 0) {
                      lastPage =
                        (listviewData()?.count as number) / pageLimit();
                    } else {
                      lastPage =
                        Math.floor(
                          (listviewData()?.count as number) / pageLimit()
                        ) + 1;
                    }
                    setPageOffset(lastPage * pageLimit() - pageLimit());
                    setCurrentPage(lastPage);
                  }}
                  class="button"
                >
                  Last
                </button>
              </Show>
            </div>
            <div class="flex items-center justify-center">
              <span class="dark:text-white text-sm">
                Page {currentPage()}: Total of {listviewData()?.count} records
              </span>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default InlineTable;
