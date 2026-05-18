import { SESSIONS_STORAGE_KEY, STATE_STORAGE_KEY } from "../logic/constants.ts";

localStorage.removeItem(STATE_STORAGE_KEY);
localStorage.removeItem(SESSIONS_STORAGE_KEY);
