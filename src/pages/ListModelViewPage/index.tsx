import SearchInput from "src/components/SearchInput";
import ListModelViewTable, {
  TableEventType,
  TableMetatdataType,
} from "src/components/ListModelViewTable";
import SelectField from "src/components/form_fields/SelectField";
import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import {
  applyCustomAction,
  getModelAdminSettings,
  getModelFields,
  getModelListview,
} from "src/services/django-admin";
import {
  initialModelAdminSettings,
  ModelAdminSettingsType,
  ModelFieldsObjType,
} from "src/models/django-admin";
import { UserPermissionsType } from "src/models/user";
import { getUserPermissions } from "src/services/users";
import { useAppContext } from "src/context/sessionContext";
import {
  handleFetchError,
  hasAddModelPermission,
  hasChangeModelPermission,
  hasViewModelPermission,
} from "src/hooks/useModelAdmin";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import { ListviewDataType } from "src/components/ListModelViewTable";
import Modal from "src/components/Modal";
import CheckboxField from "src/components/form_fields/CheckboxField";
import AngleDown from "src/assets/icons/angle-down";
import AngleUp from "src/assets/icons/angle-up";
import InlineTable from "src/components/InlineTable";
import DynamicExtraInline from "src/components/extra_inlines/DynamicExtraInline";
import ActionModalMessage from "src/components/ActionModalMessage";

type FilterCheckboxType = {
  field: string;
  values: {
    value: string | number | null;
    label: string;
    checked: boolean;
    checkboxId: string;
  }[];
};

type FilterStateType = {
  checkboxes: FilterCheckboxType[];
  pageFilters: { [key: string]: any[] };
};

const NO_ACTION = "-";

const ListModelViewPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { appState, setAppState } = useAppContext();
  const [listviewData, setListviewData] = createSignal<ListviewDataType | null>(
    null
  );
  const [modelFields, setModelFields] = createSignal<ModelFieldsObjType | null>(
    null
  );
  const [modelAdminSettings, setModelAdminSettings] =
    createSignal<ModelAdminSettingsType>(initialModelAdminSettings);
  const [userPermissions, setUserPermissions] =
    createSignal<UserPermissionsType | null>(null);
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [pageLimit, setPageLimit] = createSignal(20);
  const [pageOffset, setPageOffset] = createSignal(0);
  const [currentPage, setCurrentPage] = createSignal(1);

  // - means no action selected
  const [currentAction, setCurrentAction] = createSignal(NO_ACTION);
  const [rowsSelected, setRowsSelected] = createSignal<string[]>([]);

  // This will hold state of the checked filters
  const [filterState, setFilterState] = createSignal<FilterStateType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isFilterOpen, setIsFilterOpen] = createSignal(false);
  const [isParentTableOpen, setIsParentTableOpen] = createSignal(true);
  let modalEventPromise: (event: string) => void;

  const resetFilters = () => {
    // Set initial filter state
    let initialFilterState: FilterStateType = {
      checkboxes: [],
      pageFilters: {},
    };
    const checkboxesState: FilterCheckboxType[] =
      modelAdminSettings().table_filters.map((filter) => {
        const filterValues = filter.values.map((fieldValue) => {
          return {
            ...fieldValue,
            checked: true,
            checkboxId: `${filter.field}-${fieldValue.value}`,
          };
        });
        return { field: filter.field, values: filterValues };
      });

    initialFilterState.checkboxes = checkboxesState;
    initialFilterState.pageFilters = {};
    setFilterState(initialFilterState);
  };

  const resetState = () => {
    setRowsSelected([]);
    setCurrentAction("");
    setCurrentPage(1);
    setPageOffset(0);
    setSearchTerm("");
    resetFilters();
  };

  const buildFilterUrlString = () => {
    let filterUrl = "";
    if (!filterState()?.pageFilters) {
      return filterUrl;
    }

    Object.keys(filterState()?.pageFilters as {}).forEach((key) => {
      filterUrl += `&${key}=${JSON.stringify(filterState()?.pageFilters[key])}`;
    });
    return filterUrl;
  };

  const getListviewData = async () => {
    // Get paginated data
    return await getModelListview(
      params.appLabel,
      params.modelName,
      pageLimit(),
      pageOffset(),
      buildFilterUrlString(),
      searchTerm()
    );
  };

  createEffect(async () => {
    try {
      setIsDataReady(false);

      // Setup model fields and model admin settings
      const modelFieldsData = await getModelFields(
        params.appLabel,
        params.modelName
      );
      setModelFields(modelFieldsData.fields);

      const modelAdminSettingsData = await getModelAdminSettings(
        params.appLabel,
        params.modelName
      );
      setModelAdminSettings(modelAdminSettingsData.model_admin_settings);

      // Setup page limit
      setPageLimit(modelAdminSettingsData.model_admin_settings.list_per_page);

      // Setup permissions
      const permissionsData = await getUserPermissions(
        appState.user?.uid as string
      );
      setUserPermissions(permissionsData.permissions);

      // Get paginated data
      const listviewResponse = await getListviewData();
      setListviewData(listviewResponse);

      setIsDataReady(true);
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState("toastState", "type", "danger");
        setAppState("toastState", "isShowing", true);
        setAppState("toastState", "message", err.message ?? handler.message);
      }
    }
  });

  createEffect(() => {
    if (params.appLabel && params.modelName) {
      resetFilters();
    }
  });

  createEffect(async () => {
    pageLimit();
    pageOffset();

    // Get paginated data
    const listviewResponse = await getListviewData();
    setListviewData(listviewResponse);
  });

  const getTableEvent = (
    tableEvent: TableEventType,
    metadata: TableMetatdataType
  ) => {
    let rowsSelectedCopy = [...rowsSelected()];

    if (tableEvent === "rowSelectAll") {
      if (metadata.rowsSelected && metadata.rowsSelected[0].isChecked) {
        rowsSelectedCopy = metadata.rowsSelected.map((row) => {
          return row.id;
        });
      } else {
        rowsSelectedCopy = [];
      }
    }

    if (tableEvent === "rowSelect") {
      rowsSelectedCopy = [...rowsSelected()];
      const rowSelected = metadata.rowSelected;

      let isExisting = false;
      let indexToRemove = -1;
      rowsSelectedCopy.forEach((rowId, i) => {
        // if the row selected is currently on the list but is unchecked, remove it
        if (rowSelected?.id === rowId && !rowSelected.isChecked) {
          isExisting = true;
          indexToRemove = i;
        }
      });

      if (!isExisting) {
        rowsSelectedCopy.push(rowSelected?.id as string);
      } else {
        if (indexToRemove > -1) {
          rowsSelectedCopy.splice(indexToRemove, 1);
        }
      }
    }

    setRowsSelected(rowsSelectedCopy);
  };

  const onSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const customActions = () => {
    const actions = modelAdminSettings().custom_actions.map((action) => {
      return {
        selected: false,
        value: action.func,
        label: action.label,
      };
    });
    return [
      { selected: true, value: NO_ACTION, label: "----------" },
      ...actions,
    ];
  };

  const onSelectAction = (action: string) => {
    setCurrentAction(action);
  };

  const onConfirmedAction = async () => {
    try {
      const response = await applyCustomAction(
        params.appLabel,
        params.modelName,
        currentAction(),
        { payload: rowsSelected() }
      );

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "type", "success");
      setAppState("toastState", "message", response.message);

      resetState();
    } catch (err: any) {
      const handler = handleFetchError(err);
      if (handler.shouldNavigate) {
        navigate(nonAuthRoute.loginView);
      } else {
        setAppState("toastState", "type", "danger");
        setAppState("toastState", "isShowing", true);
        setAppState("toastState", "message", err.message ?? handler.message);
      }
    }
  };

  const onModalEvent = async (modalEvent: string) => {
    setIsModalOpen(false);
    if (modalEventPromise) {
      modalEventPromise(modalEvent); // Resolve the promise with the modal event
    }
  };

  const onAction = async () => {
    if (rowsSelected().length === 0) {
      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "type", "warning");
      setAppState("toastState", "message", "A row must be selected");
      return;
    }

    if (currentAction() !== NO_ACTION) {
      setIsModalOpen(true);

      // Return a promise that resolves based on user action
      await new Promise((resolve) => {
        modalEventPromise = resolve; // Store the resolve function
      }).then((event) => {
        if (event === "confirm") {
          onConfirmedAction(); // Proceed only if confirmed
        }
      });
    } else {
      onConfirmedAction();
    }
  };

  const updateCheckbox = (id: string, checkState: boolean) => {
    const checkboxEl = document.getElementById(id) as HTMLInputElement;
    checkboxEl.checked = checkState;
  };

  const onFilterBy = (
    field: string,
    value: string | number | null,
    isChecked: boolean,
    checkboxId: string,
    isAll: boolean
  ) => {
    let newFilterState: FilterStateType = {
      ...(filterState() as FilterStateType),
    };

    // Check if checkbox selected is All
    if (isAll) {
      newFilterState.checkboxes?.forEach((checkbox, i) => {
        // Find the field first which will have the group of filter values
        // Then check all the ones in the group if All is checked
        if (checkbox.field === field && isChecked) {
          newFilterState.pageFilters[field] = [];
          checkbox.values.forEach((checkboxValue, j) => {
            newFilterState.checkboxes[i].values[j].checked = true;
            updateCheckbox(`${checkbox.field}-${checkboxValue.value}`, true);
          });
        }

        // If All is unchecked
        if (checkbox.field === field && !isChecked) {
          checkbox.values.forEach((checkboxValue, j) => {
            newFilterState.checkboxes[i].values[j].checked = false;
            updateCheckbox(`${checkbox.field}-${checkboxValue.value}`, false);
          });
        }
      });
      // When anything but All is the checkbox
    } else {
      newFilterState.checkboxes?.forEach((checkbox, i) => {
        // If checked, just update the one checked
        if (checkbox.field === field && isChecked) {
          checkbox.values.forEach((checkboxValue, j) => {
            if (checkboxValue.checkboxId === checkboxId) {
              newFilterState.checkboxes[i].values[j].checked = true;
              updateCheckbox(`${checkbox.field}-${checkboxValue.value}`, true);
            }
          });
        }

        // If unchecked, make sure All checkbox is unchecked
        if (checkbox.field === field && !isChecked) {
          checkbox.values.forEach((checkboxValue, j) => {
            if (
              checkboxValue.checkboxId === checkboxId ||
              checkboxValue.label === "All"
            ) {
              newFilterState.checkboxes[i].values[j].checked = false;
              updateCheckbox(`${checkbox.field}-${checkboxValue.value}`, false);
            }
          });
        }
      });
    }

    // Set the page filters
    let newPageFilters: { [key: string]: any[] } = {};
    newFilterState.checkboxes.forEach((checkbox) => {
      checkbox.values.forEach((checkboxValue) => {
        if (checkboxValue.label !== "All" && checkboxValue.checked) {
          if (!newPageFilters[checkbox.field]) {
            newPageFilters[checkbox.field] = [];
          }
          newPageFilters[checkbox.field].push(checkboxValue.value);
        }
      });
    });

    newFilterState.pageFilters = newPageFilters;
    setFilterState(newFilterState);
  };

  return (
    <Show when={isDataReady()}>
      <Show
        when={
          hasViewModelPermission(
            userPermissions() as UserPermissionsType,
            params.appLabel,
            params.modelName
          )
        }
      >
        <div class="flex justify-between p-1 items-center mb-2">
          <h1 class="text-xl dark:text-white">
            Select {modelAdminSettings().model_name} to change
          </h1>
          <Show
            when={hasAddModelPermission(
              userPermissions() as UserPermissionsType,
              params.appLabel,
              params.modelName
            )}
          >
            <button
              class="button"
              onClick={() =>
                navigate(
                  `/dashboard/${params.appLabel}/${params.modelName}/add`
                )
              }
            >
              Add {modelAdminSettings().model_name}
            </button>
          </Show>
        </div>

        {/** Search */}
        <Show when={modelAdminSettings().search_fields.length > 0}>
          <div class="p-2 border border-slate-300 rounded-md mb-2">
            <SearchInput
              onSearchClick={(searchTerm) => onSearch(searchTerm)}
              onClearSearch={(searchTerm) => onSearch(searchTerm)}
              inputProps={{
                id: "table-search",
                placeholder: "Search here...",
                required: true,
                value: searchTerm(),
              }}
            />
            <p class="dark:text-white text-xs my-2">
              {modelAdminSettings().search_help_text}
            </p>
          </div>
        </Show>

        {/** Actions */}
        <Show
          when={hasChangeModelPermission(
            userPermissions() as UserPermissionsType,
            params.appLabel,
            params.modelName
          )}
        >
          <div class="p-2 border border-slate-300 rounded-md mb-2">
            <span class="dark:text-white text-sm">Actions</span>
            <div class="flex items-center gap-2 w-1/2">
              <div class="w-4/5">
                <SelectField
                  selectProps={{ id: "search-table" }}
                  options={customActions()}
                  onChangeValue={(value, fieldName) => onSelectAction(value)}
                />
              </div>
              <div class="w-1/5 pr-2">
                <button type="button" class="button mt-2" onClick={onAction}>
                  Go
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/** Filters */}
        <Show when={modelAdminSettings().list_filter.length > 0}>
          <div class="p-2 border border-slate-300 rounded-md mb-2 flex-col">
            <div class="mb-2 flex justify-between">
              <span class="dark:text-white text-sm">Filters</span>
              <Show when={isFilterOpen()}>
                <span
                  onClick={() => setIsFilterOpen(false)}
                  class="cursor-pointer"
                >
                  <AngleUp width={5} height={5} />
                </span>
              </Show>
              <Show when={!isFilterOpen()}>
                <span
                  onClick={() => setIsFilterOpen(true)}
                  class="cursor-pointer"
                >
                  <AngleDown width={5} height={5} />
                </span>
              </Show>
            </div>
            <Show when={filterState()}>
              <div
                classList={{
                  hidden: !isFilterOpen(),
                  visible: isFilterOpen(),
                }}
              >
                <For each={filterState()?.checkboxes}>
                  {(filterField, i) => (
                    <>
                      <hr class="mb-3" />
                      <h4 class="font-semibold dark:text-white text-sm mb-2">
                        By {filterField.field.toUpperCase()}
                      </h4>
                      <div class="flex flex-wrap gap-5 mb-2">
                        <For each={filterField.values}>
                          {(filterValue, j) => (
                            <div>
                              <CheckboxField
                                inputProps={{
                                  id: `${filterValue.checkboxId}`,
                                }}
                                checked={filterValue.checked}
                                onChangeValue={(isChecked, fieldName) => {
                                  onFilterBy(
                                    filterField.field,
                                    filterValue.value,
                                    isChecked,
                                    filterValue.checkboxId,
                                    filterValue.label === "All"
                                  );
                                }}
                              />
                              <span class="ml-2 dark:text-white text-sm">
                                {filterValue.label}
                              </span>
                            </div>
                          )}
                        </For>
                      </div>
                    </>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>

        {/** Table */}
        <div class="p-2 border border-slate-300 rounded-md mb-2">
          <div class="flex-col mb-2">
            <div class="flex justify-between">
              <h3 class="text-lg dark:text-white">
                {modelAdminSettings().model_name}
              </h3>
              <Show when={isParentTableOpen()}>
                <span
                  class="cursor-pointer"
                  onClick={() => setIsParentTableOpen(false)}
                >
                  <AngleUp width={5} height={5} />
                </span>
              </Show>
              <Show when={!isParentTableOpen()}>
                <span
                  class="cursor-pointer"
                  onClick={() => setIsParentTableOpen(true)}
                >
                  <AngleDown width={5} height={5} />
                </span>
              </Show>
            </div>
            <div class="flex items-center justify-center">
              <span class="dark:text-white text-sm">
                Page {currentPage()}: Total of {listviewData()?.count} records
              </span>
            </div>
          </div>
          <div
            classList={{
              "hidden": !isParentTableOpen(),
              "visible": isParentTableOpen()
            }}
          >
            <Show when={(listviewData()?.count as number) === 0}>
              <div>
                <h3 class="dark:text-white text-lg flex items-center justify-center">
                  No records
                </h3>
              </div>
            </Show>
            <Show when={(listviewData()?.count as number) > 0}>
              <ListModelViewTable
                appLabel={params.appLabel}
                modelName={params.modelName}
                ordering={modelAdminSettings().ordering}
                listdisplayFields={modelAdminSettings().list_display}
                listdisplayLinks={modelAdminSettings().list_display_links}
                customChangeLink={modelAdminSettings().custom_change_link}
                listviewData={listviewData() as ListviewDataType}
                modelFields={modelFields() as ModelFieldsObjType}
                onTableEvent={(tableEvent, metadata) =>
                  getTableEvent(tableEvent, metadata)
                }
              />
            </Show>
          </div>
        </div>

        {/** Table Pagination */}
        <div 
          class="p-2 border border-slate-300 rounded-md mb-10"
          classList={{
            "hidden": !isParentTableOpen(),
            "visible": isParentTableOpen()
          }}
        >
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
                    lastPage = (listviewData()?.count as number) / pageLimit();
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

        {/** Custom Inlines */}
        <For each={modelAdminSettings().custom_inlines}>
          {(inline, _) => (
            <div class="p-2 border border-slate-300 rounded-md mb-10">
              <InlineTable
                parentAppLabel={params.appLabel}
                parentModelName={params.modelName}
                inline={inline}
                resetParentTable={resetState}
                userPermissions={userPermissions() as UserPermissionsType}
              />
            </div>
          )}
        </For>

        <For each={modelAdminSettings().extra_inlines}>
          {(inline, i) => (
            <div class="p-2 border border-slate-300 rounded-md mb-2">
              <DynamicExtraInline componentName={inline} />
            </div>
          )}
        </For>
      </Show>

      {/** No Permissions */}
      <Show
        when={
          !hasViewModelPermission(
            userPermissions() as UserPermissionsType,
            params.appLabel,
            params.modelName
          )
        }
      >
        <h1 class="dark:text-white text-lg">
          You have no permissions to view this page
        </h1>
      </Show>

      {/** Modal */}
      <Show when={isModalOpen()}>
        <Modal
          modalEvent={(modalEvent) => {
            onModalEvent(modalEvent);
          }}
          modalBody={<ActionModalMessage action={currentAction()} />}
        />
      </Show>
    </Show>
  );
};

export default ListModelViewPage;
