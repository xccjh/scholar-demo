<template>
  <a-layout id='components-layout-demo-custom-trigger'
            style="height: 100%;display:flex;">
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light" :trigger="null"
                    style="height: 100%;text-align: left">
      <div class='logo-container'>
        <div class="logo" :style='logo'/>
      </div>
      <a-menu theme="light"
              @select='menuClick'
              class='main-menu'
              v-model:selectedKeys="selectedKeys"
              mode="inline"
              :open-keys='openKeys'
              :selected-keys='selectedKeys'
              :default-open-keys="defaultOpenKeys"
              :default-selected-keys="defaultSelectedKeys"
      >
        <template v-for="item in menus">
          <template v-if="!item.children && item.isVisible ==='1'">
            <a-menu-item :key="item.link || item.text" :style='{paddingLeft:`${item.level*15}px`}' :title='item.text'>
              <menu-icon :icon='item.icon'></menu-icon>
              <span>{{ item.text }}</span>
            </a-menu-item>
          </template>
          <template v-else>
            <sub-menu :menu-info="item" :key="item.link || item.text"/>
          </template>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout
      class="layout-container">
      <a-layout-header
        class="layout-header">
        <menu-unfold-outlined
          v-if="collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)"/>
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent
             style='color: white;vertical-align:middle;float: right;padding-right:20px;'>
            <div
              style="
              height: 64px;
              display: flex;
              align-items: center">
              <a-avatar size="small"
                        style="width: 22px;
                        height: 22px;
                        margin-right:6px;
                        align-items: center;">
                <template #icon>
                  <UserOutlined/>
                </template>
              </a-avatar>
              {{userInfo.nickName}}
            </div>
          </a>
          <template #overlay>
            <a-menu @click='handleMenuClick'>
              <a-menu-item key="logout">
                <PoweroffOutlined/>
                退出登录
              </a-menu-item>
              <a-menu-item :key="item" v-for='item in platformPermission'>
                <LinkOutlined />
                {{ getPlatformName(item)}}
              </a-menu-item>
              <a-menu-item key="changepassword">
                <SettingOutlined/>
                修改密码
              </a-menu-item>
              <a-menu-divider/>
            </a-menu>
          </template>
        </a-dropdown>
      </a-layout-header>
      <a-tabs v-model:activeKey="tabIndex" hide-add type="editable-card" @edit="closeTab" class="main-tabs"
              @change='tabChange'>
          <a-tab-pane v-for="(pane ,i) of tabs" :key="pane.realLink || pane.text" :closable="true">
            <template #tab>
              <a-tooltip title='请选中标题再进行推拽' :mouseEnterDelay='3'>
                <li class='pane-text'
                    @contextmenu='contextMenu($event,i)'
                    @dragenter="dragenter($event, i)"
                    @dragover="dragover($event, i)"
                    @dragstart="dragstart(i)"
                    :key="pane.realLink || pane.text"
                    draggable
                >{{pane.text}}
                </li>
              </a-tooltip>
            </template>
          </a-tab-pane>
      </a-tabs>

      <div id="menu-tab" ref='rightMenu'>
        <div class='menu-item' @click='closeTabs()'>关闭所有</div>
        <div class='menu-item' @click='closeTabs("other")'>关闭其他</div>
        <div class='menu-item' @click='closeTabs("right")'>关闭右侧</div>
        <div class='menu-item' @click='closeTabs("left")'>关闭左侧</div>
      </div>
      <a-layout-content class='main-content' style="flex: 1">
        <router-view/>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
import AppMainIndex from './AppMainIndex'
export default AppMainIndex
</script>
<style lang='less' scoped>
@import './AppMainIndex';
</style>
