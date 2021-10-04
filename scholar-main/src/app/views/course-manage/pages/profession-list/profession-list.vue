<template>
  <a-layout class='container'>
    <div class='main-header'>
      {{orgCode === 'zksd' ? '专业查询' : '学科查询'}}
    </div>
    <div class='content-header'>
      <label>关键词搜索：</label>
      <a-input :placeholder="orgCode==='zksd'?'支持专业编号/专业名称/负责人':'支持学科编号/学科名称/负责人'"
               v-model:value="searchWordVal"
               style='margin-right: 20px;width:250px;'
               @pressEnter='searchData("button")'
               @change="storingData"
      />
      <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class="body-header">
        <a-button type="primary"
                  @click="showProfessionModal()"
                  :disabled='isManager!=="1"'
                  style="margin-bottom:20px;"
        >{{orgCode === 'zksd' ? '新增专业' : '新增学科'}}
        </a-button>
      </div>
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll="{
                           x: orgCode === 'zksd' ? 1310 : 990,
                           y: '100%'
                          }"
                 @change='searchList'
        >
          <!--                          :fixed='windowWith>1600?undefined:"left"'-->
          <a-table-column key="code"
                          :title='orgCode === "zksd" ? "专业编号" : "学科编号"'
                          data-index="code"
                          fixed='left'
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
            </template>
          </a-table-column>
<!--          :fixed='windowWith>1600?undefined:"left"'-->
          <a-table-column key="name"
                          :title='orgCode === "zksd" ? "专业名称" : "学科名称"'
                          data-index="name"
                          fixed='left'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="productLineName" title='产品线' data-index="productLineName" width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text|| '--' }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="majorTypeName" title='学科类型' data-index="majorTypeName" width='120px'
                          v-if="orgCode !== 'zksd'">
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="managerName" data-index="managerName" width='150px'>
            <template #title>学科管理人
              <a-tooltip :overlayStyle='{"max-width": "190px"}' trigger='click'>
                <template #title>
                  学科管理人负责管理学科，有编辑和删除学科和移交学科的权限。
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--' }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="leaderName" data-index="leaderName" width='150px'>
            <template #title>学科负责人
              <a-tooltip :overlayStyle='{"max-width": "190px"}' trigger='click'>
                <template #title>
                  学科负责人负责建设学科下的课程
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--'}}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="finalApproverName" data-index="finalApproverName" width='120px'>
            <template #title>终审人
              <a-tooltip trigger='click' :overlayStyle='{"max-width": "255px"}'>
                <template #title>
                  终审人负责对课程与课包进行最终审批
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text || '--' }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="action" title="操作" width='250px' v-if='isManager==="1"' fixed='right'>
            <template #default="{ record }">
              <span>
                <a-button
                  :disabled='(record.managerId || record.createrId) !== userId'
                  type='link'
                  @click='showProfessionModal(record)'
                  style='padding:0;'
                >编辑</a-button>
                <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button
                    :disabled='record.managerId !== userId'
                    @click='gotoLabelManagement(record)'
                    type='link'
                    style='padding:0;'
                  >标签管理</a-button>
                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button
                  @click='transferSubjects(record)'
                  type='link'
                  style='padding:0;'
                  :disabled='(record.managerId || record.createrId) !== userId'
                >移交学科</a-button>
                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button @click='showDeleteConfirm(record)'
                          type='link'
                          :style='{color:((record.managerId || record.createrId) === userId ? "red":"rgba(0,0,0,.25)"),padding:0}'
                          :disabled='(record.managerId || record.createrId) !== userId'
                >删除</a-button>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

    <a-modal v-model:visible="visible"
             :title="orgCode === 'zksd' ? `${isEdit ? '编辑' : '新增'}专业` : `${isEdit ? '编辑' : '新增'}学科`"
             @ok="confirm"
             @cancel="visible = false;formRef.clearValidate();"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="visible = false;formRef.clearValidate();">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="confirm">保存</a-button>
      </template>
      <a-form :model="formState"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :rules="formRules"
              ref="formRef"
              class='common-modal'>
        <a-form-item label="学科名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear>
          <a-input v-model:value="formState.name" placeholder="请输入学科名称" @pressEnter='confirm'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:formState.name?.length>25? 'red':'inherit'
                }"
          >
          {{formState.name?.length || 0}}/25</span>
        </a-form-item>
        <a-form-item label="产品线" name="productLineId" hasFeedback>
          <a-spin :spinning='allLineLoading'>
            <a-select v-model:value="formState.productLineId"
                      placeholder="请选择产品线"
                      allowClear
                      showSearch
                      @change='formRef?.validate("productLineId")'
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item in allLine'
              >{{item.name}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>

        <a-form-item label="学科类型" name="majorType" hasFeedback>
          <a-select v-model:value="formState.majorType"
                    placeholder="请选择学科类型"
                    allowClear
                    showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value=""
                             :key='0'
            >请选择
            </a-select-option>
            <a-select-option value="1"
                             :key='1'
            >财会证书
            </a-select-option>
            <a-select-option value="2"
                             :key='2'
            >会计实操
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="学科负责人" name="leaderId" hasFeedback>
          <a-spin :spinning='roleLoading'>
            <a-select v-model:value="formState.leaderId"
                      placeholder="请选择学科负责人"
                      allowClear
                      showSearch
                      @change='formRef?.validate("leaderId")'
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item in roleArr'>{{item.nickName+'('+ item.telphone +')'}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>

        <a-form-item label="终审人" name="finalApproverId" hasFeedback>
          <a-spin :spinning='roleLoading'>
            <a-select v-model:value="formState.finalApproverId"
                      placeholder="请选择终审人"
                      allowClear
                      showSearch
                      @change='formRef?.validate("finalApproverId")'
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item in roleArr'>{{item.nickName+'('+ item.telphone +')'}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="transferSubjectsVisible"
             title="移交学科"
             @ok="confirmSubjectsManager"
             @cancel="transferSubjectsVisible = false;subjectsManager = ''"
             :closable='true'
             :maskClosable='false'
    >
      <div style='color:#bdbdbd;margin-bottom:20px;'>注意：将学科移交给他人后，您将失去管理该学科的权限（包括查看、编辑、删除、移交学科权限）。</div>
      <div style='display:flex;'>
        <span style='line-height:30px;'>学科管理人：</span>
        <a-spin :spinning='roleLoading'>
          <a-select v-model:value="subjectsManager"
                    placeholder="请选择学科管理人"
                    allowClear
                    showSearch
                    style='width:350px'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option :value="item.id"
                             :key='item.id'
                             v-for='item in roleArr'>{{item.nickName+'('+ item.telphone +')'}}
            </a-select-option>
          </a-select>
        </a-spin>
      </div>
      <template #footer>
        <a-button key="back" @click="transferSubjectsVisible = false;subjectsManager = ''">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="confirmSubjectsManager">保存</a-button>
      </template>
    </a-modal>
  </a-layout>
</template>
<script lang="ts">
import Professionlist from './profession-list'

export default Professionlist
</script>
<style lang="less" scoped>
  @import './profession-list';
</style>
