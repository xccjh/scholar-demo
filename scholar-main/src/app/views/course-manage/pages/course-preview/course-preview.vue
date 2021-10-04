<template>
  <div class='container'>
    <div :class='{"header":true,"scroll-up":isExpend}'>
      <div class='title'>
        基本信息
        <a-tooltip>
          <template #title>单击收起</template>
          <DownOutlined @click='isExpend=!isExpend' class='icon-expend' v-if='!isExpend'/>
        </a-tooltip>
        <a-tooltip>
          <template #title>单击展开</template>
          <UpOutlined @click='isExpend=!isExpend' class='icon-expend' v-if='isExpend'/>
        </a-tooltip>
        <a-button @click='backToList()' style='float:right;margin-top:20px;'>返回</a-button>
      </div>

      <a-descriptions style='text-align:left'>
        <a-descriptions-item label="课程编号">{{ data?.code }}</a-descriptions-item>
        <a-descriptions-item label="课程名称">{{ data?.name }}</a-descriptions-item>
        <a-descriptions-item :label="orgCode==='zksd'?'所属专业':'所属学科'">{{getMajorList(data) }}</a-descriptions-item>
        <a-descriptions-item label="课程服务商">{{ data?.courseProviderName }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ data?.leaderName }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ data?.createrName }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ getDate(data?.lastModifiedTime) }}</a-descriptions-item>
        <a-descriptions-item label="层次" v-if='orgCode==="zksd"'>{{ data?.eduLevelName }}</a-descriptions-item>
        <a-descriptions-item label="地区" v-if='orgCode==="zksd"'>{{ data?.courseAreaName }}</a-descriptions-item>
      </a-descriptions>
    </div>
    <a-tabs v-model:activeKey="activeKey" animated type='card' @change='tabChange' class='course-preview-tab'>
      <a-tab-pane key="1" tab="课程信息" class='course-info'>
        <a-descriptions :column='1' style='text-align:left;padding-left:20px;'>
                <a-descriptions-item label="课程组成员" class='item-member'>
                  <a-tooltip v-for="(option,i) in data.courseMemberUserList" :key='i'>
                    <template #title>{{(option.userName || '匿名')}}</template>
                    <div>
                {{(option.userName || '匿名')}}
              </div>
            </a-tooltip>
            <span v-if='!data.courseMemberUserList?.length'>
              该用户没有选择课程组成员
            </span>
          </a-descriptions-item>

          <a-descriptions-item label="习题审核人员" class='item-member'>

            <a-tooltip v-for="(option,i) in data.exercisesAuditUserList" :key='i'>
              <template #title>{{(option.userName || '匿名')}}</template>
              <div>
                {{(option.userName || '匿名')}}
              </div>
            </a-tooltip>
            <span v-if='!data.exercisesAuditUserList?.length'>
              该用户没有选择习题审核人员
            </span>
          </a-descriptions-item>

          <a-descriptions-item label="课程封面" class='img-cover'>
            <img class="cover-image"
                 :src="ossUrl+data.courseDetail?.coverPath"
                 alt="pic"
                 v-if='data.courseDetail?.coverPath'/>
            <span v-else>
              该用户没有上传课程封面
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="课程简介" class='introduction-preview'>
           <div v-html="data.courseDetail?.introduction ||'暂无介绍'"></div>
          </a-descriptions-item>
        </a-descriptions>
      </a-tab-pane>
      <a-tab-pane key="2" tab="知识图谱">
        <div class='knowledge-graph'>
          <div class="left-container">
            <div class='filter-container'>
              <a-dropdown>
                <a class="ant-dropdown-link" @click.prevent>
                  <FilterOutlined/>
                </a>
                <template #overlay>
                  <a-menu @click="filterKnowledgePointsClick">
                    <a-menu-item key='1'>
                      <a href="javascript:;">全部</a>
                    </a-menu-item>
                    <a-menu-item key='2'>
                      <a href="javascript:;">待审核</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            <div class='tree-container'>
              <a-tree
                style='text-align:left'
                @select='selectTree'
                :replaceFields='{title:"name",key:"id"}'
                :defaultExpandAll='true'
                :showLine='true'
                :tree-data="treeData"
                v-if='treeData.length'
              >
                <template #title='node'>
                  <span :title='node.name' class='node-title'>{{node.name}}</span>
                  <span class='knowledge-circle' title='该知识点未完成' v-if="(!node.isDone)&&node.kType==='4'"></span>
                  <span v-if='node.kType!=="1"&&node.status==="2"'>(新增)</span>
                  <span class='chapter-weight'
                        v-if="node.kType==='2'&&node.weight&&node.status!=='3'&&activedNode.id !== node.id"
                        :title='"该章节权重"+node.weight'>
                      {{node.weight + '/' + totalWeight}}
                    </span>
                  <span class='knowledge-star' v-if='node.kType==="4"&&activedNode.id !== node.id'>
                      <StarOutlined v-for='(item,i) in Number(node.keyLevel)' :key='i'/>
                  </span>
                </template>
              </a-tree>
            </div>
          </div>
          <div class="right-container">
            <div v-show="activedNode.kType==='2'">
              <span style='color:red;margin-right:6px;'>*</span>本章考试权重 ：
              <a-input-number
                v-model:value="chapterWeight"
                :min="0"
                :max="1000000"
                :step='1'
                style='color:black'
                disabled/>
              <span style='margin-left:10px;'>
                实际权重 = 本章权重/ 所有章节的权重之和
              </span>
            </div>
            <div v-show="activedNode.kType=='4'" style="height: 100%;">
              <a-form
                ref="formRef"
                :model="formState"
              >
                <a-form-item ref="code" label="知识点编码" name="code" style='height:40px;'>
                  <div :title='formState.code'
                       class='knowledge-code'
                  >{{formState.code}}
                  </div>
                </a-form-item>

                <a-form-item ref="content" label="知识点定义" name="content" class='editor-container'>
                  <ckeditor :editor="ClassicEditor"
                            :config="config" id='editor' v-model='formState.content' disabled></ckeditor>
                </a-form-item>

                <a-form-item label="重难点" name="keyLevel">
                  <a-radio-group v-model:value="formState.keyLevel">
                    <a-radio :value="1" disabled>1星</a-radio>
                    <a-radio :value="2" disabled>2星</a-radio>
                    <a-radio :value="3" disabled>3星</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="是否冲刺" name="isSprint">
                  <a-radio-group v-model:value="formState.isSprint">
                    <a-radio :value="true" disabled>是</a-radio>
                    <a-radio :value="false" disabled>否</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="是否巩固" name="isStable">
                  <a-radio-group v-model:value="formState.isStable">
                    <a-radio :value="true" disabled>是</a-radio>
                    <a-radio :value="false" disabled>否</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="是否押题" name="isFinal">
                  <a-radio-group v-model:value="formState.isFinal">
                    <a-radio :value="true" disabled>是</a-radio>
                    <a-radio :value="false" disabled>否</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="知识点状态" name="opsType">
                  <a-radio-group v-model:value="formState.opsType">
                    <a-radio :value="0" disabled>不变</a-radio>
                    <a-radio :value="1" disabled>新增</a-radio>
                    <a-radio :value="2" disabled>变更</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="讲解视频" name="explanationVideo">
                  <div class='list-video' v-if='formState.explanationVideo.length'>
                    <div class='item-left' v-for='(itemFile,i) in formState.explanationVideo'
                         :key='i'
                         :title='getName(itemFile.attachmentPath)'
                    >
                      <div class="item-text">
                        <a-tooltip>
                          <template #title>{{getName(itemFile.attachmentPath)}}</template>
                          <img :src="getPreview(itemFile.attachmentPath)"
                               :class='{br5:isPicture(itemFile.attachmentPath),"img-dec":true}'
                               @click='previewItem(itemFile)'>
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>{{getName(itemFile.attachmentPath)}}</template>
                          <span class='img-desc'>
                          {{getName(itemFile.attachmentPath)}}
                        </span>
                        </a-tooltip>
                      </div>
                      <EyeOutlined @click='previewItem(itemFile)'/>
                    </div>
                  </div>
                  <span v-else style='color: #bfbfbf'>未上传讲解视频</span>
                </a-form-item>
                <a-form-item label="学习资料" name="learningMaterials">
                  <div class='list-video' v-if='formState.learningMaterials.length'>
                    <div class='item-left' v-for='(itemFile,i) in formState.learningMaterials'
                         :key='i'
                         :title='getName(itemFile.path)'
                    >
                      <div class="item-text">
                        <a-tooltip>
                          <template #title>{{getName(itemFile.attachmentPath)}}</template>
                          <img :src="getPreview(itemFile.attachmentPath)"
                               :class='{br5:isPicture(itemFile.attachmentPath),"img-dec":true}'
                               @click='previewItem(itemFile)'>
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>{{getName(itemFile.attachmentPath)}}</template>
                          <span class='img-desc'>
                          {{getName(itemFile.attachmentPath)}}
                        </span>
                        </a-tooltip>
                      </div>
                      <EyeOutlined @click='previewItem(itemFile)'/>
                    </div>
                  </div>
                  <span v-else style='color: #bfbfbf'>未上传讲解视频</span>
                </a-form-item>
                <a-form-item label="是否已完善" name="isDone">
                  <a-radio-group v-model:value="formState.isDone">
                    <a-radio :value="true" disabled>是</a-radio>
                    <a-radio :value="false" disabled>否</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-form>
            </div>
            <div v-show="activedNode.kType==='1'||activedNode.kType==='3'">
              <a-result title="该节点无功能">
              </a-result>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import CoursePreview from './course-preview'
export default CoursePreview
</script>
<style lang="less" scoped>
@import './course-preview';
</style>
