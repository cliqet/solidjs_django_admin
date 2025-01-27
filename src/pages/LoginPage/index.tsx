import { loginUser } from "src/services/users";
import { createEffect, createSignal, Show, onMount } from "solid-js";
import FieldErrorMessage from "src/components/form_fields/FieldErrorMessage";
import useStorageEvent from "src/hooks/useStorageEvent";
import { useNavigate, useLocation } from "@solidjs/router";
import { useAppContext } from "src/context/sessionContext";
import { Turnstile, TurnstileRef } from "src/components/Turnstile";
import { verifyCloudflareToken } from "src/services/django-admin";
import { authRoute, dashboardRoute } from "src/hooks/useAdminRoute";
import { User } from "src/models/user";
import { jwtDecode } from "jwt-decode";


const LoginPage = () => {
  const { appState, setAppState } = useAppContext();
  const location = useLocation();
  const [turnstileToken, setTurnstileToken] = createSignal("");
  const [isButtonHidden, setIsButtonHidden] = createSignal(false);
  const [formState, setFormState] = createSignal({
    email: {
      value: "",
      hasError: false,
    },
    password: {
      value: "",
      hasError: false,
    },
  });
  const { LOCAL_STORAGE_KEYS } = useStorageEvent();
  const navigate = useNavigate();
  let emailRef: HTMLInputElement;
  let passwordRef: HTMLInputElement;
  let turnstileRef: TurnstileRef | undefined;

  onMount(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.token);
    if (token) {
      try {
        const tokenPayload: User = jwtDecode(token);
        setAppState('user', {...tokenPayload});
      } catch (err: any) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.token);
      }
    }

    if (appState.user) {
      navigate(dashboardRoute(authRoute.dashboardHomeView));
      return;
    }
  })

  const onInvalidEmail = (e: Event) => {
    e.preventDefault();
    setFormState({
      ...formState(),
      email: {
        ...formState().email,
        hasError: true,
      },
    });
  };

  const onInvalidPassword = (e: Event) => {
    e.preventDefault();
    setFormState({
      ...formState(),
      password: {
        ...formState().password,
        hasError: true,
      },
    });
  };

  const resetFields = () => {
    emailRef.value = "";
    passwordRef.value = "";
    formState().email.value = "";
    formState().email.hasError = false;
    formState().password.value = "";
    formState().password.hasError = false;
  };

  createEffect(() => {
    if (!appState.user) {
      turnstileRef?.reset();
    }
  });

  const onLogin = async (e: Event) => {
    e.preventDefault();
    let isValid = true;

    // Validate fields
    if (formState().email.value === "") {
      setFormState({
        ...formState(),
        email: {
          ...formState().email,
          hasError: true,
        },
      });
      isValid = false;
    }

    if (formState().password.value === "") {
      setFormState({
        ...formState(),
        password: {
          ...formState().password,
          hasError: true,
        },
      });
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {

      const verifyResponse = await verifyCloudflareToken(turnstileToken());
      if (!verifyResponse.isValid) {
        setAppState("toastState", {
          ...appState.toastState,
          isShowing: true,
          message: "Invalid token. Please refresh the page",
          type: "danger",
        });
        setIsButtonHidden(true);
        return;
      }

      const response = await loginUser(
        formState().email.value,
        formState().password.value
      );

      localStorage.setItem(LOCAL_STORAGE_KEYS.token, response.access);

      // redirect user to last accessed protected route or straight to dashboard if no redirect
      const redirectPath =
        new URLSearchParams(location.search).get("redirect") || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err: any) {

      if (err.status === 400) {
        setAppState("toastState", {
          ...appState.toastState,
          isShowing: true,
          message: "Invalid token. Please refresh the page",
          type: "danger",
        });
        setIsButtonHidden(true);
      }

      if (err.status === 401) {
        setAppState("toastState", {
          ...appState.toastState,
          isShowing: true,
          message: "You have provided an incorrect email / password",
          type: "danger",
        });
      }
    } finally {
      resetFields();
    }
  };

  return (
    <div class="w-full bg-custom-dark">
      <form
        onSubmit={onLogin}
        class="w-1/4 mx-auto mt-20 p-4 rounded-md border bg-custom-dark"
      >
        <div class="mb-5">
          <label for="email" class="block mb-2 text-sm font-medium text-white">
            Your email
          </label>
          <input
            type="email"
            id="email"
            ref={emailRef!}
            value={formState().email.value}
            onInput={(e) =>
              setFormState({
                ...formState(),
                email: { ...formState().email, value: e.target.value },
              })
            }
            onInvalid={(e) => onInvalidEmail(e)}
            onFocus={() =>
              setFormState({
                ...formState(),
                email: { ...formState().email, hasError: false },
              })
            }
            classList={{
              "invalid-input": formState().email.hasError,
              "valid-input": !formState().email.hasError,
            }}
            placeholder="youremail@example.com"
            required
            autocomplete="new-email"
          />
          <Show when={formState().email.hasError}>
            <FieldErrorMessage message="Invalid email" />
          </Show>
        </div>

        <div class="mb-5">
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-white"
          >
            Your password
          </label>
          <input
            type="password"
            id="password"
            ref={passwordRef!}
            value={formState().password.value}
            onInput={(e) =>
              setFormState({
                ...formState(),
                password: { ...formState().password, value: e.target.value },
              })
            }
            onInvalid={(e) => onInvalidPassword(e)}
            onFocus={() =>
              setFormState({
                ...formState(),
                password: { ...formState().password, hasError: false },
              })
            }
            classList={{
              "invalid-input": formState().password.hasError,
              "valid-input": !formState().password.hasError,
            }}
            placeholder="********"
            required
            autocomplete="new-password"
          />
          <Show when={formState().password.hasError}>
            <FieldErrorMessage message="Invalid password" />
          </Show>
        </div>

        <Turnstile
          class="my-2"
          ref={turnstileRef}
          sitekey={__TURNSTILE_SITEKEY__}
          onVerify={(token) => {
            setTurnstileToken(token);
          }}
          onError={() => {
            setAppState("toastState", {
              ...appState.toastState,
              isShowing: true,
              message: "Verification token error. Please refresh the page",
              type: "danger",
            });
            setIsButtonHidden(true);
          }}
        />

        <Show when={!isButtonHidden()}>
          <button type="submit" class="button my-2">
            Submit
          </button>
        </Show>
      </form>
    </div>
  );
};

export default LoginPage;
