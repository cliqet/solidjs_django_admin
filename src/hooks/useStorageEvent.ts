const LOCAL_STORAGE_KEYS = {
  token: "app.token",               // the access token
  out: "app.out",                   // stores status when user is forced logged out. value of 1 means yes
};


const useStorageEvent = () => {
  return { LOCAL_STORAGE_KEYS };
};

export default useStorageEvent;
