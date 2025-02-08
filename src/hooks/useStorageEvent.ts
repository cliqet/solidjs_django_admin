const LOCAL_STORAGE_KEYS = {
  token: "app.token",               // the access token
  colorTheme: "app.colorTheme",
};


const useStorageEvent = () => {
  return { LOCAL_STORAGE_KEYS };
};

export default useStorageEvent;
