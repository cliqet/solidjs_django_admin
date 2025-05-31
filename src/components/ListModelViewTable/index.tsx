import { A } from "@solidjs/router";
import { Component, For } from "solid-js";
import CheckCircleIcon from "src/assets/icons/check-circle-icon";
import CloseCircleIcon from "src/assets/icons/close-circle-icon";
import { FIELDTYPE } from "src/constants/django-admin";
import { ListModelViewTableProps, ModelFieldsObjType } from "src/models/django-admin";
import PrintIcon from "src/assets/icons/print-icon";
import { useTable } from "src/hooks/useTable";
import CsvIcon from "src/assets/icons/csv-icon";



const ListModelViewTable: Component<ListModelViewTableProps> = (props) => {
  const { exportTableToCSV, printTable } = useTable();
  let checkboxAllRef!: HTMLInputElement;
  let checkboxRowRefs: HTMLInputElement[] = new Array(length).fill(null);

  const getPkField = (record: any) : string => {
    if (record?.id) {
      return 'id';
    } else {
      return 'uid';
    }
  }

  const renderTableData = (
    fieldName: string, 
    record: any, 
    links: string[], 
    modelFields: ModelFieldsObjType,
    customChangeLink: string
  ) => {
    let fieldData: any;

    fieldData = record[fieldName];

    // Handle field data that have choices. Use the string for forms
    if (modelFields[fieldName].choices) {
      const choice = modelFields[fieldName].choices.find(choice => {
        return choice.value === fieldData
      });
      fieldData = choice?.label;
    }

    // Handle foreignkeys where pk are stored. Use label in foreignkey_choices
    if (modelFields[fieldName].foreignkey_choices) {
      const choice = modelFields[fieldName].foreignkey_choices.find(choice => {
        return choice.value === fieldData
      });
      fieldData = choice?.label;
    }

    if (props.modelFields[fieldName].type === FIELDTYPE.BooleanField) {
      if (fieldData) {
        return <CheckCircleIcon class="w-6 h-6 text-gray-800 boolean-true" />;
      } else {
        return <CloseCircleIcon class="w-6 h-6 text-gray-800 boolean-false" />;
      }
    } else {
      if (links.includes(fieldName)) {
        const pk = record[getPkField(record)];
        let initialLink = `/dashboard/${props.appLabel}/${props.modelName}`;

        // Replace with custom change link if defined in modeladmin
        if (customChangeLink) {
          initialLink = customChangeLink;
        }

        return <A 
                class="cursor-pointer underline font-semibold" 
                href={`${initialLink}/${pk}/change`}
              >{ fieldData }</A>
      }
      return <span>{ fieldData }</span>;
    }
  }

  const onRowCheckAll = () => {
    let rowsSelected: { id: string; isChecked: boolean; }[] = [];
    
    if (checkboxAllRef.checked) {
      checkboxRowRefs.forEach(checkbox => {
        checkbox.checked = true;
        rowsSelected.push({ id: checkbox.id, isChecked: true });
      });
    } else {
      checkboxRowRefs.forEach(checkbox => {
        checkbox.checked = false;
        rowsSelected.push({ id: checkbox.id, isChecked: false });
      });
    }
    props.onTableEvent('rowSelectAll', { rowsSelected });
  }

  const onRowCheck = (e: Event) => {
    const checkbox = e.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    props.onTableEvent('rowSelect', { rowSelected: { id: checkbox.id, isChecked } });
  }

  return (
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div class="w-full my-2 rounded-md p-2 bg-white dark:bg-slate-800">
          <div class="flex gap-5">
            <span class="cursor-pointer" onClick={() => {
              printTable(
                `main-table-${props.appLabel}-${props.modelName}`,
                `${props.appLabel.toUpperCase()}-${props.modelName.toUpperCase()}`
              );
            }}>
              <PrintIcon class="w-5 h-5 text-orange-500" />
            </span>

            <span class="cursor-pointer" onClick={() => {
              exportTableToCSV(
                `main-table-${props.appLabel}-${props.modelName}`,
                `${props.appLabel.toUpperCase()}-${props.modelName.toUpperCase()}`
              );
            }}>
              <CsvIcon class="w-6 h-6 text-green-500" />
            </span>
          </div>
      </div>
      
      <table id={`main-table-${props.appLabel}-${props.modelName}`} class="w-full text-sm text-left rtl:text-right table-auto">
        <thead class="text-xs text-white uppercase bg-custom-primary">
          <tr>
            <th scope="col" class="p-4">
              <div class="flex items-center">
                <input
                  id="checkbox-all"
                  ref={checkboxAllRef!}
                  type="checkbox"
                  onChange={onRowCheckAll}
                  class="w-4 h-4 text-custom-primary bg-gray-100 border-white rounded focus:ring-custom-primary-lighter"
                />
                <label for="checkbox-all-search" class="sr-only">
                  checkbox
                </label>
              </div>
            </th>
            <For each={props.listdisplayFields}>
              {(fieldName, fieldIndex) => (
                <th scope="col" class="px-6 py-3">
                  {fieldName.toUpperCase()}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.listviewData.results}>
            {(record, i) => (
              <tr class="border-b bg-white dark:bg-gray-800 border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <td class="w-4 px-4 py-2">
                  <div class="flex items-center">
                    <input
                      id={record[getPkField(record)]}
                      ref={checkboxRowRefs[i()]}
                      onClick={onRowCheck}
                      type="checkbox"
                      class="w-4 h-4 text-custom-primary rounded focus:ring-custom-primary-lighter focus:ring-2 dark:bg-gray-700 border-gray-600"
                    />
                    <label for="checkbox-table-search-1" class="sr-only">
                      checkbox
                    </label>
                  </div>
                </td>
                <For each={props.listdisplayFields}>
                  {(fieldName, fieldIndex) => (
                    <td class="px-6 py-2 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                      {renderTableData(
                        fieldName, 
                        record, 
                        props.listdisplayLinks, 
                        props.modelFields,
                        props.customChangeLink
                      )}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default ListModelViewTable;
