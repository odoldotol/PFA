export type ApiUrl<T extends string | number | symbol> = {
  [k in T]: UrlMetadata;
};

type UrlMetadata = {
  path: string;
  // method, params, query, ...
};