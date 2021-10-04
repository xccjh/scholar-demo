import { post } from './http'

export const auth = {
  login (params) {
    return post('sys/user/login', params)
  }
}
