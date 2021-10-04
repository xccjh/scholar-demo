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
        <p style='margin-bottom:15px;font-size: 18px;text-align:left;float:left'>{{title}}
          <a-tooltip :overlayStyle='{"max-width": "800px"}'>
            <template #title>
              <div>1、建议优先WPS制作PPT；</div>
              <div>2、尽量少用第三模板；</div>
              <div>3、PPT的文件大小应控制在100M之内</div>
            </template>
            <QuestionCircleOutlined class='font-question' v-if='materialType==="101"'
                                    style='vertical-align:text-bottom'/>
          </a-tooltip>
        </p>
        <div class='button-container fr'>
          <a-button type="primary" @click="onSubmit">保存</a-button>
          <a-button style="margin-left: 10px" @click="gotoback">返回</a-button>
        </div>
      </div>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="formRule"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
        class='material-from'
      >
        <a-form-item label="创建人" v-if='isEdit'>
          <a-input v-model:value="createrName" disabled/>
        </a-form-item>

        <a-form-item label="学习目标" name="learningGoalCode">
          <a-select v-model:value="formState.learningGoalCode" placeholder="请选择学习目标">
            <a-select-option :value="opt.id" v-for='opt in learnTargetArr' :key='opt.id'>{{opt.name}}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="资源标题" v-if='isEdit' name='title'>
          <a-input v-model:value="formState.title" placeholder='请输入资源标题' />
        </a-form-item>

        <a-form-item  name='uploadFileArr'>
          <template #label>
            <div style='width:100%;transform: translateY(50%);margin-top: -18px;'>
              <div>添加文件</div>
            </div>
          </template>
          <a-upload-dragger
            :disabled='isEdit && fileList.length > 0'
            :customRequest='customRequest("courseware/read")'
            :multiple='!isEdit'
            v-model:file-list="fileList"
            :showUploadList='false'
            :before-upload='beforeUploadRead'
            :accept="materialType=='103'?'.mp4':'.png,.jpg,.jpeg,.ppt,.pptx,.doc,.docx,.pdf,.xls,.xlsx,.rar,.zip'"
          >
            <p class="ant-upload-drag-icon">
              <inbox-outlined></inbox-outlined>
            </p>
            <p class="ant-upload-text">点击或将文件拖曳到这里上传</p>
            <p class="ant-upload-hint">
              支持扩展名: {{materialType == '103' ? 'mp4' : 'png、jpg、jpeg、ppt、pptx、doc、docx、pdf、xls、xlsx、rar、zip'}}
            </p>
          </a-upload-dragger>
          <div v-for="(item,i) in fileList" :key='item.uid' class="upload-list">
            <CloseOutlined class="close" @click="removeMaterial(item)"/>
            <a-tooltip>
              <template #title>{{item.name}}</template>
              <p class='description'>
                <LinkOutlined style="font-size: 14px;"/>
                {{ item.name }}
              </p>
            </a-tooltip>
            <a-progress :percent="Math.floor(Number(item.percent))" status="active" v-if="item.status==='uploading'"
                        :strokeWidth="2"/>
            <div v-if='formState.uploadFileArr[i] && !isEdit'>
              <a-input style="width:calc(100% - 50px);" v-model:value="formState.uploadFileArr[i].title"
                       placeholder="请输入标题" :maxlength='30'/>
              <span
                :style="{color:formState.uploadFileArr[i].title.length>30 ? 'red':'inherit','margin-left':'10px'}"
              >{{ formState.uploadFileArr[i].title.length ||  0 }}/30</span>
            </div>
          </div>
          <div style='color:gray;white-space: normal;' v-if='fileList.length'>注意：上传文件名字数超过30将自动截取30字符为附件标题。</div>
        </a-form-item>

        <a-form-item label="作者名称" name="authorName">
          <a-input v-model:value="formState.authorName" placeholder='请输入作者名称' />
        </a-form-item>

        <a-form-item label="水印开关" name="isWatermark" required>
          <a-radio-group v-model:value="formState.isWatermark">
            <a-radio value="1">开启</a-radio>
            <a-radio value="0">关闭</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="水印文字" name="watermarkText" v-if='formState.isWatermark==="1"'>
          <a-input v-model:value="formState.watermarkText"/>
        </a-form-item>
      </a-form>

    </div>
  </div>
</template>

<script lang="ts">
import SaveRead from './save-read'

export default SaveRead
</script>
<style lang="less" scoped>
  @import './save-read';
</style>
