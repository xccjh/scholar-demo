<template>
  <div class='container'>
    <div class='left-container'>
      <div style='font-size: 15px;text-align:left'>
        选择知识点(不支持跨学科知识点)
      </div>
      <a-tree
        class='fix-title'
        @check='treeNodeClick'
        checkable
        v-model:checkedKeys='checkedKeys'
        :defaultExpandAll='true'
        style='text-align:left'
        :tree-data="treeData"
        :replaceFields='{title:"name",key:"id"}'
        v-if='treeData.length'
        :showLine='true'
      >
      </a-tree>
    </div>
    <div class='right-container'>
      <div class='header'>
        <p style='margin-bottom:15px;font-size: 18px;text-align:left;float:left'>{{title}}</p>
          <div class='button-container fr'>
            <a-button type="primary" @click="onSubmit">保存</a-button>
            <a-button style="margin-left: 10px" @click="gotoback">返回</a-button>
          </div>
      </div>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRule"
        :label-col="{ span: 2 }"
        :wrapper-col="{ span: 22 }"
        class='material-from'
      >
        <a-form-item label="资源标题" name="title">
          <a-input v-model:value="formState.title" placeholder='请输入资源标题'/>
        </a-form-item>

        <a-form-item label="作者名称" name="authorName">
          <a-input v-model:value="formState.authorName" placeholder='请输入作者名称'/>
        </a-form-item>

        <a-form-item label="学习目标" name="learningGoalCode">
          <a-select v-model:value="formState.learningGoalCode" placeholder="请选择学习目标">
            <a-select-option :value="opt.id" v-for='opt in learnTargetArr' :key='opt.id'>{{opt.name}}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="案例背景" name="background" class='editor-container case-background'>
          <a-spin :spinning='backgroundLoading' :delay='1000'>
            <ckeditor :editor="ClassicEditor"
                      :config="backgroundConfig" id='background-editor' v-model='formState.background'></ckeditor>
            <span
              style='float:right'
              :style='{color:getContentLength(formState.background)<5000?"rgb(95, 95, 95)":"red"}'>{{getContentLength(formState.background)}}
                /5000</span>
          </a-spin>

        </a-form-item>

        <a-form-item label="案例附件" name="caseAttanmentArr">
          <a-upload
            v-model:file-list="fileList"
            name="file"
            :multiple="true"
            :customRequest='customRequest("case/resource")'
            :remove='removeCaseMaterial'
            :before-upload='beforeUploadMaterial'
            :class='{"case-attanment":fileList.length>=4}'
            accept='.jpg,.jpeg,.png,.bmp,.xls,.xlsx,.docx,.pdf,.doc,.pptx,.ppt,.mp4,.zip,.rar'
          >
            <a-button v-show='fileList.length<4'>
              <upload-outlined></upload-outlined>
              上传文件
            </a-button>
          </a-upload>
          <span style='color: rgba(0,0,0,.45);font-size: 14px;'>仅限4个，支持扩展名：pdf 、doc 、docx 、xls 、xlsx 、ppt 、pptx 、png 、jpg 、bmp 、jpeg 、mp4 、zip 、rar</span>
        </a-form-item>

        <a-form-item label="案例解析" name="analysis" class='editor-container'>
          <a-spin :spinning='analysisLoading' :delay='1000'>
          <ckeditor :editor="ClassicEditor"
                    :config="analysisConfig" id='analysis-editor' v-model='formState.analysis'></ckeditor>
            <span
              style='float:right'
              :style='{color:getContentLength(formState.analysis)<5000?"rgb(95, 95, 95)":"red"}'>{{getContentLength(formState.analysis)}}
                /5000</span>
          </a-spin>
        </a-form-item>

        <a-form-item label="教学指导" name="guide" class='editor-container'>
          <a-spin :spinning='guideLoading' :delay='1000'>
          <ckeditor :editor="ClassicEditor"
                    :config="guideConfig" id='guide-editor' v-model='formState.guide'></ckeditor>
            <span
              style='float:right'
              :style='{color:getContentLength(formState.guide)<5000?"rgb(95, 95, 95)":"red"}'>{{getContentLength(formState.guide)}}
                /5000</span>
          </a-spin>
        </a-form-item>

      </a-form>

    </div>
  </div>
</template>

<script lang="ts">
import SaveCase from './save-case'
export default SaveCase
</script>
<style lang="less" scoped>
@import './save-case';
</style>
