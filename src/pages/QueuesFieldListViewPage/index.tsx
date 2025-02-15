import SearchInput from "src/components/SearchInput";
import SelectField from "src/components/form_fields/SelectField";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import { deleteJobs, getFailedJobs, requeueJobs } from "src/services/django-admin";
import { UserPermissionsType } from "src/models/user";
import { getUserPermissions } from "src/services/users";
import { useAppContext } from "src/context/sessionContext";
import {
  formatDateString,
  handleFetchError,
  hasViewModelPermission,
} from "src/hooks/useModelAdmin";
import {
  authRoute,
  dashboardRoute,
  nonAuthRoute,
} from "src/hooks/useAdminRoute";
import { ListviewDataType } from "src/components/ListModelViewTable";
import Modal from "src/components/Modal";
import AngleDown from "src/assets/icons/angle-down";
import AngleUp from "src/assets/icons/angle-up";
import ActionModalMessage from "src/components/ActionModalMessage";

const BULK_ACTION = {
  NO_ACTION: '-',
  DELETE: 'delete',
  REQUEUE: 'requeue',
}

type QueueFieldListViewType = ListviewDataType & {
  table_fields: string[];
};

const QueuesFieldListViewPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { appState, setAppState } = useAppContext();
  const [listviewData, setListviewData] =
    createSignal<QueueFieldListViewType | null>(null);
  const [currentResults, setCurrentResults] = createSignal<any[]>([]);
  const [userPermissions, setUserPermissions] =
    createSignal<UserPermissionsType | null>(null);
  const [isDataReady, setIsDataReady] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");
  const [pageLimit, setPageLimit] = createSignal(20);
  const [pageOffset, setPageOffset] = createSignal(0);
  const [currentPage, setCurrentPage] = createSignal(1);

  // - means no action selected
  const [currentAction, setCurrentAction] = createSignal(BULK_ACTION.NO_ACTION);
  const [rowsSelected, setRowsSelected] = createSignal<string[]>([]);

  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isParentTableOpen, setIsParentTableOpen] = createSignal(true);
  let modalEventPromise: (event: string) => void;
  let checkboxAllRef!: HTMLInputElement;
  let checkboxRowRefs: HTMLInputElement[] = new Array(length).fill(null);

  const resetState = async () => {
    setRowsSelected([]);
    setCurrentAction("");
    setCurrentPage(1);
    setPageOffset(0);
    setSearchTerm("");

    const response = await getDynamicListData(params.queueName, params.field);
    setDynamicListData(params.queueName, params.field, response);
  };

  const getDynamicListData = async (queueName: string, field: string) => {
    if (field === "failed_jobs") {
      return getFailedJobs(queueName);
    }
  };

  const pageTitle = (queueName: string, field: string) => {
    if (field === "failed_jobs") {
      return "Failed Jobs";
    }
  };

  /**
   * 
   * In case we want to have the other fields as well later on. For now,
   * failed jobs is the important one
   */
  const setDynamicListData = (
    queueName: string,
    field: string,
    response: any
  ) => {
    if (field === "failed_jobs") {
      setListviewData(response.failed_jobs);
      setCurrentResults(response.failed_jobs.results);
    }
  };

  const renderTableData = (fieldName: string, value: any, id: string) => {
    if (!["id", "callable"].includes(fieldName)) {
      return <span>{formatDateString(value)}</span>;
    }

    if (fieldName === "id") {
      return (
        <A
          href={`${dashboardRoute(authRoute.queuesView)}/${params.queueName}/${
            params.field
          }/${id}`}
          class="underline"
        >
          {value}
        </A>
      );
    }

    return <span>{value}</span>;
  };

  onMount(async () => {
    try {
      setIsDataReady(false);

      const response = await getDynamicListData(params.queueName, params.field);
      setDynamicListData(params.queueName, params.field, response);

      // Setup permissions
      const permissionsData = await getUserPermissions(
        appState.user?.uid as string
      );
      setUserPermissions(permissionsData.permissions);
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

  const onSearch = (term: string) => {
    setSearchTerm(term);

    let currentListviewResults: any[] = [...(listviewData()?.results as any[])];

    if (searchTerm()) {
      currentListviewResults = currentResults().filter((item) => {
        return (
          item.id.toLowerCase().includes(searchTerm().toLowerCase()) ||
          item.callable.toLowerCase().includes(searchTerm().toLowerCase())
        );
      }) as any[];
    }

    setCurrentPage(1);
    setPageOffset(0);
    setCurrentResults(currentListviewResults);
  };

  const customActions = () => {
    return [
      { selected: true, value: BULK_ACTION.NO_ACTION, label: "----------" },
      { selected: false, value: BULK_ACTION.DELETE, label: "Delete" },
      { selected: false, value: BULK_ACTION.REQUEUE, label: "Requeue" },
    ];
  };

  const onSelectAction = (action: string) => {
    setCurrentAction(action);
  };

  const dynamicBulkAction = (action: string) => {
    if (action === BULK_ACTION.DELETE) {
      return deleteJobs(params.queueName, rowsSelected());
    }
    if (action === BULK_ACTION.REQUEUE) {
      return requeueJobs(params.queueName, rowsSelected());
    }
  }

  const onConfirmedAction = async () => {
    try {
      const response = await dynamicBulkAction(currentAction());

      setAppState("toastState", "isShowing", true);
      setAppState("toastState", "type", "success");
      setAppState("toastState", "message", response.message);
      setAppState("toastState", "isHtmlMessage", true);

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

    if (currentAction() !== BULK_ACTION.NO_ACTION) {
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

  const onRowCheckAll = () => {
    let checkboxRowsSelected: string[] = [];

    if (!checkboxAllRef.checked) {
      checkboxRowRefs.forEach((checkbox) => {
        checkbox.checked = false;
      });
    } else {
      checkboxRowRefs.forEach((checkbox) => {
        checkbox.checked = true;
        checkboxRowsSelected.push(checkbox.id);
      });
    }

    setRowsSelected([...checkboxRowsSelected]);
  };

  const onRowCheck = (e: Event) => {
    const checkbox = e.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    let checkboxRowsSelected: string[] = [...rowsSelected()];

    let isExisting = false;
    let indexToRemove = -1;
    checkboxRowsSelected.forEach((rowId, i) => {
      // if the row selected is currently on the list but is unchecked, remove it
      if (checkbox.id === rowId && !isChecked) {
        isExisting = true;
        indexToRemove = i;
      }
    });

    if (!isExisting && isChecked) {
      checkboxRowsSelected.push(checkbox.id);
    } 

    if (indexToRemove > -1 && !isChecked) {
      checkboxRowsSelected.splice(indexToRemove, 1);
    }

    setRowsSelected(checkboxRowsSelected);
  };

  return (
    <Show when={isDataReady()}>
      <Show
        when={hasViewModelPermission(
          userPermissions() as UserPermissionsType,
          "django_rq",
          "queue"
        )}
      >
        <div class="flex justify-between p-1 items-center mb-2">
          <h1 class="text-xl dark:text-white">
            {pageTitle(params.queueName, params.field)} in {params.queueName}{" "}
            queue
          </h1>
        </div>

        {/** Search */}
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
          <p class="dark:text-white text-xs my-2">Search by id, callable</p>
        </div>

        {/** Actions */}
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

        {/** Table */}
        <div class="p-2 border border-slate-300 rounded-md mb-2">
          <div class="flex-col mb-2">
            <div class="flex justify-between">
              <h3 class="text-lg dark:text-white">
                {pageTitle(params.queueName, params.field)}
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
                Page {currentPage()}: Total of {currentResults().length} records
              </span>
            </div>
          </div>
          <div
            classList={{
              hidden: !isParentTableOpen(),
              visible: isParentTableOpen(),
            }}
          >
            <Show when={currentResults().length === 0}>
              <div>
                <h3 class="dark:text-white text-lg flex items-center justify-center">
                  No records
                </h3>
              </div>
            </Show>

            <Show when={currentResults().length > 0}>
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
                      <For each={listviewData()?.table_fields}>
                        {(fieldName, fieldIndex) => (
                          <th scope="col" class="px-6 py-3">
                            {fieldName.toUpperCase()}
                          </th>
                        )}
                      </For>
                    </tr>
                  </thead>

                  <tbody>
                    <For
                      each={currentResults().slice(
                        pageOffset(),
                        pageOffset() + pageLimit()
                      )}
                    >
                      {(record, i) => (
                        <tr class="border-b dark:bg-gray-800 border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <td class="w-4 px-4 py-2">
                            <div class="flex items-center">
                              <input
                                id={record.id}
                                ref={checkboxRowRefs[i()]}
                                onClick={onRowCheck}
                                type="checkbox"
                                class="w-4 h-4 text-custom-primary rounded focus:ring-custom-primary-lighter focus:ring-2 dark:bg-gray-700 border-gray-600"
                              />
                              <label
                                for="checkbox-table-search-1"
                                class="sr-only"
                              >
                                checkbox
                              </label>
                            </div>
                          </td>
                          <For each={listviewData()?.table_fields}>
                            {(fieldName, fieldIndex) => (
                              <td class="px-6 py-2 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">
                                {renderTableData(
                                  fieldName,
                                  record[fieldName],
                                  record.id
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
            </Show>
          </div>
        </div>

        {/** Table Pagination */}
        <div
          class="p-2 border border-slate-300 rounded-md mb-2"
          classList={{
            hidden: !isParentTableOpen(),
            visible: isParentTableOpen(),
          }}
        >
          <div class="flex items-center justify-center">
            <Show when={currentPage() > 1}>
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
            <Show when={currentPage() > 1}>
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
            <Show when={currentResults().length > currentPage() * pageLimit()}>
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
            <Show when={currentResults().length > currentPage() * pageLimit()}>
              <button
                onClick={() => {
                  let lastPage;
                  const remainderRecords =
                    currentResults().length % pageLimit();
                  if (remainderRecords === 0) {
                    lastPage = currentResults().length / pageLimit();
                  } else {
                    lastPage =
                      Math.floor(currentResults().length / pageLimit()) + 1;
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
              Page {currentPage()}: Total of {currentResults().length} records
            </span>
          </div>
        </div>
      </Show>

      {/** No Permissions */}
      <Show
        when={
          !hasViewModelPermission(
            userPermissions() as UserPermissionsType,
            "django_rq",
            "queue"
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

export default QueuesFieldListViewPage;
