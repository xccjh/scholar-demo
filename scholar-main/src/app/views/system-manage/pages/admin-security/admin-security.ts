import { reactive, defineComponent, ref } from 'vue'
import { gotoReview, LocalStorageUtil, SessionStorageUtil } from '@/common/utils'
import { RuleObject, ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { AdminSecurityApi } from '@/app/views/system-manage/pages/admin-security/api'
import { FormState } from '@/common/base'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useRequiredInject } from '@/common/hooks'
import { MenuServiceKey } from '@/common/services'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'admin-security',
  setup () {
    const adminInfo = ref(LocalStorageUtil.getUser())
    const router = useRouter()
    const store = useStore()
    const timeCount = ref(60)
    const sendPhoneDisabled = ref(false)
    const isFirstGetCode = ref(true)
    const menuService = useRequiredInject(MenuServiceKey)
    const formRef = ref()
    const formState = reactive({
      code: undefined,
      newPassword: '',
      confirmPassword: ''
    })
    const validatePass = async (rule: RuleObject, value: string) => {
      if (value.trim() === '') {
        return Promise.reject(new Error('新密码不能为空'))
      } else {
        return Promise.resolve()
      }
    }
    const validatePass2 = async (rule: RuleObject, value: string) => {
      if (value.trim() === '') {
        return Promise.reject(new Error('请输入确认密码'))
      } else if (value !== formState.newPassword) {
        return Promise.reject(new Error('两次输入密码不匹配'))
      } else {
        return Promise.resolve()
      }
    }
    const formRules = {
      code: [
        { whitespace: true, message: '验证码不能为空', trigger: 'change', type: 'number' },
        { required: true, message: '验证码不能为空', trigger: 'change', type: 'number' }
      ],
      newPassword: [
        { required: true, validator: validatePass, trigger: 'change' }
      ],
      confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'change' }
      ]
    }
    const getVerCode = () => {
      AdminSecurityApi.getVerCode(adminInfo.value.telphone).then(res => {
        if (res.data.status === 201) {
          if (sendPhoneDisabled.value) {
            return false
          }
          sendPhoneDisabled.value = true
          isFirstGetCode.value = false
          const interval = window.setInterval(() => {
            if ((timeCount.value--) <= 0) {
              timeCount.value = 60
              sendPhoneDisabled.value = false
              window.clearInterval(interval)
            }
          }, 1000)
        }
      })
    }

    const gotoback = () => {
      menuService.goBack()
    }

    const confirmForm = () => {
      formRef.value.validate().then(() => {
        AdminSecurityApi.sendModifyPassword({
          password: formState.newPassword,
          phone: adminInfo.value.telphone,
          code: formState.code
        }).then(res => {
          if (res.data.status === 201) {
            message.success('修改密码成功！请重新登录')
            LocalStorageUtil.removeTkToken()
            LocalStorageUtil.removeUser()
            SessionStorageUtil.clear()
            store.commit('resetState')
            menuService.clear()
            gotoReview('p/login')
          }
        })
      }).catch((error: ValidateErrorEntity<FormState>) => {
        console.log('error', error)
      })
    }
    return {
      formRef,
      formState,
      formRules,
      adminInfo,
      confirmForm,
      timeCount,
      sendPhoneDisabled,
      isFirstGetCode,
      getVerCode,
      gotoback
    }
  }
})
