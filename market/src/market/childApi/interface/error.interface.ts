export type ChildError = Readonly<{
  statusCode?: number
  error?: string
  message?: string
  detail?: any
  ticker?: string
  iso_code?: string
}>;