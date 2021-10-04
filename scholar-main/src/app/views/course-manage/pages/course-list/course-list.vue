<template>
  <a-layout class='container'>
    <div class='main-header'>
      课程查询
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>关键词搜索：</label>
      <a-input placeholder="支持课程编号/课程名称/负责人"
               v-model:value="searchWordVal"
               style='width:25%;'
               @pressEnter='searchData("button")'
               @change="storingData"
      />
      <label style='min-width:78px;margin-left: 20px;'>课程状态：</label>
      <a-select
        v-model:value="selectedVal"
        @change="storingData"
        allowClear
        class='common-select'
      >
        <a-select-option value="">全部</a-select-option>
        <a-select-option value="0">草稿</a-select-option>
        <a-select-option value="1">待审批</a-select-option>
        <a-select-option value="2">标准</a-select-option>
        <a-select-option value="3">未通过</a-select-option>
      </a-select>
      <label style='min-width:78px;margin-left: 20px;'>更新时间：</label>
      <a-range-picker v-model:value="dateRangeVal" @change='storingData'/>
      <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class="body-header">
        <a-button type="primary"
                  @click="showCourseModal()"
                  style="margin-bottom:20px;"
        >新增课程
        </a-button>
      </div>
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{x:1280,y: "100%"}'
                 @change='searchList'
        >
          <a-table-column key="code"
                          title='课程编号'
                          data-index="code"
                          fixed='left'
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="name"
                          title='课程名称'
                          fixed='left'
                          data-index="name"
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="gbCode"
                          v-if='orgCode==="zksd"'
                          title='国家编码'
                          data-index="gbCode"
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="courseTypeName"
                          v-if='orgCode==="zksd"'
                          title='课程属性'
                          data-index="courseTypeName"
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column :key='orgCode === "zksd" ? "majorNames" : "majorName"'
                          :title="orgCode === 'zksd' ? '所属专业' : '所属学科'"
                          :data-index='orgCode === "zksd" ? "majorNames" : "majorName"'
                          width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="leaderName" title='负责人' data-index="leaderName" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="lastModifiedTime" title='更新时间' data-index="lastModifiedTime" width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getDate(text) }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="statusName" title='状态' data-index="statusName" width='100px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="auditStatusName" title='审批状态' data-index="auditStatusName" width='100px'>
            <template #default="{ text,record }">
                <span :class='{"synopsis-text":true,"red":record.auditStatus==="3","green":record.auditStatus==="2","orange":record.auditStatus==="1"}'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="action" title="操作" width='230px' fixed='right'>
            <template #default="{ record }" >
              <span v-if='initButton(record)'>
                <span  v-for='(item , i) in record?.upButtonArr'
                       :key='i'>
                  <a-button type='link'
                            @click="methodChange(record,i,'upButtonArr')"
                            style='padding:0;'
                            :class="{'light-color':item.method==='showDeleteConfirm'}">{{item.title}}</a-button>
                  <a-divider type="vertical" style='margin:0 5px' v-if='i!==record?.upButtonArr.length-1'/>
                </span>
                  <a-tooltip placement="bottom" overlayClassName='more-operate'>
                    <template #title>
                      <a-button
                         type='link'
                         :class="{'light-color':button.method==='showDeleteConfirm'}"
                         @click="methodChange(record,i,'dropButtonArr')"
                         v-for='(button , i) in record?.dropButtonArr'
                         :key='i'
                         style='display:block;'
                      >{{button.title}}
                      </a-button>
                    </template>
                    <span v-if='record?.dropButtonArr?.length'>
                       <a-divider type="vertical" style='margin:0 5px' />
                    <a-button type='link'
                              style='padding:0;transform:rotateZ(90deg) scale(2) translateY(-4px)'
                    ><MoreOutlined/></a-button>
                    </span>
                  </a-tooltip>
                <!--  <a-button type='link' @click='showCourseModal(record)' style='padding:0;'>编辑</a-button>-->
                <!--  <a-divider type="vertical" style='margin:0 10px'/>-->
                <!--  <a @click='showDeleteConfirm(record)' style='color:red;padding:0;'>删除</a>-->
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

    <a-modal v-model:visible="visible"
             title="新增课程"
             @ok="confirm"
             @cancel="visible = false;formRef.clearValidate()"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="visible = false;formRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="confirm">保存</a-button>
      </template>
      <a-form :model="formState"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :rules="formRules"
              ref="formRef"
              class='common-modal'>

        <a-form-item label="课程属性"
                     name="courseType"
                     hasFeedback
                     v-if='orgCode==="zksd"'>
          <a-select v-model:value="formState.courseType"
                    placeholder="请选择课程属性"
                    allowClear showSearch
                    @change='formRef?.validate("courseType")'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="1"
                             :key='1'
            >专业课
            </a-select-option>
            <a-select-option value="2"
                             :key='2'
            >公共课
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="课程名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear>
          <a-input v-model:value="formState.name" placeholder="请输入课程名称" @pressEnter='confirm'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:formState.name?.length>25? 'red':'inherit'
                }"
          >
          {{formState.name?.length || 0}}/25</span>
        </a-form-item>
        <div style='transform: translate(27px, -11px);color: #b7adad;'>注意: 建议长度为25个字符，过长不能保证在学员端的展示效果哦~</div>

        <a-form-item label="国家编码"
                     v-if='orgCode==="zksd"'
                     name="gbCode"
                     hasFeedback
                     allowClear>
          <a-input v-model:value="formState.gbCode" placeholder="请输入国家编码" @pressEnter='confirm'/>
        </a-form-item>

        <a-form-item label="课程服务商" name="courseProviderId" hasFeedback>
          <a-spin :spinning='courseProviderLoading'>
            <a-select v-model:value="formState.courseProviderId" placeholder="请选择课程服务商" allowClear showSearch
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                      @change='formRef?.validate("courseProviderId")'
            >
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item of courseProvider'
              >{{item.typeName}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>

        <a-form-item :label="orgCode === 'zksd' ? '所属专业' : '所属学科'" :name='orgCode==="zksd"?"majorIdList":"majorId"'
                     hasFeedback>
          <a-spin :spinning='disciplinDataLoading'>
            <a-select v-model:value='formState[orgCode==="zksd"?"majorIdList":"majorId"]'
                      :placeholder="'请选择'+ (orgCode === 'zksd' ? '所属专业' : '所属学科')"
                      allowClear
                      :mode='orgCode==="zksd"?"multiple":undefined'
                      showSearch
                      @change='formRef?.validate(orgCode==="zksd"?"majorIdList":"majorId")'
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item of disciplinData'
              >{{item.name}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>
        <a-form-item label="课程负责人" name="leaderId" hasFeedback>
          <a-spin :spinning='roleLoading' >
            <a-select v-model:value="formState.leaderId" placeholder="请选择课程负责人" allowClear showSearch
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                      @change='formRef?.validate("leaderId")'
            >
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item of roleArr'>{{item.nickName+'('+ item.telphone +')'}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>

        <a-form-item label="学历层次" name="eduLevel" hasFeedback v-if='orgCode==="zksd"'>
          <a-select v-model:value="formState.eduLevel" placeholder="请选择学历层次" allowClear showSearch mode="multiple"
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                    @change='formRef?.validate("eduLevel")'
          >
            <a-select-option value="1"
                             :key='1'
            >专科
            </a-select-option>
            <a-select-option value="2"
                             :key='2'
            >本科
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="创建人"
                     name="createrName"
                     v-if='isEdit'
        >
          <a-input v-model:value="formState.createrName" disabled/>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script lang="ts">
import CourseList from './course-list'
export default CourseList
</script>
<style lang="less" scoped>
@import './course-list';
</style>
