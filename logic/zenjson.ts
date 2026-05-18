// deno-lint-ignore-file no-explicit-any
import { createRestore, createSanitize, defaultTypes, type ICustomType } from "@dldc/zenjson";

type AnyMap = Map<any, any>;

const mapType: ICustomType<AnyMap, [any, any][]> = {
  name: "map",
  check: (v: any): v is AnyMap => v instanceof Map,
  sanitize: (map, { sanitize }) => [...map.entries().map(([key, value]) => [sanitize(key), sanitize(value)])],
  restore: (entries, { restore }) => new Map(entries.map(([key, value]) => [restore(key), restore(value)])),
};

export const sanitize = createSanitize([...defaultTypes, mapType]);
export const restore = createRestore([...defaultTypes, mapType]);
