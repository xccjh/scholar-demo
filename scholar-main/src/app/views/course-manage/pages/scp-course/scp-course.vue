<template>
  <a-spin tip='加载数据渲染中' :spinning='loading' :delay='1000'>
    <div class='container'>
      <div class="header">
        <div class="title"> {{ title }}</div>
        <div>
          <a-tooltip :overlayStyle='{"max-width": "800px"}'>
            <template #title>
              能够审核的必要条件:1.不是待审核状态2.知识点状态有新增或删除
            </template>
            <a-button class="back-btn"
                      danger
                      type="primary"
                      :disabled='approveAllDisabled'
                      @click='submitReview(auditStatus === "3")'
                      :loading='loading'
            >{{auditStatus === '3' ? '重新提交' : '提交审批'}}
            </a-button>
          </a-tooltip>
          <a-button class="back-btn" type='primary' @click="goback()" :loading='loading'>保存并返回</a-button>
          <a-button class="back-btn" type='primary' v-if='curProgress!==0' @click="changeProgress(1,'prev')">上一步
          </a-button>
          <a-button class="back-btn" type='primary' v-else @click="changeProgress(-1,'next')">下一步</a-button>
        </div>
      </div>
      <div class="step">
        <a-steps v-model:current="curProgress">
          <a-step @click="changeProgress(0,'direct')">
            <template #title>课程信息</template>
          </a-step>
          <a-step @click="changeProgress(1,'direct')">
            <template #title>
              知识图谱
              <a-tooltip :overlayStyle='{"max-width": "800px"}'>
                <template #title>
                  <div>
                    第一次性导入图谱时请尽量保持图谱完整性，审批通过后不要轻易删除知识谱;
                  </div>
                  <div>删除后将会导致题库中的科目结构与课包智适应设置中的章节绑定同步进行删除</div>
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
          </a-step>
        </a-steps>
      </div>
      <div class="gap"></div>
      <div class='content'>
        <a-tabs :activeKey="tabCurProgress" :tabBarStyle="{display:'none'}">
          <a-tab-pane :key="1" tab="课包结构" force-render class='lesson-structure'>
            <a-form
              ref="formRef"
              :model="formState"
              :rules="rules"
              :label-col="{span: 4}"
              :wrapper-col="{span:20}"
              class='course-form'
            >
              <a-form-item label="课程组成员" name="courseMemberUserIdList">
                <div class='item-container'>
                  <a-tooltip v-for='(item,i) in getMemberList' :key='item.id'>
                    <template #title>{{(item.nickName ? item.nickName :'匿名' )+'('+ item.telphone +')'}}</template>
                    <div class='item-member'>
                      <div class='text-box'>
                        {{(item.nickName ? item.nickName : '匿名')}}
                      </div>
                      <div class='cross' @click='removeMember(item,i)'>
                        x
                      </div>
                    </div>
                  </a-tooltip>
                  <div class='item-member add-member' @click='addMember()'>
                    <PlusOutlined s='add-member-icon'/>
                    成员
                  </div>
                </div>
              </a-form-item>
              <a-form-item label="习题审核人员" name="exercisesAuditUserIdList">
                <div class='item-container'>
                  <a-tooltip v-for='(item,i) in getAdustList' :key='item.id'>
                    <template #title>{{(item.nickName ? item.nickName :'匿名' )+'('+ item.telphone +')'}}</template>
                    <div class='item-member'>
                      <div class='text-box'>
                        {{(item.nickName ? item.nickName : '匿名')}}
                      </div>
                      <div class='cross' @click='removeAduitMember(item,i)'>
                        x
                      </div>
                    </div>
                  </a-tooltip>
                  <div class='item-member add-member' @click='addAduitMember()'>
                    <PlusOutlined s='add-member-icon'/>
                    成员
                  </div>
                </div>
              </a-form-item>
              <a-form-item label="课程封面" name="coverPath">
                <a-upload
                  :customRequest='customRequest("scp-course/coverPath","fileList")'
                  v-model:file-list="fileList"
                  list-type="picture-card"
                  :show-upload-list="{showPreviewIcon:true,showRemoveIcon:true}"
                  :before-upload="beforeUpload"
                  class='course-upload'
                  @preview='filePreview'
                  :remove='removeCourseCover'
                >
                  <div v-if='fileList.length === 0'>
                    <plus-outlined></plus-outlined>
                    <div class="ant-upload-text">上传</div>
                  </div>
                </a-upload>
                <div style='position:absolute;top: 0;left: 112px;color:rgba(0,0,0,.45);'>
                  <div style='height: 45px;'>仅限一个，支持扩展名：jpg 、jpeg 、png</div>
                  <div>最佳设计尺寸大于640*360 ，大小小于2M</div>
                </div>
              </a-form-item>

              <a-form-item label="课程简介" name="introduction" class='scp-introduction' placeholder="请输入课程简介">
                <a-textarea v-model:value="formState.introduction" :rows="4" allowClear/>
                <span
                  :style="{'margin-left': '10px',color:formState.introduction?.length >200?'red':'inherit',float:'right'}">
                {{formState.introduction?.length || 0}}/200
              </span>
              </a-form-item>
            </a-form>
          </a-tab-pane>
          <a-tab-pane :key="2" tab="知识图谱" force-render>
            <div class='content-container'>
              <div class='top-container'>
                <a-dropdown>
                  <a-button type='primary' class='operation-button ml20'>
                    <FilterOutlined/>
                    筛选
                  </a-button>
                  <template #overlay>
                    <a-menu @click='filterKnowledgePointsClick'>
                      <a-menu-item key=''>
                        <a href="javascript:;">全部知识点</a>
                      </a-menu-item>
                      <a-menu-item key='0'>
                        <a href="javascript:;">未完善知识点</a>
                      </a-menu-item>
                      <a-menu-item key='1'>
                        <a href="javascript:;">已完成知识点</a>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>

                <a-button type='primary' class='operation-button' @click='importAtlasModal()'
                          :disabled='!!treeData[0]?.children?.length'>导入图谱
                </a-button>
                <a-button type='primary' class='operation-button' :loading='businessLoading'
                          @click='exportKnowledgeExcel()'
                          :disabled='!((!!treeData[0]?.children?.length) && auditStatus!=="1" )'>
                  导出图谱
                </a-button>
                <a-button type='primary' class='operation-button' :loading='businessLoading'
                          @click='exportKnowledgeDetail()'>
                  知识点详情导出
                </a-button>
                <a-button type='primary' class='operation-button' :loading='loading'
                          @click='resetMap()'>
                  重置图谱
                </a-button>
              </div>

              <div class="sub-container">
                <div class="left-container">
                  <div class='tree-container'>
                    <div class="search-container">
                      <a-input-search v-model:value="searchValue" style="margin-bottom: 8px" placeholder="关键词搜索"/>
                    </div>
                    <a-tree
                      draggable
                      @dragenter="onDragEnter"
                      @drop="onDrop"
                      :auto-expand-parent="autoExpandParent"
                      v-model:expandedKeys="expandedKeys"
                      style='text-align:left;transform:translateY(40px)'
                      @select='selectTree'
                      @expand="onExpand"
                      :replaceFields='{title:"name",key:"id"}'
                      :defaultExpandAll='true'
                      v-model:selectedKeys='selectedKeys'
                      :showLine='true'
                      :tree-data="treeData"
                      v-if='treeData.length'
                    >
                      <template #title='node'>
                        <span v-if="node.name?.indexOf(searchValue) > -1 && searchValue"
                              :title='node.name' :style='{cursor:node.kType==="1"?"inherit":"move"}'>
                              {{ node.name?.substr(0, node.name?.indexOf(searchValue)) }}
                               <span style="color: #f50">{{ searchValue }}</span>
                              {{ node.name?.substr(node.name?.indexOf(searchValue) + searchValue.length) }}
                        </span>
                        <span v-else>
                          <span v-if='!node.isEdit'
                                :style='{"text-decoration":node.status==="3"?"line-through":"none",cursor:node.kType==="1"?"inherit":"move"}'
                                :title='node.name'
                                class='node-title'
                          >{{ node.name }}</span>
                           <a-input v-else
                                    size="small"
                                    :style="{width:'100px'}"
                                    v-model:value="node.dataRef.editName"
                                    @pressEnter="confirmEdit(node)"
                           />
                        </span>
                        <span v-if='activedNode?.id === node.id && node.isEdit'>
                            <CheckOutlined @click="confirmEdit(node)" style='margin-left:6px;'/>
                            <CloseOutlined @click="cancelEdit(node)" style='margin-left:6px;'/>
                        </span>

                        <span class='knowledge-circle' title='该知识点未完成' v-if="(!node.isDone)&&node.kType==='4'"></span>
                        <span v-if='node.kType!=="1"&&node.status==="2"'>(新增)</span>

                        <span class='chapter-weight'
                              v-if="node.kType==='2'&&node.weight&&node.status!=='3'&&activedNode.id !== node.id"
                              :title='"该章节权重"+node.weight'>
                          {{node.weight + '/' + totalWeight}}
                        </span>

                        <span class='knowledge-star' v-if='node.kType==="4"&&activedNode.id !== node.id'>
                            <StarOutlined v-for='item in Number(node.keyLevel || 0)' :key='item'/>
                        </span>

                        <span v-if='node.status!=="3"&&activedNode?.id === node.id && !node.isEdit'>
                          <EditOutlined v-if='node.kType!=="1"' style='margin-left:6px' @click="editNode(node)"/>
                          <MinusCircleOutlined v-if='node.kType!=="1"' style='margin-left:6px' @click="delNode(node)"/>
                          <PlusCircleOutlined v-if='node.kType!=="4"' style='margin-left:6px' @click="addNode(node)"/>
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
                    />
                    <span style='margin-left:10px;'>
                实际权重 = 本章权重/ 所有章节的权重之和
              </span>
                  </div>
                  <div v-show="activedNode.kType=='4'" style="height: 100%;">

                    <a-form
                      ref="formRefKnowledge"
                      :model="formStateKnowledge"
                    >
                      <a-form-item ref="code" label="知识点编码" name="code" style='height:40px;'>
                        <div :title='formStateKnowledge.code'
                             class='knowledge-code'
                        >{{formStateKnowledge.code}}
                        </div>
                      </a-form-item>

                      <a-form-item ref="content" label="知识点定义" name="content" class='editor-container'>
                        <a-spin tip='上传资源中' :spinning='loadObj.editorOne' :delay='1000'>
                          <ckeditor :editor="ClassicEditor"
                                    :config="config" id='editor' v-model='formStateKnowledge.content'></ckeditor>
                        </a-spin>
                      </a-form-item>

                      <a-form-item label="重难点" name="keyLevel">
                        <a-radio-group v-model:value="formStateKnowledge.keyLevel">
                          <a-radio :value="1">1星</a-radio>
                          <a-radio :value="2">2星</a-radio>
                          <a-radio :value="3">3星</a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <a-form-item label="是否冲刺" name="isSprint">
                        <a-radio-group v-model:value="formStateKnowledge.isSprint">
                          <a-radio :value="true">是</a-radio>
                          <a-radio :value="false">否</a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <a-form-item label="是否巩固" name="isStable">
                        <a-radio-group v-model:value="formStateKnowledge.isStable">
                          <a-radio :value="true">是</a-radio>
                          <a-radio :value="false">否</a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <a-form-item label="是否押题" name="isFinal">
                        <a-radio-group v-model:value="formStateKnowledge.isFinal">
                          <a-radio :value="true">是</a-radio>
                          <a-radio :value="false">否</a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <a-form-item label="知识点状态" name="opsType">
                        <a-radio-group v-model:value="formStateKnowledge.opsType">
                          <a-radio :value="0">不变</a-radio>
                          <a-radio :value="1">新增</a-radio>
                          <a-radio :value="2">变更</a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <a-form-item label="讲解视频" name="explanationVideo">
                        <a-button type="primary" style='margin:0 20px 0 0;'
                                  @click='uploadExplanationVideo("polywayFrom")'>保利威
                        </a-button>
                        <a-button type="primary" @click='uploadExplanationVideo("localVideoFrom")'>本地上传</a-button>
                        <div class='list-video'>
                          <draggable v-model="formStateKnowledge.explanationVideo"
                                     tag="transition-group"
                                     :component-data="{
                                        type: 'transition-group',
                                      }"
                                     v-bind='{
                                      animation: 200,
                                      group: "description",
                                      disabled: false,
                                      ghostClass: "ghost"
                                     }'
                                     item-key="id"
                                     @end='formStateKnowledge.explanationVideo.forEach((item, i) => (item.seq = i))'>
                            <template #item="{element}">
                              <div class='item-left'>
                                <div class="item-text">
                                  <a-tooltip>
                                    <template #title>{{element.attachmentName}}</template>
                                    <img :src="getPreview(element.attachmentPath)"
                                         :class='{br5:isPicture(element.attachmentPath),"img-dec":true}'
                                         @click='previewItem(element)'>
                                  </a-tooltip>
                                  <a-tooltip>
                                    <template #title>{{element.attachmentName}}</template>
                                    <span class='img-desc'>
                                    {{element.attachmentName}}
                                  </span>
                                  </a-tooltip>
                                </div>
                                <EditOutlined @click='editFileItem(element)'/>
                                <EyeOutlined @click='previewItem(element)'/>
                                <CloseCircleOutlined @click='removeFileItem(element,"explanationVideo")'/>
                              </div>
                            </template>
                          </draggable>
                        </div>
                      </a-form-item>
                      <a-form-item label="学习资料" name="learningMaterials">
                        <a-upload
                          :customRequest='customRequest("course/learningMaterials","learningMaterialsFileList")'
                          v-model:file-list="learningMaterialsFileList"
                          list-type="picture-card"
                          :show-upload-list="false"
                          accept='.jpg,.jpeg,.png,.bmp,.xls,.xlsx,.docx,.pdf,.doc,.pptx,.ppt,.mp3,.mp4'
                          class='course-upload'
                          @change='handelChange'
                          multiple
                          :disabled='disableLearningMaterialsFileUpload'
                        >
                          <div v-if='learningMaterialsFileList.length===0'>
                            <plus-outlined></plus-outlined>
                            <div class="ant-upload-text">上传</div>
                          </div>
                          <div v-else>
                            <div v-for='item in learningMaterialsFileList' :key='item.uid'>
                              <a-progress :percent="Number(item.percent)" size="small" status="active"
                                          v-if='item.percent>0'/>
                            </div>
                          </div>
                        </a-upload>
                        <div class='list-video mt0'>
                          <draggable v-model="formStateKnowledge.learningMaterials"
                                     tag="transition-group"
                                     :component-data="{
                                        type: 'transition-group',
                                      }"
                                     v-bind='{
                                      animation: 200,
                                      group: "description",
                                      disabled: false,
                                      ghostClass: "ghost"
                                     }'
                                     item-key="id"
                                     @end='formStateKnowledge.learningMaterials.forEach((item, i) => (item.seq = i))'>
                            <template #item="{element}">
                              <div class='item-left'>
                                <div class="item-text">
                                  <a-tooltip>
                                    <template #title>{{element.attachmentName}}</template>
                                    <img :src="getPreview(element.attachmentPath)"
                                         :class='{br5:isPicture(element.attachmentPath),"img-dec":true}'
                                         @click='previewItem(element)'>
                                  </a-tooltip>
                                  <a-tooltip>
                                    <template #title>{{element.attachmentName}}</template>
                                    <span class='img-desc'>
                                    {{element.attachmentName}}
                                  </span>
                                  </a-tooltip>
                                </div>
                                <!--                                <EditOutlined @click='editFileItem(element)'/>-->
                                <EyeOutlined @click='previewItem(element)'/>
                                <CloseCircleOutlined @click='removeFileItem(element,"learningMaterials")'/>
                              </div>
                            </template>
                          </draggable>
                        </div>
                      </a-form-item>
                      <a-form-item label="是否已完善" name="isDone">
                        <a-radio-group v-model:value="formStateKnowledge.isDone">
                          <a-radio :value="true">是</a-radio>
                          <a-radio :value="false">否</a-radio>
                        </a-radio-group>
                      </a-form-item>
                      <a-form-item label="重置知识点" >
                        <a-button type='primary' :loading='loading'
                                  @click='resetKnowledges()'>
                          重置
                        </a-button>
                      </a-form-item>
                    </a-form>
                  </div>
                  <div v-show="activedNode.kType==='1'||activedNode.kType==='3'">
                    <a-result title="该节点无功能">
                    </a-result>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
        <a-modal v-model:visible="importAtlasVisible"
                 title="导入图谱"
                 :maskClosable='false'
                 @cancel='importAtlasCancel()'
                 @ok='importAtlasComfirm()'
                 :confirmLoading='loading || knowledgeExcelUploading'
                 :closable='true'
                 okText='确定上传'
                 :width='520'
                 wrapClassName='member-modal'
                 :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
        >
          <div style='position:relative;padding-bottom:30px;'>
            <span style='color:red;margin:0 5px;'>*</span><span style='margin-right:12px;'>知识图谱</span>
            <a-upload
              class='import-atlas-upload'
              list-type="picture"
              v-model:file-list="importAtlasFileList"
              name="importAtlasFileList"
              :customRequest='customRequest("course/importAtlas","importAtlasFileList")'
              accept='.xls,.xlsx'
              :show-upload-list='{showRemoveIcon:true}'
            >
              <a-button :disabled='disableImportAtlasFileList'
                        :loading='loading'
              >
                <UploadOutlined/>
                上传文件
              </a-button>
            </a-upload>
            <a-button @click="templateDownload"
                      style='position: absolute;top: 0;left: 216px;'
                      :loading='loading'
            >
              <DownloadOutlined/>
              模板下载
            </a-button>
            <span style='position:absolute;left:96px;top:42px;'>只有知识图谱为空时才能上传图谱</span>
            <a-progress :percent="knowledgeExcelUploadPercent" status="active" v-if='knowledgeExcelUploading'/>
          </div>
        </a-modal>

        <a-modal v-model:visible="courseStaffVisible"
                 title="添加课程组成员"
                 :maskClosable='false'
                 @cancel='courseCancel()'
                 :closable='true'
                 :width='798'
                 :footer='null'
                 wrapClassName='member-modal'
                 :bodyStyle='{padding:0,"overflow": "hidden",maxHeight:"600px"}'
        >
          <div class='button-operating'>
            <a-input v-model:value="courseKey" placeholder="请输入关键字" class='button-input' allowClear
                     @pressEnter='courseSearch()'/>
            <a-button @click='courseSearch()' class='button-seach' type='primary'>搜索</a-button>
          </div>
          <div class='item-member-container'>
            <a-tooltip v-for='(option,i) in roleArrBak' :key='option.id'>
              <template #title>{{(option.nickName ? option.nickName :'匿名' )+'('+ option.telphone+')'}}</template>
              <div class='item-member'
                   @click='itemSelectInner(option,i)'
                   :class='{select:option.isSelected}'>
                {{(option.nickName ? option.nickName : '匿名')}}
              </div>
            </a-tooltip>
          </div>
          <div class='button-container'>
            <a-button @click="courseCancel()" class='cancel'>取消</a-button>
            <a-button @click="courseComfirm()" type='primary' class='comfirm'>确定</a-button>
          </div>
        </a-modal>

        <a-modal v-model:visible="aduitStaffVisible"
                 title="添加习题审核人员"
                 :maskClosable='false'
                 @cancel='auditCancel()'
                 wrapClassName='member-modal'
                 :closable='true'
                 :width='798'
                 :footer='null'
                 :bodyStyle='{padding:0,"overflow": "hidden",maxHeight:"600px"}'
        >
          <div class='button-operating'>
            <a-input v-model:value="aduitKey" placeholder="请输入关键字" class='button-input' allowClear
                     @pressEnter='AduitSearch()'/>
            <a-button @click='AduitSearch()' class='button-seach' type='primary'>搜索</a-button>
          </div>
          <div class='item-member-container'>
            <div class='item-content' v-for='(itemP) in nodesBak' :key='itemP.id'>
              <div class='item-label'>
                <span @click='clickAduit(itemP)' class='label-text'>{{itemP.name}}</span>
                <DownOutlined class='up-icon' v-if='!itemP.expand' @click='clickAduit(itemP)'/>
                <UpOutlined class='down-icon' v-if='itemP.expand' @click='clickAduit(itemP)'/>
              </div>
              <a-tooltip v-for='(option) in itemP.teacherList' :key='option.id'>
                <template #title v-if='itemP.expand'>{{(option.nickName ? option.nickName :'匿名' )+'('+ option.telphone
                  +')'}}
                </template>
                <div class='item-member' v-if='itemP.expand'
                     @click='aduitItemSelectInner(option,itemP)'
                     :class='{select:option.isSelected}'>
                  {{(option.nickName ? option.nickName : '匿名')}}
                </div>
              </a-tooltip>
            </div>
          </div>
          <div class='button-container'>
            <a-button @click="auditCancel()" class='cancel'>取消</a-button>
            <a-button @click="auditComfirm()" type='primary' class='comfirm'>确定</a-button>
          </div>
        </a-modal>

        <a-modal
          v-model:visible="localUploadvisible"
          title="本地上传"
          :maskClosable='false'
          @cancel='localUploadvisible=false;localVideoFromRef.clearValidate()'
          @ok='confirmUpload("localVideoFrom")'
        >
          <a-form
            ref="localVideoFromRef"
            :model="localVideoFrom"
            :wrapper-col="{ span: 18 }"
            :label-col="{ span: 6 }"
            :rules="localVideoFromRules"
          >
            <a-form-item ref="attachmentPath" name="attachmentPath" hasFeedback label='视频' :colon='true' required>
              <a-upload
                :customRequest='customRequest("course/localVideo","localVideoFileList")'
                v-model:file-list="localVideoFileList"
                list-type="picture-card"
                accept='.mp4'
                :show-upload-list="{showPreviewIcon:true,showRemoveIcon:true}"
                class='course-upload'
                @preview='filePreview'
              >
                <div v-if='localVideoFileList.length === 0'>
                  <plus-outlined></plus-outlined>
                  <div class="ant-upload-text">上传</div>
                </div>

              </a-upload>
              <div style='margin-top:-20px;'>(支持mp4视频类型,注意不要重名)</div>
            </a-form-item>
            <a-form-item ref="attachmentName" name="attachmentName" hasFeedback label='视频名称' :colon='true' required>
              <a-input v-model:value="localVideoFrom.attachmentName" placeholder="请填写视频名称"
                       @keyup.enter="confirmUpload('localVideoFrom')">
              </a-input>
            </a-form-item>
          </a-form>
        </a-modal>

        <a-modal
          v-model:visible="polywayVisible"
          title="保利威上传"
          :maskClosable='false'
          @cancel='polywayVisible=false;polywayFromRef.clearValidate()'
          @ok='confirmUpload("polywayFrom")'
        >
          <a-form
            ref="polywayFromRef"
            :model="polywayFrom"
            :rules="polywayFromRules"
            :wrapper-col="{ span: 18 }"
            :label-col="{ span: 6 }"
          >
            <a-form-item name="attachmentPath" label='视频ID' hasFeedback :colon='true' required>
              <a-input v-model:value="polywayFrom.attachmentPath" placeholder="请填写视频ID"
                       @keyup.enter="confirmUpload('polywayFrom')">
              </a-input>
            </a-form-item>
            <a-form-item name="attachmentName" hasFeedback label='视频名称' :colon='true' required>
              <a-input v-model:value="polywayFrom.attachmentName" placeholder="请填写视频名称"
                       @keyup.enter="confirmUpload('polywayFrom')">
              </a-input>
            </a-form-item>
          </a-form>
        </a-modal>

      </div>
    </div>
  </a-spin>
</template>

<script lang="ts">
import ScpCourse from './scp-course'

export default ScpCourse
</script>
<style lang="less" scoped>
  @import "./scp-course";
</style>
