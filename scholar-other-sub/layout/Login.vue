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
            <p style="margin: 15px 0 10px 0;">开元教育</p>
            <p>工作台</p>
          </div>
        </div>
      </div>
      <div class='scholar-login'>
        <a-form
          ref="formRef"
          :model="formState"
          :wrapper-col="wrapperCol"
          :rules="rules"
        >
          <a-form-item ref="userName" name="userName">
            <a-input v-model:value="formState.userName" placeholder="账号" size="large" @keyup.enter="onSubmit()">
              <template #prefix>
                <UserOutlined style="color: rgba(0, 0, 0, 0.25)"/>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item ref="password" name="password">
            <a-input v-model:value="formState.password" type="password" placeholder="密码" size="large" @keyup.enter="onSubmit()">
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
import { LocalStorageUtil, SessionStorageUtil, ToolsUtil } from '../src/common/utils'
import { auth } from '../src/app/api'
import { message } from 'ant-design-vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { FormState, win } from '@/common/base'
import { SharedModule } from '@/common/services'

declare const window: win

export default defineComponent({
  name: 'login',
  setup () {
    const formRef = ref()
    const loading = ref(false)
    const router: Router = useRouter()
    const route:RouteLocationNormalizedLoaded = useRoute()
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
                SharedModule.getShared().setUserInfo(res.data.user)
                router.push({
                  name: 'home',
                  query: route.query
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

    return {
      wrapperCol: { span: 24 },
      formRef,
      formState,
      loading,
      rules,
      onSubmit,
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
<style lang="scss" scoped>
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
