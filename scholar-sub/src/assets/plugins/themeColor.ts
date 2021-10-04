import client from 'webpack-theme-color-replacer/client'
import { generate } from '@ant-design/colors/lib'
const { microAppSetting } = require('../../../../package.json')
const currentSetting = microAppSetting[process.env.VUE_APP_environment][0]
const appMainBase = currentSetting.activeRule.split('/#/')[0]
const publicPath = currentSetting.host + ':' + currentSetting.port + appMainBase
export default {
  getAntdSerials (color) {
    // 淡化（即less的tint）
    const lightens = new Array(9).fill(0).map((t, i) => {
      return client.varyColor.lighten(color, i / 10)
    })
    // colorPalette变换得到颜色值
    const colorPalettes = generate(color)
    const rgb = client.varyColor.toNum3(color.replace('#', '')).join(',')
    return lightens.concat(colorPalettes).concat(rgb)
  },
  changeColor (newColor) {
    const options = {
      newColors: this.getAntdSerials(newColor), // new colors array, one-to-one corresponde with `matchColors`
      changeUrl (cssUrl) {
        return `${publicPath}/${cssUrl}` // while router is not `hash` mode, it needs absolute path
      }
    }
    return client.changer.changeColor(options, Promise)
  }
}
