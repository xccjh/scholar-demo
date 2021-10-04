import { service, getHeader } from './requestInstant'

const get = (url: string, params = {}) => {
  return service.get(url, {
    params,
    headers: getHeader()
  })
}

const post = (url: string, params = {}) => {
  return service.post(url, null, { headers: getHeader(), params })
}

const postBody = (url: string, params = {}) => {
  return service.post(url, params, {
    headers: getHeader()
  })
}

const put = (url: string, params = {}) => {
  return service.put(url, null, {
    params,
    headers: getHeader()
  })
}

const patch = (url: string, params = {}) => {
  return service.patch(url, null, {
    params,
    headers: getHeader()
  })
}

export {
  get,
  post,
  postBody,
  put,
  patch
}
