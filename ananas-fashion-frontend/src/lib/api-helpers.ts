import axios from 'axios'

type ErrorMap = Record<string, string[]>

export type ApiErrorInfo = {
  message: string
  errors: ErrorMap | null
  status: number | null
}

const FALLBACK_ERROR_MESSAGE = 'Yêu cầu thất bại. Vui lòng thử lại.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function defaultMessageForStatus(status: number | null) {
  switch (status) {
    case 401:
      return 'Bạn cần đăng nhập để thực hiện thao tác này.'
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.'
    case 404:
      return 'Không tìm thấy dữ liệu.'
    case 422:
      return 'Dữ liệu không hợp lệ.'
    case 500:
      return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
    case 501:
      return 'Chức năng này chưa được hỗ trợ.'
    default:
      return FALLBACK_ERROR_MESSAGE
  }
}

function firstValidationMessage(errors: ErrorMap | null) {
  if (!errors) {
    return null
  }

  for (const key of Object.keys(errors)) {
    const values = errors[key]
    if (Array.isArray(values) && values.length > 0 && values[0]) {
      return values[0]
    }
  }

  return null
}

export function extractResponseData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T
  }

  return payload as T
}

export function parseApiError(error: unknown): ApiErrorInfo {
  if (!axios.isAxiosError(error)) {
    return {
      message: FALLBACK_ERROR_MESSAGE,
      errors: null,
      status: null,
    }
  }

  const responsePayload = error.response?.data
  const rawMessage =
    (isRecord(responsePayload) && typeof responsePayload.message === 'string' && responsePayload.message) ||
    error.message ||
    FALLBACK_ERROR_MESSAGE

  const errors =
    isRecord(responsePayload) && isRecord(responsePayload.errors)
      ? (responsePayload.errors as ErrorMap)
      : null

  const status = error.response?.status ?? null
  const firstError = firstValidationMessage(errors)

  const normalizedMessage =
    rawMessage === 'The given data was invalid.'
      ? firstError ?? defaultMessageForStatus(status)
      : rawMessage || firstError || defaultMessageForStatus(status)

  return {
    message: normalizedMessage,
    errors,
    status,
  }
}

export function getApiErrorInfo(error: unknown): ApiErrorInfo {
  return parseApiError(error)
}

export function formatFieldError(errors: ErrorMap | null, field: string) {
  if (!errors || !errors[field] || errors[field].length === 0) {
    return null
  }

  return errors[field][0]
}
