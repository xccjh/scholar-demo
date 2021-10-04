import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { Menu } from '@/common/base'
import { getPureLink } from '@/common/utils'
import { useRoute, useRouter } from 'vue-router'

export interface MenuState {
  selectedKeys: string[];
  openKeys: string[];
  defaultOpenKeys: string[];
  defaultSelectedKeys: string[];
  menus: Menu[]
}

export async function useMenus () {
  const state: MenuState = {
    menus: [],
    defaultOpenKeys: [],
    openKeys: [],
    selectedKeys: [],
    defaultSelectedKeys: []
  }
  const route = useRoute()
  const menuService = useRequiredInject(MenuServiceKey)
  const menus: Menu[] = state.menus = await menuService.loadMenus()
  if (menus && menus.length) {
    menus.every(menu => {
      if (menu.children && menu.children.length) {
        return menu.children.every(item => {
          if (item.link === route.fullPath.split('?')[0] && item.isVisible === '1') {
            state.openKeys = [menu.link || menu.text!]
            state.defaultOpenKeys = [menu.link || menu.text !]
            state.selectedKeys = [item.link || menu.text!]
            state.defaultSelectedKeys = [item.link || menu.text!]
          } else {
            return true
          }
        })
      } else {
        return true
      }
    })
  }
  return state
}
