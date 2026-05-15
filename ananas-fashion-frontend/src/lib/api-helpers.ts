import axios from 'axios'

type ErrorMap = Record<string, string[]>

export type ApiErrorInfo = {
  message: string
  errors: ErrorMap | null
  status: number | null
}

const FALLBACK_ERROR_MESSAGE = 'Request failed. Please try again.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function extractResponseData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

export function getApiErrorInfo(error: unknown): ApiErrorInfo {
  if (!axios.isAxiosError(error)) {
    return {
      message: FALLBACK_ERROR_MESSAGE,
      errors: null,
      status: null,
    }
  }

  const responsePayload = error.response?.data
  const message =
    (isRecord(responsePayload) && typeof responsePayload.message === 'string' && responsePayload.message) ||
    error.message ||
    FALLBACK_ERROR_MESSAGE

  const errors =
    isRecord(responsePayload) && isRecord(responsePayload.errors)
      ? (responsePayload.errors as ErrorMap)
      : null

  return {
    message,
    errors,
    status: error.response?.status ?? null,
  }
}

export function formatFieldError(errors: ErrorMap | null, field: string) {
  if (!errors || !errors[field] || errors[field].length === 0) {
    return null
  }

  return errors[field][0]
}
