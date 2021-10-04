<template>
  <a-layout class='container'>
    <div class='main-header'>
      指导讲师
    </div>
    <div class='content-header'>
      <label style='min-width:78px'>讲师姓名：</label>
      <a-input placeholder="支持讲师姓名"
               v-model:value="searchWordVal"
               style='width:250px;'
               @pressEnter='searchData("button")'
               @change="storingData"
      />
      <label style='min-width:78px;margin-left: 20px;'>所属课程：</label>
      <a-select
        v-model:value="selectedCourseVal"
        @change="storingData"
        class='common-select'
        placeholder="请选择所属课程"
        showSearch
        allowClear
        mode="multiple"
        :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
      >
        <a-select-option :value="course.id" v-for='course in courseList' :key='course.id'>{{course.name}}
        </a-select-option>
      </a-select>
      <a-button type="primary" style='margin-left:20px;' @click="searchData('button')">查询</a-button>
      <a-button type="primary" style='margin-left:20px;' @click="resetData()">重置</a-button>
    </div>
    <a-layout-content style="padding: 15px 20px 20px;" class="content">
      <div class="body-header">
        <a-button type="primary"
                  @click="showTeacherModal()"
                  style="margin-bottom:20px;"
        >新增讲师
        </a-button>
      </div>
      <div class='table-container' id='tableScroll'>
        <a-table :data-source="data"
                 :loading='loading'
                 :pagination='pagination'
                 :scroll='{x:930,y: "100%"}'
                 @change='searchList'
        >
          <a-table-column key="seq"
                          title='序号'
                          data-index="seq"
                          width='50px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>
          <a-table-column key="avatar"
                          title='讲师头像'
                          data-index="avatar"
                          width='100px'>
            <template #default="{ text }">
              <img :src='prefix + text' style='width:50px;height:50px;border-radius:50%;' v-if='text'>
              <a-avatar v-if='!text'>
                <template #icon>
                  <UserOutlined/>
                </template>
              </a-avatar>
            </template>
          </a-table-column>

          <a-table-column key="name"
                          title='姓名'
                          data-index="name"
                          width='120px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="course" title='所属课程' data-index="course" width='150px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text.length > 0 ? text.map(e => e.courseName).join(',') : '--'}}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="introduction" title='讲师简介' data-index="introduction" width='200px'>
            <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
            </template>
          </a-table-column>

          <a-table-column key="videoName" title='试讲视频' data-index="videoName" width='150px'>
            <template #default="node">
              <span class='synopsis-text' @click="handlePreViewVideo(node.record)">
                  <a-button type='link' style='padding:0'><FolderViewOutlined v-if='node.text'/>{{ node.text || '--' }}</a-button>
                </span>
            </template>
          </a-table-column>

          <a-table-column key="action" title="操作" width='150px'>
            <template #default="{ record }">
              <span>
                <a-button type='link' @click='previewTeacher(record)' style='padding:0;'>预览</a-button>
                                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button type='link' @click='editItem(record)' style='padding:0;'>编辑</a-button>
                                <a-divider type="vertical" style='margin:0 10px'/>
                <a-button type='link' @click='delItem(record)' style='padding:0;color:red;'>删除</a-button>
              </span>
            </template>
          </a-table-column>
        </a-table>
      </div>
    </a-layout-content>

    <a-modal v-model:visible="guideTeacherVisible"
             :title="`${isEdit ? '编辑' : '新增'}讲师`"
             @ok="confirmModal"
             @cancel="guideTeacherVisible = false;teacherFormRef.clearValidate();fileList=[]"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="guideTeacherVisible = false;teacherFormRef.clearValidate();fileList=[]">取消
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="confirmModal">保存</a-button>
      </template>
      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="teacherFormState"
              :rules="teacherFormRules"
              ref="teacherFormRef"
              class='common-modal'>

        <a-form-item label="头像"
                     name="avatar"
                     hasFeedback
        >
          <a-upload
            :customRequest='customRequest("recording/teacher-avatar")'
            v-model:file-list="fileList"
            list-type="picture-card"
            accept='.png,.jpg,.jepg,.bmp'
            :show-upload-list="{showPreviewIcon:true,showRemoveIcon:true}"
            class='course-upload'
            @preview='filePreview'
            :remove='removeFile'
          >
            <div v-if='fileList.length === 0'>
              <plus-outlined></plus-outlined>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="姓名"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="teacherFormState.name" placeholder="请输入姓名" allowClear @pressEnter='confirmModal'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:teacherFormState.name?.length>25? 'red':'inherit'
                }"
          >
          {{teacherFormState.name?.length || 0}}/25</span>
        </a-form-item>

        <a-form-item label="所属课程" name="courseIds" hasFeedback>
          <a-select v-model:value="teacherFormState.courseIds"
                    placeholder="请选择所属课程"
                    allowClear
                    showSearch
                    mode='multiple'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option :value="item.id"
                             :key='item.id'
                             v-for='item of courseList'
            >{{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="保利威ID"
                     name="polywayID"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="teacherFormState.polywayID" placeholder="请输入保利威ID" allowClear @pressEnter='confirmModal'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:teacherFormState.polywayID?.length>34? 'red':'inherit'
                }"
          >
          {{teacherFormState.polywayID?.length || 0}}/34</span>
        </a-form-item>

        <a-form-item label="视频名称"
                     name="videoName"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="teacherFormState.videoName" placeholder="请输入视频名称" allowClear @pressEnter='confirmModal'/>
        </a-form-item>

        <a-form-item label="讲师简介"
                     name="introduction"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-textarea v-model:value="teacherFormState.introduction" placeholder="请输入讲师简介" allowClear :rows="4"
                      @pressEnter='confirmModal'></a-textarea>
          <div style='text-align:right' :style="{
                  position:'absolute',
                  right:0,
                  color:(teacherFormState.introduction?.length>100)? 'red':'inherit'
                }">{{teacherFormState.introduction?.length || 0}}/100
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="previewVisible"
             title="讲师介绍"
             :closable='true'
             :maskClosable='false'
             :footer='null'
    >
      <div class="teacher-preview">
        <div class='list-item'>
          <div class='list-label'>
            <img :src='prefix+previewData.avatar'
                 :alt='previewData.avatar'
                 style='display:inline-block;width: 80px;height: 80px;border-radius:50%;'
                 v-if='previewData.avatar'>
            <a-avatar v-if='!previewData.avatar'
                      style='width: 80px;height: 80px;font-size:72px;'>
              <template #icon>
                <UserOutlined/>
              </template>
            </a-avatar>
          </div>
          <div class='list-content pl25'>
            <span style='font-size:20px' :title='previewData?.name'>{{ previewData?.name }}</span>
          </div>
        </div>
        <div class='list-item'>
          <div class='list-label pl10'>
            讲师简介 :
          </div>
          <div class='list-content numRom'>
        <span class='numRom' :title='previewData?.introduction'>
          {{ previewData?.introduction }}
        </span>
          </div>
        </div>
        <div class='list-item'>
          <div class='list-label pl10 mt10'>
            试讲视频 :
          </div>
          <div class='list-content'>
            <FolderViewOutlined v-if='previewData.videoName'/>
            <span class="blue-text" @click="handlePreViewVideo(previewData)">
              {{previewData.videoName}}
              </span>
          </div>
        </div>
      </div>
    </a-modal>

  </a-layout>
</template>

<script lang="ts">
import RecordingLecturer from './recording-lecturer'

export default RecordingLecturer
</script>
<style lang="less" scoped>
  @import './recording-lecturer';
</style>
