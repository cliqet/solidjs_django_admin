import { A } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import AngleDown from "src/assets/icons/angle-down";
import AngleUp from "src/assets/icons/angle-up";
import CheckCircle from "src/assets/icons/check-circle";
import CloseCircle from "src/assets/icons/close-circle";
import { FIELDTYPE } from "src/constants/django-admin";
import {
  CustomInlineType,
  initialModelAdminSettings,
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import InlineRowChangeForm from "../InlineRowChangeForm";
import {
  getInlineListview,
  getModelAdminSettings,
  getModelFields,
} from "src/services/django-admin";
import { useAppContext } from "src/context/sessionContext";
import PlusIcon from "src/assets/icons/plus-icon";
import { UserPermissionsType } from "src/models/user";
import { hasChangeModelPermission } from "src/hooks/useModelAdmin";
import InlineRowAddForm from "../InlineRowAddForm";
import CloseXIcon from "src/assets/icons/closex-icon";

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
  inline: CustomInlineType;
  resetParentTable: () => void;
  userPermissions: UserPermissionsType;
};

type TableRowFormType = {
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

  // An object which contains the field name as key and the value as an object with
  // field property types such as initial, type, etc
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType>({});

  const [modelAdminSettings, setModelAdminSettings] =
    createSignal<ModelAdminSettingsType>(initialModelAdminSettings);

  const [isTableOpen, setIsTableOpen] = createSignal(true);

  let tableRowForms: HTMLTableRowElement[] = new Array(length).fill(null);

  const createTableRowForms = () => {
    let tableRowForms: TableRowFormType[] = [];
    listviewData()?.results.forEach((record) => {
      tableRowForms.push({ isOpen: false });
    });
    return tableRowForms;
  };

  const getListviewData = async (modelAdminLimit?: number) => {
    // Get paginated data
    const limit = modelAdminLimit ?? pageLimit();

    try {
      return await getInlineListview(
        props.parentAppLabel,
        props.parentModelName,
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

      // Get paginated data
      const listviewResponse = await getListviewData(props.inline.list_per_page);
      setListviewData(listviewResponse);

      // Setup table row forms
      const tableRowForms = createTableRowForms();
      setTableRowsFormState(tableRowForms);

      // Setup model fields for table use
      const modelFieldsData = await getModelFields(
        props.inline.app_label,
        props.inline.model_name
      );
      setModelFields(modelFieldsData.fields);

      // Set model admin settings
      const modelAdminSettingsData = await getModelAdminSettings(
        props.inline.app_label,
        props.inline.model_name
      );
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

    // Get paginated data
    const listviewResponse = await getListviewData();
    setListviewData(listviewResponse);
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
    if (modelFields()[fieldName].choices) {
      const choice = modelFields()[fieldName].choices?.find((choice) => {
        return choice.value === fieldData;
      });
      fieldData = choice?.label;
    }

    // Handle foreignkeys where pk are stored. Use label in foreignkey_choices
    if (modelFields()[fieldName].foreignkey_choices) {
      const choice = modelFields()[fieldName].foreignkey_choices?.find(
        (choice) => {
          return choice.value === fieldData;
        }
      );
      fieldData = choice?.label;
    }

    if (modelFields()[fieldName].type === FIELDTYPE.BooleanField) {
      if (fieldData) {
        return <CheckCircle />;
      } else {
        return <CloseCircle />;
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
            class="cursor-pointer underline font-semibold"
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

  const onSaveRowForm = async (index: number, pk: string | number) => {
    onRowClick(index, pk);

    try {
      // Get paginated data
      const listviewResponse = await getListviewData();
      setListviewData(listviewResponse);
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
      const listviewResponse = await getListviewData();
      setListviewData(listviewResponse);
      setIsRowAddFormOpen(false);
    } catch (err: any) {
      setAppState("toastState", {
        ...appState.toastState,
        isShowing: true,
        message: `An error occured while retrieving inline data. ${err.message}`,
        type: "danger",
      });
    }
  }

  const addText = () => {
    return isRowAddFormOpen() ? 'Close' : 'Add';
  }

  return (
    <Show when={isTableRowFormsReady()}>
      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div class="flex justify-between my-2">
          <h3 class="text-lg dark:text-white">
            {props.inline.model_name_label} Inline
          </h3>
          <Show when={isTableOpen()}>
                <span
                  class="cursor-pointer"
                  onClick={() => setIsTableOpen(false)}
                >
                  <AngleUp width={5} height={5} />
                </span>
              </Show>
              <Show when={!isTableOpen()}>
                <span
                  class="cursor-pointer"
                  onClick={() => setIsTableOpen(true)}
                >
                  <AngleDown width={5} height={5} />
                </span>
              </Show>
        </div>

        <div
          classList={{
            "hidden": !isTableOpen(),
            "visible": isTableOpen()
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
              </tr>
            </thead>
            <tbody>
              <For each={listviewData()?.results}>
                {(record, i) => (
                  <>
                    <tr class="border-b dark:bg-gray-800 border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <Show when={
                        hasChangeModelPermission(props.userPermissions, props.inline.app_label, props.inline.model_name)
                      }>
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
                                <AngleUp width={5} height={5} />
                              </Show>
                              <Show
                                when={
                                  tableRowsFormState().length > 0 &&
                                  !tableRowsFormState()[i()]?.isOpen
                                }
                              >
                                <AngleDown width={5} height={5} />
                              </Show>
                            </span>
                          </div>
                        </td>
                      </Show>
                      
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
                    </tr>
                    <Show
                      when={
                        tableRowsFormState().length > 0 &&
                        tableRowsFormState()[i()]?.isOpen
                      }
                    >
                      <tr
                        ref={tableRowForms[i()]}
                        class="border-b border-gray-700"
                      >
                        <td
                          colspan={props.inline.list_display.length + 1}
                          class="w-full"
                        >
                          <div class="p-2 border border-slate-300 rounded-md mb-2">
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

          <div class="flex items-center my-2 gap-2 px-2">
            <span class="dark:text-white text-sm">
              { addText() }
            </span>
            <span 
              class="cursor-pointer" 
              onClick={() => setIsRowAddFormOpen((prev) => !prev)}
            >
              <Show when={!isRowAddFormOpen()}>
                <PlusIcon width={5} height={5} />
              </Show>
              <Show when={isRowAddFormOpen()}>
                <CloseCircle />
              </Show>
            </span>
          </div>

          <Show when={isRowAddFormOpen()}>
            <div class="p-2 border border-slate-300 rounded-md mb-2">
              <InlineRowAddForm 
                appLabel={props.inline.app_label} 
                modelName={props.inline.model_name}
                modelAdminSettings={modelAdminSettings()}
                modelFields={modelFields()}
                onAddFn={onAddRowForm}
              />
            </div>
          </Show>

          <div class="p-2 border border-slate-300 rounded-md mb-2">
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
