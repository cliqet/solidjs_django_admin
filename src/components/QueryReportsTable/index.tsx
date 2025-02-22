import { Component, For, Show } from "solid-js";

export type ReportsDataType = {
  count: number;
  fields: string[];
  results: { [key: string]: any }[];
};

type QueryReportsTableProps = {
  data: ReportsDataType;
};

export const initialTableData = {
  count: 0,
  fields: [],
  results: [],
};

const QueryReportsTable: Component<QueryReportsTableProps> = (props) => {
  const renderCellValue = (cellValue: any) => {
    if (typeof cellValue === "boolean") {
      if (cellValue) {
        return "True";
      } else {
        return "False";
      }
    }else if (typeof cellValue === "object") {
      return JSON.stringify(cellValue);
    } else {
      return cellValue;
    }
  }

  return (
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <h3 class="dark:text-white text-sm">
          Total records found: 
          <Show when={props.data.fields.length > 0}>
            {props.data.count}
          </Show>
        </h3>

      <table class="w-full text-sm text-left rtl:text-right table-auto">
        <thead class="text-xs text-white uppercase bg-custom-primary">
          <tr>
            <For each={props.data.fields}>
              {(fieldName, fieldIndex) => (
                <th scope="col" class="px-6 py-3">
                  {fieldName}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For each={props.data.results}>
            {(record, i) => (
              <tr class="border-b dark:bg-gray-800 border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <For each={props.data.fields}>
                  {(fieldName, fieldIndex) => (
                    <td class="px-6 py-2 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                      {renderCellValue(record[fieldName])}
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

export default QueryReportsTable;
