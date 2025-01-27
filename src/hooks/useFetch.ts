import useStorageEvent from "./useStorageEvent";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface DefaultConfig {
  method: HttpMethod;
  mode: string;
  headers: Headers;
  credentials: "omit" | "same-origin" | "include";
  body?: any;
}

interface AddtlConfig {
  cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
  redirect?: "follow" | "error" | "manual";
  referrer?: string;
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "same-origin" | "origin" | 
    "strict-origin" | "origin-when-cross-origin" | "strict-origin-when-cross-origin" | 
    "unsafe-url";
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal;
  priority?: "high" | "low" | "auto";
}

interface NoSessionArgs {
  method: HttpMethod;
  urlSegment: string;
  body?: any;
  useFormDataHeaders?: boolean;
  headers?: any;
  addtlConfig?: any;
}

interface SessionArgs extends NoSessionArgs {
  tokenOverride?: string;
  interceptorFn?: (response: any, addtlArgs: any, apiRoot: string) => any;
}

/**
 * This is used for making requests while authenticated
 * USAGE: sessionClient({ method: 'GET', urlSegment: '/auth/...' })
 * The consumer of this client does not need to pass the access token anymore since it is
 * already retrieved by default. It can be overridden though
 * Required args: [method, urlSegment]
 * Optional args:
 * 1. body - pass an object, no need to stringify since the client will stringify it already.
 *           e.g. {emailAddress: 'sample@mail.com'}. Default is null
 * 2. headers - pass additional headers not included in the default ['Content-Type', 'Authorization']
 * 3. addtlConfig - pass an object to add more to request config not included.
 *                  default are: [method, mode, headers, credentials, body]
 * 4. interceptFn - pass a function that takes the response and config from previous request.
 *                  do your logic in your interceptFn. your function should return a new response
 * 5. tokenOverride - pass a different token to be used in authorization headers aside from the
 *                    default access token
 */
export const sessionClient = {
  fetch: async (args: SessionArgs, domain: string = __API_DOMAIN__): Promise<any> => {
    const { LOCAL_STORAGE_KEYS } = useStorageEvent();
    let token = localStorage.getItem(LOCAL_STORAGE_KEYS.token);

    if (args.tokenOverride) {
      token = args.tokenOverride;
    }

    let defaultHeaders: any = {
      Authorization: `Bearer ${token}`,
    };

    // If it does not use FormData, use application/json, else let DRF take care of the Content-Type
    if (!args.useFormDataHeaders) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    if (!args.headers) {
      args.headers = {};
    }

    let newBody = null;
    if (args.body) {
      if(!args.useFormDataHeaders) {
        newBody = JSON.stringify({ ...args.body });
      } else {
        newBody = args.body;
      }
    }

    let defaultConfig = {
      method: args.method,
      mode: "cors",
      headers: { ...defaultHeaders, ...args.headers },
      credentials: "include",
      body: newBody,
    };

    if (!args.addtlConfig) {
      args.addtlConfig = {};
    }

    const response = await fetch(`${domain}${args.urlSegment}`, {
      ...defaultConfig,
      ...args.addtlConfig,
    });

    if (args.interceptorFn) {
      return args.interceptorFn(response, args, domain);
    }

    const data = await response.json();

    // force logout if request is unauthorized
    // if (response.status === 401) {
    //   localStorage.removeItem(LOCAL_STORAGE_KEYS.token);
    //   window.location.href = `/login?redirect=${encodeURI(location.pathname)}`;
    // }

    if (response.status >= 400) {
      const status = response.status;
      if (response.status === 401) {
        localStorage.clear();
      }

      return Promise.reject({
        ...data,
        status,
      });
    }

    return data;
  },
};

/**
 * This is used for making requests with no authentication needed
 * USAGE: noSessionClient({ method: 'GET', urlSegment: '/path/...' })
 * Required args: [method, urlSegment]
 * Optional args:
 * 1. body - pass an object, no need to stringify since the client will stringify it already.
 *           e.g. {emailAddress: 'sample@mail.com'}. Default is null
 * 2. headers - pass additional headers not included in the default ['Content-Type', 'Authorization']
 * 3. addtlConfig - pass an object to add more to request config not included.
 *                  default are: [method, mode, headers, credentials, body]
 */
export const noSessionClient = {
  fetch: async (
    args : NoSessionArgs, 
    domain : string = __API_DOMAIN__,
  ): Promise<any> => {
    let defaultHeaders = {
      "Content-Type": "application/json"
    };

    if (!args.headers) {
      args.headers = {};
    }

    let newBody = null;
    if (args.body) {
      if(!args.useFormDataHeaders) {
        newBody = JSON.stringify({ ...args.body });
      } else {
        newBody = args.body;
      }
    }

    let defaultConfig : any = {
      method: args.method,
      mode: "cors",
      body: newBody,
      headers: { ...defaultHeaders, ...args.headers },
    };

    if (!args.addtlConfig) {
      args.addtlConfig = {};
    }

    const requestInit = {
      ...defaultConfig,
      ...args.addtlConfig
    };

    const response = await fetch(`${domain}${args.urlSegment}`, {
      ...defaultConfig,
      ...args.addtlConfig,
    });

    const data = await response.json();

    if (response.status >= 400) {
      const status = response.status;

      return Promise.reject({
        ...data,
        status,
      });
    }

    return data;
  },
};
