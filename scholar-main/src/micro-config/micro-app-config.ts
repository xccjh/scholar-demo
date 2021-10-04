import { shared } from '@/common/services'
import { Json } from '@/common/base'

const packageConfig = require('../../../package.json')

const config: {
  name: string;
  entry: string;
  container: string | HTMLElement;
  activeRule: string;
  props: Json
}[] =
  []
packageConfig.microAppSetting[process.env.VUE_APP_environment].forEach(item => {
  const param = {
    name: item.name,
    entry: `${item.host}${':' + item.port + item.base}`,
    container: item.container,
    activeRule: item.activeRule,
    props: { ...item.props, shared }
  }
  config.push(param)
})
console.log('微前端位置数据： ====》')
console.log(config)
export default config
