import { at, castArray, merge, set, zip } from "lodash";
import { OneOrMany, hasOwn } from "sulcalc";
import { Store } from "vuex";

export interface PersistencePluginConfig<State extends object> {
  saveOn?: { [key: string]: OneOrMany<Extract<keyof State, string>> };
  prefix?: string;
  storage?: Storage;
  onLoad?(store: Store<State>): Promise<void>;
}

type Plugin<State extends object> = (store: Store<State>) => Promise<void>;

export function persistencePlugin<State extends object>({
  saveOn = {},
  prefix = "",
  storage = window.localStorage,
  onLoad
}: PersistencePluginConfig<State> = {}): Plugin<State> {
  function prefixKey(key: string): string {
    if (prefix !== "") {
      return `(${prefix}).${key}`;
    }
    return key;
  }

  return async (store: Store<State>) => {
    const water: Partial<State> = {};
    for (const paths of Object.values(saveOn)) {
      for (const path of castArray(paths)) {
        const storedValue = storage.getItem(prefixKey(path));
        if (storedValue) {
          const parsedValue = JSON.parse(storedValue);
          set(water, path, parsedValue);
        }
      }
    }
    store.replaceState(merge({}, store.state, water));

    if (onLoad) await onLoad(store);

    store.subscribe(({ type }, state) => {
      if (hasOwn(saveOn, type)) {
        const paths = castArray(saveOn[type]);
        for (const [path, value] of zip(paths, at(state, paths))) {
          if (path === undefined) continue;
          const stringifiedValue = JSON.stringify(value);
          try {
            storage.setItem(prefixKey(path), stringifiedValue);
          } catch {
            // this can sometimes throw based on the spec
          }
        }
      }
    });
  };
}
