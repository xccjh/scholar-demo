import { defineComponent, reactive, ref, toRefs, onUnmounted, nextTick } from 'vue'
import { useRequiredInject } from '@/common/hooks'
import { Bus, MenuServiceKey } from '@/common/services'
import { Menu } from '@/common/base'
import { message } from 'ant-design-vue'
import { mapGetters, useStore } from 'vuex'
import {
  comparePath, getPlatformName,
  getPureLink, goPlatform, gotoReview,
  isUrlEqMenu,
  LocalStorageUtil,
  restoreMenus, SessionStorageUtil,
  storeMenus
} from '@/common/utils'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { MenuState, useMenus } from './hooks/useMenus'
import draggable from 'vuedraggable'
import { CommonApi } from '@/app/api'

export interface MenuTabsState extends MenuState {
  tabs: Menu[];
  tabIndex: string;
  currentTabIndex: string;
  collapsed: boolean;
}

export default defineComponent({
  name: 'app-main-index',
  components: {
    draggable
  },
  async setup () {
    onUnmounted(() => {
      Bus.$off('gotoUrl')
      Bus.$off('routerChange')
      Bus.$off('goBack')
      Bus.$off('menuChange')
    })
    const rightMenu = ref<HTMLDivElement | null>(null)
    const userInfo = LocalStorageUtil.getUser()
    const store = useStore()
    const router: Router = useRouter()
    const route: RouteLocationNormalizedLoaded = useRoute()
    const menuService = useRequiredInject(MenuServiceKey)
    let dragIndex = -1
    let enterIndex = -1
    const platformPermission = ref([])
    /**
     * 获取平添权限
     */
    CommonApi.getPlatformPermission().then(res => {
      if (res.data.status === 200) {
        platformPermission.value = res.data.data.filter(item => item !== 'platform-scholar')
      }
    })

    const { defaultOpenKeys, defaultSelectedKeys, selectedKeys, menus, openKeys } = await useMenus()
    const state = reactive<MenuTabsState>({
      tabIndex: '',
      currentTabIndex: '',
      tabs: restoreMenus(),
      collapsed: false,
      selectedKeys,
      openKeys,
      defaultOpenKeys,
      defaultSelectedKeys,
      menus
    })

    const dragstart = (index) => {
      dragIndex = index
    }
    const dragenter = (e, index) => {
      e.preventDefault()
      e.stopPropagation()
      if (dragIndex !== index) {
        if (enterIndex !== index) {
          const moving = state.tabs[dragIndex]
          state.tabs.splice(dragIndex, 1)
          state.tabs.splice(index, 0, moving)
          storeMenus(state.tabs)
          dragIndex = index
        } else {
          enterIndex = index
        }
      }
    }
    const dragover = (e, index) => {
      e.stopPropagation()
      e.preventDefault()
    }
    /**
     * @description 退出登录
     * */
    const loginOut = () => {
      LocalStorageUtil.removeTkToken()
      LocalStorageUtil.removeUser()
      SessionStorageUtil.clear()
      store.commit('resetState')
      menuService.clear()
      gotoReview('p/login')
    }
    /**
     * @description 菜单点击
     * */
    const handleMenuClick = (e) => {
      if (e.key === 'logout') {
        loginOut()
      } else if (e.key === 'changepassword') {
        Bus.$emit('gotoUrl', '/m/system/admin-security', '', '修改密码')
      } else {
        goPlatform(e.key)
      }
    }

    /**
     * @description 关闭当前tab
     * @param tabChange 是否自动高亮上一个tab,并联动左侧导航和跳转路由
     * */
    const goBack = (tabChange?) => {
      closeTab(state.tabIndex, 'remove', tabChange)
    }

    /**
     * @description 公共跳转菜单方法
     * @param link string 菜单数据pruelink
     * @param params string  路由参数
     * @param title string 顶部导航描述
     **/
    const gotoUrl = (link: string, params: string, title?: string) => {
      let index = -1
      for (let i = 0; i < state.tabs.length; i++) {
        const item = state.tabs[i]
        const pureLink = getPureLink(item.link!)
        if (pureLink !== '' && comparePath(pureLink, link)) {
          if (title) {
            item.text = title
          }
          index = i
          break
        }
      }
      if (index < 0) {
        menuService.getCurMenu(link).subscribe(
          (result) => {
            if (result.link) {
              const curMenu: Menu = Object.assign({}, result)
              if (title) {
                curMenu.text = title
                curMenu.realLink = link + params
              }
              addTab(curMenu)
              storeMenus(state.tabs)
              tabChange(state.tabIndex, link + params)
            } else {
              message.warning('该跳转路由无权限，请到总控台新增全权限！')
            }
          }
        )
      } else {
        state.tabIndex = state.tabs[index].realLink!
        tabChange(state.tabIndex, link + params)
      }
    }

    /**
     * @description 增加tab，设置tab选中(根据前一个选中的tab取下一个)
     * @param menu
     */
    const addTab = (menu: Menu) => {
      const seq = state.tabs.findIndex(tab => tab.realLink === state.tabIndex)
      const idx = seq === -1 ? 0 : seq + 1
      state.tabs.splice(idx, 0, {
        link: menu.link,
        text: menu.text,
        realLink: menu.realLink || menu.link
      })
      state.tabIndex = menu.realLink! || menu.link!
    }

    /**
     * @description 关闭顶部导航
     * @param targetKey 当前tab的key
     * @param action 动作类型
     * @param changeTab 是否进行切换高亮顶部、侧边tab+跳转路由
     */
    const closeTab = (targetKey: string, action = 'remove', changeTab = true): boolean => {
      state.selectedKeys = []
      let index = -1
      for (let i = 0; i < state.tabs.length; i++) {
        const item = state.tabs[i]
        if (item.realLink === targetKey) {
          index = i
          break
        }
      }
      if (index > -1) {
        const preKey = state.tabs[index - 1]?.realLink
        const afterKey = state.tabs[index + 1]?.realLink
        state.tabs.splice(index, 1)
        storeMenus(state.tabs)
        if (changeTab) {
          if (state.tabs.length > 0) {
            if (state.tabIndex === targetKey) {
              state.tabIndex = preKey! || afterKey!
              tabChange(state.tabIndex || afterKey!)
            }
          } else {
            state.tabIndex = ''
            router.push('/m/empty')
          }
        }
      }
      /**
       * 清除本tab持久化数据
       */
      const name = targetKey.split('/')
      SessionStorageUtil.clearSearch(name[name.length - 1].split('?')[0])
      SessionStorageUtil.clearSearchKey(name[name.length - 1].split('?')[0])
      return false
    }

    /**
     * @description 批量关闭顶部导航
     **/
    const closeTabs = (limit?) => {
      const tabs: Menu[] = []
      switch (limit) {
        case 'other' :
          if (state.tabs.length === 1) {
            return
          }
          // state.tabs.forEach((e, i) => {
          //   if (e.link !== state.currentTabIndex) {
          //     // this.delReuseRoute(e.realLink);
          //   }
          // });
          state.tabs = state.tabs.filter(item => item.realLink === state.currentTabIndex)
          if (state.tabIndex !== state.currentTabIndex) {
            router.push({
              path: state.currentTabIndex
            })
            state.tabIndex = state.currentTabIndex
            state.selectedKeys = [state.currentTabIndex]
          }
          break
        case 'left' :
          const tabIndexLeft = state.tabs.findIndex(tabL => tabL.realLink === state.currentTabIndex)
          if (tabIndexLeft === 0) {
            return
          }
          const tabIndexLi = state.tabs.findIndex(tabLi => tabLi.realLink === state.tabIndex)
          state.tabs.forEach((tabLeft, i) => {
            if (i < tabIndexLeft) {
              // this.delReuseRoute(e.realLink);
            } else {
              tabs.push(tabLeft)
            }
          })
          if (tabIndexLi < tabIndexLeft) {
            router.push({
              path: state.currentTabIndex
            })
            state.tabIndex = state.currentTabIndex
            state.selectedKeys = [state.currentTabIndex]
          }
          state.tabs = tabs
          break
        case 'right' :
          const tabIndexRight = state.tabs.findIndex(tabL => tabL.realLink === state.currentTabIndex)
          if (tabIndexRight === state.tabs.length - 1) {
            return
          }
          const tabIndexRi = state.tabs.findIndex(tabRi => tabRi.realLink === state.tabIndex)
          state.tabs.forEach((tabRight, i) => {
            if (i > tabIndexRight) {
              // this.delReuseRoute(e.realLink);
            } else {
              tabs.push(tabRight)
            }
          })
          if (tabIndexRi > tabIndexRight) {
            router.push({
              path: state.currentTabIndex
            })
            state.tabIndex = state.currentTabIndex
            state.selectedKeys = [state.currentTabIndex]
          }
          state.tabs = tabs
          break
        default :
          // state.tabs.forEach((e, i) => {
          //   this.delReuseRoute(e.link)
          // })
          state.tabs = []
      }
      storeMenus(state.tabs)
      if (rightMenu.value && rightMenu.value.style) {
        rightMenu.value.style.display = 'none'
      }
      if (!limit) {
        state.tabIndex = ''
        state.selectedKeys = []
        router.push({
          path: '/m/empty'
        })
      }
    }

    /**
     * @description 路由匹配缓存中的菜单,根据当前路由设置顶部和侧边导航高亮，跳转路由
     **/
    const setCurMenuLight = (path: string) => {
      let index = -1
      for (let i = 0; i < state.tabs.length; i++) {
        const item = state.tabs[i]
        const pureLink = getPureLink(item.link!)
        if (pureLink !== '' && comparePath(pureLink, path)) {
          index = i
          break
        }
      }
      if (index > -1) {
        state.tabIndex = state.tabs[index].realLink!
        tabChange(state.tabIndex, path)
      } else {
        state.tabIndex = ''
        state.selectedKeys = []
      }
    }

    /**
     * @description 左侧导航点击，跳转路由，高亮顶部导航
     * @param menu
     */
    const menuClick = (menu) => {
      let index = -1
      for (let i = 0; i < state.tabs.length; i++) {
        const item = state.tabs[i]
        if (item.link === menu.key) {
          index = i
          break
        }
      }
      if (index < 0) {
        addTab({
          link: menu.key,
          text: menu.item.title
        })
        storeMenus(state.tabs)
        tabChange(state.tabIndex)
      } else {
        state.tabIndex = state.tabs[index].realLink!
        router.push({
          path: state.tabIndex
        })
      }
    }

    /**
     * @description顶部导航点击，跳转路由，高亮左侧导航
     * @param key
     */
    const tabChange = (key: string, url?) => {
      const path = url || key
      if (path !== route.fullPath) {
        router.push(path)

        menuService.getCurMenu(path.split('?')[0]).subscribe(
          (result) => {
            if (result && result.isVisible === '1') {
              state.selectedKeys = [key]
            } else {
              state.selectedKeys = []
            }
          })
      }
    }

    /**
     * @description 顶部导航呼出右键菜单
     **/
    const contextMenu = (e: MouseEvent, index: number) => {
      state.currentTabIndex = state.tabs[index].realLink!
      const oX = e.clientX
      const oY = e.clientY
      if (rightMenu.value && rightMenu.value.style) {
        rightMenu.value.style.display = 'block'
        rightMenu.value.style.top = oY + 'px'
        rightMenu.value.style.left = oX + 'px'
      }
      const hideMenu = (event: Event) => {
        if (rightMenu.value && rightMenu.value.style) {
          rightMenu.value.style.display = 'none'
        }
        event.stopPropagation()
        event.preventDefault()
      }
      document.removeEventListener('click', hideMenu)
      document.addEventListener('click', hideMenu)
      e.stopPropagation()
      e.preventDefault()
    }

    /**
     * @description 初始化检查menu和路由匹配关系，isOpenTab为存在标识，存在自动添加顶部导航
     * */
    const initBaseOpenTab = (menuList: Menu[], link: string): boolean => {
      let isOpenTab = false
      if (menuList) {
        menuList.every(item => {
          if (!isOpenTab) {
            if (isUrlEqMenu(item.link!, link)) {
              item.realLink = route.fullPath
              addTab(item)
              isOpenTab = true
            } else if (item.children && item.children.length > 0) {
              if (initBaseOpenTab(item.children, link)) {
                isOpenTab = true
              }
            }
            return true
          }
        })
      }
      return isOpenTab
    }

    /**
     * @description 根据浏览器地址，初始化顶部导航和侧边导航，跳转路由
     * */
    const initMenuTab = () => {
      if (state.tabs.length === 0) {
        if (initBaseOpenTab(state.menus, route.path)) {
          state.tabIndex = state.tabs[0].realLink!
          tabChange(state.tabIndex)
        } else {
          // 跳转到无权访问页面
        }
      } else {
        setCurMenuLight(route.fullPath)
      }
    }

    initMenuTab()

    /**
     * 监听路由更改，同步顶部和侧边导航状态（用来解决直接点击返回不会触发同步）
     */
    Bus.$on('routerChange', () => {
      initMenuTab()
    })
    /**
     * 监听菜单服务返回
     */
    Bus.$on('goBack', (tabChange?) => {
      goBack(tabChange)
    })
    /**
     * 监听菜单跳转
     */
    Bus.$on('gotoUrl', (link: string, params: string, title?: string) => {
      gotoUrl(link, params, title)
    })

    return {
      logo: { backgroundImage: `url(${store.getters.logo ? store.getters.logo : require('@/assets/images/logo_hengqi.png')})` },
      ...toRefs(state),
      menuClick,
      tabChange,
      closeTab,
      closeTabs,
      contextMenu,
      rightMenu,
      handleMenuClick,
      userInfo,
      dragstart,
      dragover,
      dragenter,
      goPlatform,
      getPlatformName,
      platformPermission
    }
  }
})
