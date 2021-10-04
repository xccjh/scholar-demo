import { service, getHeader } from './requestInstant'

const get = (url: string, params = {}, config = {}) => {
  return service.get(url, {
    params,
    headers: getHeader(),
    ...config
  })
}

const post = (url: string, params = {}, config = {}) => {
  return service.post(url, null,
    {
      headers: getHeader(),
      params,
      ...config
    })
}

const postBody = (url: string, params = {}, config = {}) => {
  return service.post(url, params, {
    headers: getHeader(),
    ...config
  })
}

const put = (url: string, params = {}, config = {}) => {
  return service.put(url, null, {
    params,
    headers: getHeader(),
    ...config
  })
}

const del = (url: string, params = {}, config = {}) => {
  return service.delete(url, {
    params,
    headers: getHeader(),
    ...config
  })
}

const patch = (url: string, params = {}, config = {}) => {
  return service.patch(url, null, {
    params,
    headers: getHeader(),
    ...config
  })
}

export {
  del,
  get,
  post,
  postBody,
  put,
  patch
}
