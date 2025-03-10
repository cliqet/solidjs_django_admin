import { JSX, onMount } from "solid-js";
import { useAppContext } from "src/context/sessionContext";

type RenderOpts = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  theme: any;
  size: any;
  retry: any;
}
type TurnstileFunc = {
  getResponse: any;
  implicitRender: any;
  ready: any;
  remove: any;
  render: (element: string | HTMLDivElement, options: RenderOpts) => string;
  reset: any;
}

export type TurnstileRef = {
  reset: () => void;
}

type Props = TurnstileCallbacks & {
  class?: string;
  style?: JSX.CSSProperties;
  sitekey: string;
  retry?: "auto" | "never";
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "invisible" | "compact";
  autoResetOnExpire?: boolean;
  reset?: any;
  ref?: TurnstileRef | ((v: TurnstileRef) => void);
}

type TurnstileCallbacks = {
  onVerify: (token: string) => void;
  onLoad?: (widgetId: string) => void;
  onError?: (error?: Error | any) => void;
  onExpire?: () => void;
  onTimeout?: () => void;
}

export const Turnstile = (props: Props) => {
  const { appState } = useAppContext();
  const turnstile = () => (window as any).turnstile as TurnstileFunc;
  let element: HTMLDivElement | undefined;

  onMount(() => {
    if (!appState.user) {
      if (document.getElementById("turnstileScript")) { 
          return ready();
      }
      
      const scriptEl = document.createElement("script");
      scriptEl.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      scriptEl.id = "turnstileScript";
      document.body.appendChild(scriptEl);

      (window as any).onloadTurnstileCallback = ready;
    }
  });

  const ready = () => {
    const id = turnstile().render(element!, {
      sitekey: props.sitekey,
      theme: props.theme,
      size: props.size,
      callback(token) {
        props.onVerify(token);
      },
      "error-callback": () => props.onError?.(),
      "expired-callback": () => {
        props.onExpire?.();
        if (props.autoResetOnExpire) turnstile().reset(id);
      },
      "timeout-callback": () => props.onTimeout?.(),
      retry: props.retry,
    });
    props.onLoad?.(id);

    (props?.ref as any)?.({
      reset: () => turnstile().reset(id),
    });
  };

  return <div class={props.class} style={props.style} ref={element}></div>;
}