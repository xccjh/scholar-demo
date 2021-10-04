<template>
  <div class="container">
    <div class="wrap">
      <div class="top">
        <div class="head">
          <div class="head-logo">
            <div class="logo-content" :style="logoImage">
            </div>
          </div>
          <div class="head-title">
            <p style="margin: 15px 0 10px 0;">{{schoolName}}</p>
            <p style="margin-bottom: 25px;">教研工作台</p>
          </div>
        </div>
      </div>
      <div class='scholar-login'>
        <a-form
          ref="formRef"
          :model="formState"
          :wrapper-col="wrapperCol"
          :rules="rules"
          class='login-box'
        >
          <a-form-item ref="userName" name="userName" hasFeedback>
            <a-input v-model:value="formState.userName" placeholder="账号" size="large" @keyup.enter="onSubmit()">
              <template #prefix>
                <UserOutlined style="color: rgba(0, 0, 0, 0.25)"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item ref="password" name="password" hasFeedback>
            <a-input v-model:value="formState.password" type="password" placeholder="密码" size="large"
                     @keyup.enter="onSubmit()">
              <template #prefix>
                <LockOutlined style="color: rgba(0, 0, 0, 0.25)"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item ref="remember" name="remember">
            <a-checkbox-group v-model:value="formState.remember" size="large" style='float: left'>
              <a-checkbox value="1" name="remember">记住密码</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 24}">
            <a-button type="primary" @click="onSubmit()" block size="large" :loading="loading">登录</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRaw, ref, UnwrapRef } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { gotoReview, LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '../src/common/utils'
import { auth } from '../src/app/api'
import { message } from 'ant-design-vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { FormState, Menu, win } from '@/common/base'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'

const { mainBase, mainLayoutIndex } = require('../../package.json')

declare const window: win

export default defineComponent({
  name: 'login',
  setup () {
    const formRef = ref()
    const loading = ref(false)
    const menuService = useRequiredInject(MenuServiceKey)
    const router: Router = useRouter()
    const route: RouteLocationNormalizedLoaded = useRoute()
    const store = useStore()
    const loginData = LocalStorageUtil.getLogin()
    const formModal: FormState = {
      userName: '',
      password: '',
      remember: []
    }
    if (loginData.userName) {
      formModal.userName = loginData.userName
      formModal.password = loginData.password
      formModal.remember = ['1']
    }
    const formState: UnwrapRef<FormState> = reactive(formModal)
    const rules = {
      userName: [
        { required: true, message: '请输入用户账号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }
    const initBaseUrl = (menuList: Menu[]): string => {
      let baseUrl = ''
      for (const item of menuList) {
        if (item.link && item.isVisible === '1') {
          baseUrl = item.link
          break
        } else if (item.children && item.children.length > 0) {
          baseUrl = initBaseUrl(item.children)
          if (baseUrl !== '') {
            break
          }
        }
      }
      return baseUrl
    }
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          LocalStorageUtil.clearAll()
          SessionStorageUtil.clear()
          const formValue = toRaw(formState)
          const params = {
            userName: formValue.userName,
            password: formValue.password,
            orgCode: ToolsUtil.getOrgCode(),
            platformId: window.__platform__
          }
          loading.value = true
          auth.login(params).then((result) => {
            loading.value = false
            const res = result.data
            if (res.status === 200) {
              if (formValue.remember[0]) {
                LocalStorageUtil.putLogin(params)
              } else {
                LocalStorageUtil.removeLogin()
              }
              if (res.data.user && res.data.user.telphone) {
                res.data.user.password = formValue.password
                store.commit('setUserInfo', res.data.user)
                menuService.loadMenus().then(menu => {
                  const url = initBaseUrl(menu)
                  if (url && url !== '') {
                    gotoReview(mainBase + mainLayoutIndex)
                  } else {
                    LocalStorageUtil.removeUser()
                    SessionStorageUtil.clear()
                    store.commit('resetState')
                    menuService.clear()
                    message.error('暂无权限登陆！')
                  }
                })
              } else {
                message.error('未登录或登录已过期，请重新登录。')
              }
            }
          }).catch(() => {
            loading.value = false
          })
        })
        .catch((error: ValidateErrorEntity<FormState>) => {
          console.log('error', error)
        })
    }
    // store.getters.logo ||
    return {
      wrapperCol: { span: 24 },
      formRef,
      formState,
      loading,
      rules,
      onSubmit,
      schoolName: LocalStorageUtil.getSchoolName(),
      logoImage: {
        backgroundImage: `url(${require('@images/logo.png')})`
      }
    }
  },
  components: {
    UserOutlined,
    LockOutlined
  }
})
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background-color: #f0f2f5;
    background-image: url('https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg');
    background-repeat: no-repeat;
    background-position: center 110px;
    background-size: 100%;

    .wrap {
      flex: 1;
      padding: 32px 0;

      .top {
        text-align: center;
        padding-top: 80px;

        .head {

          .head-logo {
            width: 100px;
            height: 100px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 50%;

            .logo-content {
              background-size: cover;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }

          .head-title {
            font-size: 30px;
            color: #606060;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: bolder;
            text-align: center;
            margin-top: 8px;
          }
        }
      }
    }

    .scholar-login {
      display: block;
      width: 368px;
      margin: 0 auto;
    }
  }
</style>
