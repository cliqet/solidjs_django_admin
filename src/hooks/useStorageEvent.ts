export const useStorageEvent = () => {
  const LOCAL_STORAGE_KEYS = {
    token: "app.token",               // the access token
    colorTheme: "app.colorTheme",
  };

  return { LOCAL_STORAGE_KEYS };
};

