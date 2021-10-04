<template>
  <div class='container'>
    <div class='header'>
      <div class='title'>修改密码</div>
      <div class='button-container'>
      <a-button  style='margin-right:20px;' @click='gotoback'>返回</a-button>
      <a-button type='primary' style='margin-right:20px;' @click='confirmForm'>确认修改</a-button>
      </div>
    </div>
    <div class='content'>
      <a-form
        class='admin-security-form'
        ref="formRef"
        :model="formState"
        :rules="formRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="手机号码"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <span style='float:left'>
            {{adminInfo.telphone}}
          </span>
        </a-form-item>
        <a-form-item label="验证码"
                     name="code"
                     hasFeedback
                     class='vercode'
                     style='max-width: 460px;position:relative;'
        >
          <a-input-number v-model:value="formState.code" placeholder="请输入验证码" style='width:150px;float:left;margin-top:5px;' allowClear @pressEnter='confirmForm'/>
          <a-button type="primary"
                  v-if="!sendPhoneDisabled"
                  @click="getVerCode()">
            {{isFirstGetCode ? '发送验证码' : '重新发送'}}
          </a-button>
          <a-button v-if="sendPhoneDisabled">
            重新发送({{timeCount}}s)
          </a-button>
        </a-form-item>
        <a-form-item label="新密码"
                     name="newPassword"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input-password v-model:value="formState.newPassword" placeholder="请输入新密码" allowClear @pressEnter='confirmForm'/>
        </a-form-item>
        <a-form-item label="确认新密码"
                     name="confirmPassword"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input-password v-model:value="formState.confirmPassword" placeholder="请确认密码" allowClear @pressEnter='confirmForm'/>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts">
import AdminSecurity from './admin-security'
export default AdminSecurity
</script>
<style lang="less" scoped>
@import './admin-security';
</style>
