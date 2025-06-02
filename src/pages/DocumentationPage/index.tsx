import { useNavigate } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import AngleDownIcon from "src/assets/icons/angle-down-icon";
import AngleUpIcon from "src/assets/icons/angle-up-icon";
import { useAppContext } from "src/context/sessionContext";
import { useAdminRoute } from "src/hooks/useAdminRoute";
import { useModelAdmin } from "src/hooks/useModelAdmin";
import { AccordionDocType, ModelDocumentationType } from "src/models/django-admin";
import { getModelDocs } from "src/services/django-admin";


const DocumentationPage = () => {
  const navigate = useNavigate();
  const { setAppState } = useAppContext();
  const [docs, setDocs] = createSignal<ModelDocumentationType[]>([]);
  const [accordionDocs, setAccordionDocs] = createSignal<AccordionDocType[]>([]);
  const { handleFetchError } = useModelAdmin();
  const { nonAuthRoute } = useAdminRoute();


  onMount(async () => {
    try {
      const docsData: { docs: ModelDocumentationType[] } = await getModelDocs();
      setDocs(docsData.docs);

      const accordions = docsData.docs.map(doc => {
        return { id: doc.id, isOpen: false };
      });
      setAccordionDocs(accordions);
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

  const onClickAccordion = (index: number) => {
    let accordions = [...accordionDocs()];
    accordions[index].isOpen = !accordions[index].isOpen;
    setAccordionDocs(accordions);
  }

  return (
    <div class="dark:bg-black">
      <h1 class="text-lg dark:text-white my-2">
        Documentation Records: {docs().length}
      </h1>

      <Show when={accordionDocs().length > 0}>
        <div>
          <For each={docs()}>
            {(doc, i) => (
              <>
                <h2>
                  <button
                    type="button"
                    onClick={() => onClickAccordion(i())}
                    class="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-400 gap-3"
                  >
                    <span class="text-orange-500 text-sm">{doc.appModelName.toUpperCase()}</span>
                    <Show when={accordionDocs()[i()].isOpen}>
                      <AngleUpIcon class="w-4 h-4 dark:text-white" />
                    </Show>
                    <Show when={!accordionDocs()[i()].isOpen}>
                      <AngleDownIcon class="w-4 h-4 dark:text-white" />
                    </Show>
                  </button>
                </h2>

                <div 
                  class="mb-3"
                  classList={{
                    "hidden": !accordionDocs()[i()].isOpen,
                    "visible": accordionDocs()[i()].isOpen
                  }}
                >
                  <div class="p-5 text-sm bg-slate-100 dark:text-white dark:bg-custom-dark" innerHTML={doc.content}>
                  </div>
                </div>
              </>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default DocumentationPage;
