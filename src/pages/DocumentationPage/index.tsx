import { useNavigate } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import AngleDown from "src/assets/icons/angle-down";
import AngleUp from "src/assets/icons/angle-up";
import { useAppContext } from "src/context/sessionContext";
import { nonAuthRoute } from "src/hooks/useAdminRoute";
import { handleFetchError } from "src/hooks/useModelAdmin";
import { getModelDocs } from "src/services/django-admin";

type ModelDocumentationType = {
  id: number;
  appModelName: string;
  content: string;
};

type AccordionDocType = {
  id: number;
  isOpen: boolean;
}

const DocumentationPage = () => {
  const navigate = useNavigate();
  const { appState, setAppState } = useAppContext();
  const [docs, setDocs] = createSignal<ModelDocumentationType[]>([]);
  const [accordionDocs, setAccordionDocs] = createSignal<AccordionDocType[]>([]);


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
        setAppState("toastState", handler.newToastState);
      }
    }
  });

  const onClickAccordion = (index: number) => {
    let accordions = [...accordionDocs()];
    accordions[index].isOpen = !accordions[index].isOpen;
    setAccordionDocs(accordions);
  }

  return (
    <div>
      <h1 class="text-lg text-white my-2">Documentation {docs().length}</h1>

      <Show when={accordionDocs().length > 0}>
        <div>
          <For each={docs()}>
            {(doc, i) => (
              <>
                <h2>
                  <button
                    type="button"
                    onClick={() => onClickAccordion(i())}
                    class="flex items-center justify-between w-full p-5 font-medium rtl:text-right border focus:ring-4 focus:ring-gray-800 border-slate-300 text-gray-400 hover:bg-gray-700 gap-3"
                  >
                    <span class="text-white">{doc.appModelName.toUpperCase()}</span>
                    <Show when={accordionDocs()[i()].isOpen}>
                      <AngleUp width={5} height={5} />
                    </Show>
                    <Show when={!accordionDocs()[i()].isOpen}>
                      <AngleDown width={5} height={5} />
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
                  <div class="p-5 text-white border border-slate-300 bg-custom-dark" innerHTML={doc.content}>
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
