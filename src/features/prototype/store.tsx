import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { initialState, transition, type Action, type State } from "./model";
import { parseState, readState, saveState, STORAGE_KEY, type StoragePort } from "./storage";
import { recordIncident } from "./diagnostics";

function browserStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function useStore() {
  const [loaded] = useState(() => readState(browserStorage()));
  const [state, setState] = useState(loaded.state);
  const [issue, setIssue] = useState(loaded.issue);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(loaded.blocked);
  const persisted = useRef({ raw: loaded.raw, blocked: loaded.blocked });
  const latest = useRef(state);

  function applyChange(change: (state: State) => State, replace: boolean) {
    const storage = browserStorage();
    const expected = persisted.current;
    let writable = navigator.locks ? storage : null;
    try {
      if (storage && storage.getItem(STORAGE_KEY) !== expected.raw) {
        setIssue(
          "Zapis zmienił się w innej karcie. Czynność wstrzymano. Jeśli masz zmiany zapisane tylko w tej karcie, najpierw wyeksportuj scenariusz, a potem odśwież stronę.",
        );
        return false;
      }
    } catch {
      writable = null;
    }

    const next = change(latest.current);
    latest.current = next;
    setState(next);
    setError("");
    if (expected.blocked && !replace && writable) return true;
    try {
      const raw = saveState(writable, next);
      persisted.current = { raw, blocked: false };
      setBlocked(false);
      setIssue("");
    } catch (error) {
      recordIncident("SCENARIO-SAVE");
      setIssue((error as Error).message);
    }
    return true;
  }

  async function commit(change: (state: State) => State, replace = false) {
    try {
      if (navigator.locks) {
        return await navigator.locks.request(STORAGE_KEY, () => applyChange(change, replace));
      }
      return applyChange(change, replace);
    } catch (error) {
      setError(
        error instanceof Error && error.name !== "ZodError"
          ? error.message
          : "Sprawdź poprawność i długość wprowadzonych danych.",
      );
      return false;
    }
  }

  function run(action: Action) {
    return commit((state) => transition(state, action));
  }

  function importState(raw: string) {
    return commit(() => parseState(raw), true);
  }
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  return {
    state,
    issue,
    error,
    blocked,
    original: loaded.original,
    run,
    importState,
    clearError: () => setError(""),
    reset: () => commit(() => initialState(), true),
  };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePrototype() {
  const store = useContext(Context);
  if (!store) throw new Error("PrototypeProvider is required");
  return store;
}
