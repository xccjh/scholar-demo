import { PacketInfoListDataType } from '../entity'
import { BURRON_PACKETAGE } from '@/common/constants'

export function useDynamicButton (methods) {
  const getButtonTitle = (button:{
    method: string,
    title: string | string[],
    show: string
  }, data:PacketInfoListDataType) => {
    if (typeof button.title !== 'string') {
      return data[button.title[0]] === '1' ? '取消' + button.title[1] : button.title[1]
    } else {
      return button.title
    }
  }

  const initButton = (data:PacketInfoListDataType) => {
    if (data) {
      if (!data.upButtonArr) {
        const buttonArr = JSON.parse(JSON.stringify(BURRON_PACKETAGE))
        buttonArr.forEach(item => {
          if (typeof item.show === 'string') {
            item.show = methods[item.show](data)
          }
        })
        data.upButtonArr = buttonArr.filter(item => item.show).slice(0, 3)
        data.dropButtonArr = buttonArr.filter(item => item.show).slice(3, BURRON_PACKETAGE.length)
      }
    }
    return true
  }

  const methodChange = (data:PacketInfoListDataType, i:number, key:'upButtonArr' | 'dropButtonArr') => {
    methods[data[key][i].method](data)
  }

  return {
    getButtonTitle,
    initButton,
    methodChange
  }
}
