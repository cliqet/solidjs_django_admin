const QueryReportsTable = () => {
    return (
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table class="w-full text-sm text-left rtl:text-right table-auto">
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
                      <tr class="border-b dark:bg-gray-800 border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
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
}

export default QueryReportsTable;