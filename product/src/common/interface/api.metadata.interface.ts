// type Api = {
//   prefix: string;
//   version: Version;
//   routes: Routes; //
// };

// type Version = {
//   prefix: string;
//   default: string;
// };

export type Router<T extends string = any> = {
  prefix: string;
  version?: string;
  routes: Routes<T>;
};

type Routes<T extends string = any> = Record<T, Route>;

type Route = {
  version?: string;
  path: string;
  // method, params, query, ...
};