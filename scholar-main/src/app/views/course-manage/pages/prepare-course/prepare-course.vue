<template>
  <a-spin tip='加载数据渲染中' :spinning='loading' :delay='1000'>
    <div class='container'>
      <div class='label-left' v-if='packetTags'>
        <div class='label-title'>{{packetTags.slice(0,2)}}</div>
        <div class='label-title'>{{packetTags.slice(2,4)}}</div>
      </div>
      <div :class='{pl82:packetTags && teachType==="22",header:true ,pl100:packetTags && teachType!=="22"}'>
        <div>
          <span class="title"> {{ name }}</span>
          <a-tooltip :overlayStyle='{"max-width": "525px"}'>
            <template #title>
              <div>1）课包结构是划分课程的基础，可根据课程的实际情况进行课包章节划分</div>
              <div>2）根据课包的不同类型，对课包的不同小节配置讲义、录播、任务、资料内容</div>
              <div>3）其他设置可以对课包设置总课次，教学示范、免费子题库的配置</div>
              <div>4）是否对课包开启智适应，如果开启智适应，需完成智适应基础信息设置</div>
              <div>5）预览课包统计信息，提交审批</div>
            </template>
            <QuestionCircleOutlined class='font-question-fill'/>
          </a-tooltip>
          <a-tag v-if="teachType==='22'" color="#87d068">录播</a-tag>
          <a-tag v-if="teachType==='21'" color="#e59f37">直播</a-tag>
          <a-tag v-if="teachType==='12'" color="#2db7f5">双师</a-tag>
          <a-tag v-if="teachType==='11'" color="#2dac7d">面授</a-tag>
          <a-tag v-if="status==='0'" color="#108ee9">草稿</a-tag>
          <a-tag v-if="status==='1'" color="magenta">标准</a-tag>
        </div>
        <div>
          <a-button class="back-btn"
                    type='primary'
                    danger
                    :disabled='approveAllDisabled'
                    v-if='approveAllShow'
                    @click='submitReview()'
                    :loading='loading'
          >{{auditStatus === '3' ? '重新提交' : '提交审批'}}
          </a-button>
          <a-button class="back-btn" type='primary' v-if='curProgress!==0' @click="changeProgress(1,'prev')">上一步
          </a-button>
          <a-button class="back-btn" type='primary' v-if='teachType==="22"? curProgress!==2 : curProgress!==3'
                    @click="changeProgress(-1,'next')">下一步
          </a-button>
          <a-button class="back-btn" type='primary' @click="goback()" :loading='loading'>返回</a-button>
        </div>
      </div>
      <div class="step">
        <a-steps v-model:current="curProgress">
          <a-step @click="clickProgress(0,'direct')">
            <template #title>
              课包结构
              <a-tooltip :overlayStyle='{"max-width": "255px"}'>
                <template #title>
                  课包结构为对学员的展示的课程结构；审批通过后将不能修改课包结构
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
          </a-step>
          <a-step @click="clickProgress(1,'direct')">
            <template #title>
              学习设置
              <a-tooltip :overlayStyle='{"max-width": "600px"}'>
                <template #title>
                  学习设置需要根据课包结构对不同小节设置：讲义、录播、任务、资料等内容
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
          </a-step>
          <a-step @click="clickProgress(2,'direct')" v-if="teachType!=='22'">
            <template #title>
              课次设置
              <a-tooltip :overlayStyle='{"max-width": "600px"}'>
                <template #title>
                  课次设置需要设置课包的总课次，讲师将按照总课次完成课包的教学
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
          </a-step>
          <a-step @click="clickProgress(teachType!=='22' ? 3:2,'direct')">
            <template #title>
              其他设置
              <a-tooltip :overlayStyle='{"max-width": "600px"}'>
                <template #title>
                  其他设置包括闯关、配套题库、实训、智适应四个模块，根据课包需要进行相关设置即可。
                </template>
                <QuestionCircleOutlined class='font-question'/>
              </a-tooltip>
            </template>
          </a-step>
        </a-steps>
      </div>
      <div class="gap"></div>
      <div class='content'>
        <a-tabs v-model:activeKey="tabCurProgress" :tabBarStyle="{display:'none'}">
          <a-tab-pane :key="1" tab="课包结构">
            <div class='content-container'>
              <div class='top-container'>
                <a-button type='primary'
                          class='operation-button'
                          :loading='loading'
                          @click='chapterStructureVisible=true'
                          v-if='preview==="0"&&Number(isUsed) <= 0'
                >excel导入章节
                </a-button>
                <a-button type='primary'
                          class='operation-button'
                          :loading='loading'
                          @click='knowledgeGraphImport()'
                          v-if='preview==="0"&&Number(isUsed) <= 0'
                >
                  知识图谱导入章节
                </a-button>
                <a-button type='primary'
                          class='operation-button'
                          :loading='businessLoading'
                          @click='chapterExport()'
                          v-if='preview==="0"'
                >
                  章节导出
                </a-button>

              </div>
              <div class="sub-container">
                <draggable component="a-collapse"
                           :component-data="{
                                          props:{
                                              activeKey: chapterStructureActiveKey,
                                              style:{'width':'100%','height':'max-content','text-align': 'left'},
                                              'onUpdate:activeKey':(value)=> {chapterStructureActiveKey = value},
                                              'onChange': openSection,
                                          }
                            }"
                           :move='()=>(preview!=="1")'
                           :list='chapterStructureData'
                           @change='chapterStructureDrag'>
                  <a-collapse-panel :key="chapter.id" v-for='(chapter,idx) in chapterStructureData'>
                    <template #header>
                                          <span
                                            :style='{"cursor":(isUsed <=0 && preview==="0")?"inherit":"not-allowed"}'>
                                                <span style="margin-right: 20px;">第{{ idx + 1}}章</span>
                                                <span>{{ chapter.name}}</span>
                                          </span>
                    </template>
                    <template #extra>
                      <a @click="$event.stopPropagation();addChapter(chapter);" v-if="preview==='0'"
                         :style="{ color: '#40a9ff', 'margin-left': '20px'}">
                        <EditOutlined/>
                        重命名
                      </a>
                      <a :style="{ color: '#f53131', 'margin-left': '20px'}"
                         @click="$event.stopPropagation();delChapter(chapter);"
                         v-if="isUsed <=0&&preview==='0'">
                        <DeleteOutlined/>
                        删除
                      </a>
                    </template>
                    <div class="list"
                         :style='{cursor:(isUsed <=0&&preview==="0")?"inherit":"not-allowed"}'>

                      <draggable
                        :list="chapter.children"
                        @change="sectionStructureDrag"
                        :group='{name:"section"}'
                        :move='()=>(preview!=="1")'
                      >
                        <div class="list-item"
                             v-for="(section,sectionIdx) in chapter.children"
                             :style='{cursor:(isUsed <=0&&preview==="0")?"inherit":"not-allowed"}'
                             :key='section.id'>
                          <div>
                            <span style="margin-right: 20px;">{{ idx + 1}}.{{ sectionIdx + 1 }}节</span><span>{{ section.name}}</span>
                          </div>
                          <div class="action-group">
                            <a-button type='link' v-if='preview==="0"' @click="addSection(chapter, section)">
                              <EditOutlined/>
                              重命名
                            </a-button>
                            <a-button type='link' v-if='isUsed <=0&&preview==="0"' @click="delSection(chapter, section)"
                                      :style="{ color: '#f53131'}">
                              <DeleteOutlined/>
                              删除
                            </a-button>
                          </div>
                        </div>
                      </draggable>

                      <div class="add-section" v-if='isUsed <=0&&preview==="0"'>
                        <div>
                          <a-button type='link' @click="addSection(chapter, null)">
                            <PlusOutlined/>
                            添加小节
                          </a-button>
                        </div>
                        <div></div>
                      </div>
                    </div>
                  </a-collapse-panel>
                </draggable>
                <a-button v-if="isUsed <=0&&preview==='0'" type="primary" size="large" block
                          @click="addChapter(null)">
                  <PlusOutlined/>
                  新增章
                </a-button>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane :key="2" tab="学习设置">
            <div class='learnset-content-container'>
              <div class='left-container'>
                <div class='title tl'>章节结构</div>
                <a-tree
                  class='fix-title'
                  v-model:selectedKeys='learnsetSelectedKeys'
                  v-model:expandedKeys="learnsetExpandedKeys"
                  @select='learnsetTreeNodeClick'
                  @expand='learnsetTreeNodeExpand'
                  style='text-align:left'
                  :tree-data="learnsetTreeData"
                  v-if='learnsetTreeData.length'
                >
                </a-tree>
              </div>
              <div class='right-container'>
                <span class='title tl'>{{currentLearnSetSection.title}}</span>
                <a-button type="primary" v-if='teachType==="22" && preview === "0"'
                          @click='learnSetVideoImportVisible=true'
                          style='float:right;margin-right:15px;'
                >导入视频
                </a-button>

                <div class="learnset-right">
                  <a-collapse v-model:activeKey='lectureActiveKey' v-if='teachType!=="22"'
                              :style="{'width':'100%','height':'max-content','text-align': 'left'}">
                    <a-collapse-panel key="0">
                      <template #header>
                             <span>
                                讲义
                               <a-tooltip :overlayStyle='{"max-width": "770px"}'>
                                  <template #title>
                                    <div>讲义主要提供给讲师给学员上课使用：</div>
                                    <div>1、建议优先WPS制作PPT ；</div>
                                    <div>2、尽量少用第三模板；</div>
                                    <div>3、PPT的文件大小应控制在100M之内；</div>
                                  </template>
                                  <QuestionCircleOutlined class='font-question'/>
                                </a-tooltip>
                              </span>
                      </template>

                      <div class="list">
                        <draggable
                          :move='()=>(preview!=="1")'
                          v-if="preview==='0'||handoutsLecture.length"
                          :list="handoutsLecture"
                          @change="sectionDrop($event,'1')"
                        >
                          <div class="list-item" v-for="(lecture,lectureI) in  handoutsLecture" :key='lecture.id'>
                            <a-tooltip :title='lecture.attachmentName'>
                              <span class="title" :title="lecture.attachmentName">
                               <a-avatar :size="20" style="vertical-align: middle;background-color:#ea5c6c">讲</a-avatar>
                                {{ lecture.attachmentName }}
                              </span>
                            </a-tooltip>
                            <div class='other-container-main' v-if='preview==="0"'>
                                <span>
                                  <a-checkbox v-model:checked="lecture.isMainFile"
                                              :disabled='disableMainLecture(lecture)'
                                              @change='mainFileChange($event, lecture)'
                                  >主讲义</a-checkbox>
                                </span>
                            </div>
                            <select class='other-container' v-model="lecture.downloadType"
                                    v-if='lecture.attachmentPath'
                                    :disabled='preview==="1"'
                                    @change="downloadChange($event.target.value, lecture)">
                              <option value="0">不可下载</option>
                              <option value="1">讲师可下载</option>
                            </select>
                            <a-spin :spinning="!!mainFileAssociatLoading[lectureI]" tip='查询主讲义信息中...' :delay='1000'>
                              <div class="action-group">
                                <a-button type="link" class='pr0' @click="learnSetPreview(lecture)">
                                  <EyeOutlined/>
                                  预览
                                </a-button>
                                <a-button type="link" class='pr0' @click="learnSetDownLoad(lecture)"
                                          v-if='lecture.attachmentPath&&lecture.attachmentPath.indexOf(".")>0&&lecture.attachmentPath.indexOf("//")===-1'>
                                  <DownloadOutlined/>
                                  下载
                                </a-button>
                                <a-spin :spinning="!!mainFileAssociatLoading[mainFileAssociatLoading]" :delay='1000'>
                                  <a-button type="link" class='pr0' @click="mainFileAssociate(lecture,lectureI)"
                                            v-if='showMainFileAssociate(lecture)'>
                                    <DisconnectOutlined/>
                                    关联
                                  </a-button>
                                </a-spin>
                                <a-button type="link" class='pr0' style="color: #f53131" @click="delLearnSet(lecture)"
                                          v-if='preview==="0"'>
                                  <DeleteOutlined/>
                                  删除
                                </a-button>
                              </div>
                            </a-spin>
                          </div>
                          <div class="add-section" v-if='preview==="0"'>
                            <div>
                              <a-button type="primary" size="small" :style="{'margin-right': '10px'}"
                                        @click="callSchoolEnterpriseLib('read','101')">阅读库调用
                              </a-button>
                              <a-button type="primary" size="small" @click="uploadLocal('101')">本地上传</a-button>
                            </div>
                          </div>
                        </draggable>
                        <span v-else>没有讲义内容</span>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                  <a-collapse v-model:activeKey='recordActiveKey' v-if='teachType==="22"'
                              :style="{'width':'100%','height':'max-content','text-align': 'left'}">
                    <a-collapse-panel key="1">
                      <template #header>
                        录播
                      </template>
                      <div class="list">
                        <draggable
                          :move='()=>(preview!=="1")'
                          v-if="preview==='0'||handoutsRecording.length"
                          :list="handoutsRecording"
                          @change="sectionDrop($event,'2')"
                        >
                          <div class="list-item" v-for="record in  handoutsRecording" :key='record.id'>
                            <a-tooltip :title='record.attachmentName'>
                               <span class="title">
                                   <a-avatar :size="20"
                                             style="vertical-align: middle;background-color:#675dca">视</a-avatar>
                                    {{ record.attachmentName }}
                               </span>
                            </a-tooltip>
                            <span
                              style='margin-left: 10px;color:#1890ff;vertical-align: top;'>{{record.authorName}}</span>
                            <div class="action-group">
                              <a-button type="link" class='pr0' @click="editRecord(record)" v-if='preview==="0"'>
                                <EditOutlined/>
                                编辑
                              </a-button>
                              <a-button type="link" class='pr0' @click="previewTask(record)">
                                <EyeOutlined/>
                                预览
                              </a-button>
                              <a-button type="link" class='pr0' style="color: #f53131"
                                        @click="delLearnSet(record)"
                                        v-if='preview==="0"'>
                                <DeleteOutlined/>
                                删除
                              </a-button>
                            </div>
                          </div>
                          <div class="add-section" v-if='preview==="0"'>
                            <div>
                              <a-button type="primary" size="small" @click="videoUpload('polyway')"
                                        style='margin-right:15px;'>
                                保利威视频
                              </a-button>
                              <a-button type="primary" size="small" @click="videoUpload('showInteraction')"
                                        style='margin-right:15px;'>
                                展示互动视频
                              </a-button>
                              <a-button type="primary" size="small" @click="videoUpload('localVideo')"
                                        style='margin-right:15px;'>
                                上传视频
                              </a-button>
                            </div>
                          </div>
                        </draggable>
                        <span v-else>没有视频内容</span>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                  <a-collapse v-model:activeKey='taskActiveKey' v-if='teachType!=="22"'
                              :style="{'width':'100%','height':'max-content','text-align': 'left'}">
                    <a-collapse-panel key="2">
                      <template #header>
                             <span>
                                任务
                               <!--                               <a-tooltip :overlayStyle='{"max-width": "770px"}'>-->
                               <!--                                  <template #title>-->
                               <!--                                    <div>每个小节下的独立任务不能超过3个</div>-->
                               <!--                                    <div>未被主讲义绑定的任务为独立任务</div>-->
                               <!--                                  </template>-->
                               <!--                                  <QuestionCircleOutlined class='font-question'/>-->
                               <!--                                </a-tooltip>-->
                              </span>
                      </template>
                      <div class="list">
                        <draggable
                          v-if="preview==='0'||taskList.length"
                          :list="taskList"
                          :move='()=>(preview!=="1")'
                          @change="sectionDrop($event,'3')"
                        >
                          <div class="list-item" v-for="task in  taskList" :key='task.id'>
                            <div class="title">
                              <a-tooltip :title='getTaskTitle(task)'>
                                  <span
                                    class='title-name'
                                    :style='{"max-width":getWidth(task)}'>
                               <a-avatar :size="20"
                                         shape='circle'
                                         :style="{ 'background-color': getColor(task.taskType),'vertical-align': 'middle' }"
                               >{{getText(task.taskType)}}</a-avatar>
                              {{ task.name }}
                              </span>
                                <span style='color:#33ade7' v-if='showExamType(task)'>{{getExamText(task)}}</span>
                                <span style='color:#33ade7'
                                      v-if='showJobType(task)'>{{getTaskFormText(task.taskForm)}}</span>
                                <span style='color:#a951fb' v-if='showCheck(task)'>【考核】</span>
                                <span style="color:red;min-width:56px;vertical-align: top;"
                                      v-if='showBind(task)'>【已绑】</span>
                              </a-tooltip>
                            </div>
                            <select class='other-container'
                                    v-model="task.downloadType"
                                    v-if='task.attachmentPath'
                                    :disabled='preview==="1"'
                                    @change="downloadChange($event.target.value, task,true)">
                              <option value="0">不可下载</option>
                              <option value="1">讲师可下载</option>
                              <option value="2">讲师+学生可下载</option>
                            </select>

                            <div style='min-width: 100px;height: 10px;'
                                 v-else></div>

                            <select v-model="task.gradeType"
                                    :class='
                                    {"disable-select":preview==="1" || exerciseType ==="1" || task.taskType==="4","other-container":true}'
                                    :disabled='preview==="1" || exerciseType ==="1" || task.taskType==="4"'
                                    v-if='task.taskType==="2" || task.taskType==="4"'
                                    @change="gradeTypeChange($event.target.value, task)">
                              <option value="1">学生自评</option>
                              <option value="2">老师批改</option>
                            </select>

                            <select v-model="task.isGrade"
                                    class='other-container'
                                    :disabled='preview==="1"'
                                    v-if='task.taskType==="1"'
                                    @change="isGradeChange($event.target.value, task)">
                              <option value="0">不评分</option>
                              <option value="1">需评分</option>
                            </select>

                            <div style='min-width: 100px;' v-if='task.taskType==="0"' class='other-container-main'>
                              <a-checkbox v-model:checked="task.isSummary"
                                          :disabled='preview==="1"'
                                          @change='isSummaryChange($event, task)'
                              >总结视频
                              </a-checkbox>
                            </div>

                            <div style='min-width: 100px;height: 10px;'
                                 v-if='
                                       !(task.taskType==="2" || task.taskType==="4" )
                                       &&
                                       !(task.taskType==="1")
                                       && task.taskType!=="0"
                                      '></div>

                            <a-button
                              class="other-button"
                              v-if='(task.taskType==="4" || task.taskType==="6" || task.taskType==="7")&&preview==="0"'
                              type="primary"
                              @click='examSetting(task)'>
                              {{(task.taskType === '4') ? '考试设置' : '权限设置'}}
                            </a-button>

                            <div class="action-group">
                              <a-button type="link" class='pr0' @click="previewTask(task)">
                                <EyeOutlined/>
                                预览
                              </a-button>
                              <a-button type="link" class='pr0' @click="learnSetEdit(task)"
                                        v-if='(task.taskType==="4"||task.taskType==="2"||task.taskType==="6"||task.taskType==="7")&&preview==="0"'>
                                <EditOutlined/>
                                编辑
                              </a-button>
                              <a-button type="link" class='pr0' @click="learnSetDownLoad(task)"
                                        v-if='task.attachmentPath&&task.attachmentPath.indexOf(".")>-1&&task.attachmentPath.indexOf("//")===-1&&task.taskType==="0"'>
                                <DownloadOutlined/>
                                下载
                              </a-button>
                              <a-button type="link" class='pr0' style="color: #f53131"
                                        @click="delLearnSet(task,true)"
                                        v-if='preview==="0"'>
                                <DeleteOutlined/>
                                删除
                              </a-button>
                            </div>
                          </div>
                          <div class="add-section" v-if='preview==="0"'>
                            <div>
                              <a-button type="primary" size="small" :style="{'margin-right': '10px'}"
                                        @click="callSchoolEnterpriseLib('read','1')">阅读库调用
                              </a-button>
                              <a-button type="primary" size="small" :style="{'margin-right': '10px'}"
                                        @click="callSchoolEnterpriseLib('case','1')">案例库调用
                              </a-button>
                              <a-dropdown>
                                <template #overlay>
                                  <a-menu @click="questionOrEvaluationCall">
                                    <a-menu-item key='questionnaireType'>
                                      问卷调用
                                    </a-menu-item>
                                    <a-menu-item key='evaluationType'>
                                      测评调用
                                    </a-menu-item>
                                  </a-menu>
                                </template>
                                <a-button type='primary' size="small" :style="{'margin-right': '10px'}">
                                  <PlusOutlined/>
                                  问卷调研
                                  <DownOutlined/>
                                </a-button>
                              </a-dropdown>
                              <a-dropdown>
                                <template #overlay>
                                  <a-menu @click="jobOperate">
                                    <a-menu-item key='0'>
                                      新增作业
                                    </a-menu-item>
                                    <a-menu-item key='1'>
                                      选择作业
                                    </a-menu-item>
                                  </a-menu>
                                </template>
                                <a-button type='primary' size="small" :style="{'margin-right': '10px'}">
                                  <PlusOutlined/>
                                  练习作业
                                  <DownOutlined/>
                                </a-button>
                              </a-dropdown>
                              <a-dropdown>
                                <template #overlay>
                                  <a-menu @click="examOperate">
                                    <a-menu-item key='0'>
                                      新增组卷
                                    </a-menu-item>
                                    <a-menu-item key='1'>
                                      选择试卷
                                    </a-menu-item>
                                  </a-menu>
                                </template>
                                <a-button type='primary' size="small" :style="{'margin-right': '10px'}">
                                  <PlusOutlined/>
                                  考试任务
                                  <DownOutlined/>
                                </a-button>
                              </a-dropdown>
                              <a-button type="primary" size="small" @click="uploadLocal('104')">
                                <UploadOutlined/>
                                本地上传
                              </a-button>
                            </div>
                          </div>
                        </draggable>
                        <span v-else>没有讲义内容</span>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                  <a-collapse v-model:activeKey='materialActiveKey'
                              :style="{'width':'100%','height':'max-content','text-align': 'left'}">
                    <a-collapse-panel key="3">
                      <template #header>
                             <span>
                                资料
                               <a-tooltip :overlayStyle='{"max-width": "770px"}'>
                                  <template #title>
                                    <div>主动发送给学员学习的资源</div>
                                  </template>
                                  <QuestionCircleOutlined class='font-question'/>
                                </a-tooltip>
                              </span>
                      </template>
                      <div class="list">
                        <draggable
                          :move='()=>(preview!=="1")'
                          v-if="preview==='0'||handoutsMaterial.length"
                          :list="handoutsMaterial"
                          @change="sectionDrop($event,'4')"
                        >
                          <div class="list-item" v-for="material in  handoutsMaterial" :key='material.id'>
                            <a-tooltip :title='material.attachmentName'>
                               <span class="title" :title="material.attachmentName">
                                   <a-avatar :size="20"
                                             style="vertical-align: middle;background-color:#34bbc7">资</a-avatar>
                                    {{ material.attachmentName }}
                               </span>
                            </a-tooltip>

                            <select class='other-container' v-model="material.downloadType"
                                    v-if='material.attachmentPath'
                                    :disabled='preview==="1"'
                                    @change="downloadChange($event.target.value, material)">
                              <option value="0">不可下载</option>
                              <option value="1">讲师可下载</option>
                              <option value="2">讲师+学生可下载</option>
                            </select>

                            <div class="action-group">
                              <a-button type="link" class='pr0' @click="previewTask(material)">
                                <EyeOutlined/>
                                预览
                              </a-button>
                              <a-button type="link" class='pr0' @click="learnSetDownLoad(material)"
                                        v-if='material.attachmentPath&&material.attachmentPath.indexOf(".")>0&&material.attachmentPath.indexOf("//")===-1'>
                                <DownloadOutlined/>
                                下载
                              </a-button>
                              <a-button type="link" class='pr0' style="color: #f53131"
                                        @click="delLearnSet(material)"
                                        v-if='preview==="0"'>
                                <DeleteOutlined/>
                                删除
                              </a-button>
                            </div>
                          </div>
                          <div class="add-section" v-if='preview==="0"'>
                            <div>
                              <a-button type="primary" size="small" :style="{'margin-right': '10px'}"
                                        @click="callSchoolEnterpriseLib('read','102')">阅读库调用
                              </a-button>
                              <a-button type="primary" size="small" @click="uploadLocal('102')">
                                <UploadOutlined/>
                                本地上传
                              </a-button>
                            </div>
                          </div>
                        </draggable>
                        <span v-else>没有资料内容</span>
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                </div>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane :key="3" tab="课次设置" v-if="teachType!=='22'">
            <div class='course-setting-item'>
               <span class='item-label'>
              总课次：
               </span>
              <a-input-number
                v-model:value="lessonCount"
                :min="1" :step="1" :max='200'
                :disabled='preview==="1"|| (Number(isUsed)>0 && userId!==majorLeaderId)'
              ></a-input-number>
              <a-button type="primary"
                        @click="generateLessons()"
                        :disabled='Number(isUsed)>0  || preview==="1"'
                        style='margin-left:20px'
                        :loading='loading'>
                生成课次
              </a-button>
              <a-button type="primary" @click="newLessons()"
                        :loading='loading'
                        :disabled='((Number(isUsed)>0&&userId!==majorLeaderId)  || preview==="1")'
                        style='margin-left:20px'>
                新增课次
              </a-button>
            </div>
            <div class='table-container'>
              <a-table :data-source="listOfDataTable" style='margin:0 60px;' :loading='loading' :scroll='{y: "100%"}'>
                <a-table-column key="index"
                                title='课次序号'
                                data-index="index">
                  <template #default="{ text }">
                    <span class='synopsis-text'>
                      {{ text }}
                    </span>
                  </template>
                </a-table-column>

                <a-table-column key="name"
                                title='名称'
                                data-index="name">
                  <template #default="{ text }">
                    <span class='synopsis-text'>
                      {{ text }}
                    </span>
                  </template>
                </a-table-column>

                <a-table-column key="action"
                                v-if='preview!=="1"'
                                title='操作'
                                data-index="action">
                  <template #default="{ record }">
                      <span>
                        <a-button type='link' @click='editLesson(record)' style='padding:0;'>编辑</a-button>
                        <span v-if='!(Number(isUsed)>0&&userId!==majorLeaderId)'>
                           <a-divider type="vertical" style='margin:0 10px'/>
                           <a-button type='link' @click='delLesson(record.id)'
                                     style='padding:0;color:red;'>删除</a-button>
                        </span>
                      </span>
                  </template>
                </a-table-column>
              </a-table>
            </div>
          </a-tab-pane>
          <a-tab-pane :key="teachType!=='22' ? 4:3" tab="其他设置">
            <div class='other-set-container'>
              <a-tabs :activeKey="tabCurInnerProgress" style='text-align:left' type="card"
                      @change='tabCurInnerProgressChange'>
                <a-tab-pane :key="1" tab="闯关">
                  <div class='module-tree'>
                    <div class='item'>
                   <span class='item-label'>
                  闯关模式：
                     <a-switch
                       checked-children="开"
                       un-checked-children="关"
                       v-model:checked="breakthroughMode"
                       @change='breakthroughModeChange'
                       :disabled='preview==="1"||Number(isUsed)>0'
                     />
                   </span>
                    </div>
                    <div class='list-container' v-show='breakthroughMode'>
                      <div class='list-item' v-for='(item,i) in levelLists' :key='item.id'>
                        <div class='gk-text fl'>
                          关卡{{i + 1}}：
                        </div>
                        <div class='list fr' style='width:calc(100% - 70px);'>
                          <div class='fl'>
                            <span class='icon-pre'>试</span>
                            <span class='icon-text'>{{item.name}}</span>
                          </div>
                          <div class='fr'>
                            <a-button
                              :class='{"disable-edit":preview==="1","other-button":true}'
                              :disabled='preview==="1"?true:null'
                              type="primary"
                              @click='rewardSettings(item)'
                            >
                              奖励设置
                            </a-button>
                            <a-button type="link" @click="addOrEditLevel(item)" v-if='preview!=="1"'>
                              <EditOutlined style='cursor:pointer;line-height:38px;'/>
                              <span class='icon-del lh34 mr20 ml10'>编辑</span>
                            </a-button>
                            <a-button type="link" style='cursor: not-allowed' v-else>
                              <EditOutlined style='cursor:pointer;line-height:38px;' class='icon-disable'/>
                              <span class='icon-del lh34 text-disbale'>编辑</span>
                            </a-button>
                            <span v-if='!(preview==="1"||(Number(isUsed)>0&&i!== levelLists.length-1))'>
                            <DeleteOutlined style='cursor:pointer;line-height:38px;' @click='deleteLevel(item)'/>
                            <span class='icon-del lh34 mt5' @click='deleteLevel(item)'>删除</span>
                          </span>
                            <span v-else>
                              <DeleteOutlined
                                style='cursor:pointer;line-height:38px;color:#bfb6b6;cursor: not-allowed'/>
                              <span class='icon-del lh34 mt5' style='color:#bfb6b6;cursor: not-allowed'>删除</span>
                          </span>
                          </div>
                        </div>
                        <div class='list fr' style='width:calc(100% - 130px);'
                             v-for='itemI in item.coursePacketCardRecourseList' :key='itemI.id'>
                          <div class='fl'>
                            <span class='icon-pre yellow'>资</span>
                            <span class='icon-text'>{{itemI.title}}</span>
                          </div>
                          <div class='fr'>
                          <span v-if='preview!=="1"'>
                            <DeleteOutlined style='cursor:pointer;line-height:38px;' @click='deleteGift(itemI)'/>
                            <span class='icon-del lh34' @click='deleteGift(itemI)'>删除</span>
                          </span>
                            <span v-else>
                            <DeleteOutlined style='cursor:pointer;line-height:38px;color:#bfb6b6;cursor: not-allowed'/>
                            <span class='icon-del lh34' style='color:#bfb6b6;cursor: not-allowed'>删除</span>
                          </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class='item pt0' v-show='breakthroughMode'>
                      <a-button
                        style='margin-left: 70px'
                        :class="{'disable-edit':preview==='1','other-button':true}"
                        :disabled='preview==="1"?true:null'
                        type="primary"
                        @click='addOrEditLevel({})'>
                        <PlusOutlined class='add-member-icon'/>
                        新增关卡
                      </a-button>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane :key="2" tab="题库">
                  <div class='module-tree'>
                    <div class='item'>
                    <span class='item-label'>
                          配套题库：
                    </span>
                      <span v-if='preview==="1"&&!otherSetSubQuestionBank.length'>无子题库</span>
                      <a-tree-select
                        v-else
                        :disabled='preview==="1"|| (Number(isUsed)>0)'
                        multiple
                        style="width: calc(100% - 130px)"
                        :tree-data="otherSetExam"
                        tree-default-expand-all
                        show-search
                        placeholder="绑定子题库"
                        v-model:value="subQuestionBankCurrent"
                        @change='otherSubQuestionBankChange($event,"otherSetSubQuestionBank")'
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      >
                      </a-tree-select>
                    </div>
                    <div class='list-container'
                         :style='{"margin":otherSetSubQuestionBank.length?"20px 28px 20px 72px":"0"}'>
                      <draggable
                        :move='()=>(preview!=="1")'
                        :list="otherSetSubQuestionBank"
                        @change="otherSetSubQuestionBankDrag($event,'otherSetSubQuestionBank')"
                      >
                        <div class='list'
                             v-for='item in otherSetSubQuestionBank'
                             :key='item.id'
                             :style='{"cursor":preview==="1"|| Number(isUsed)>0?"not-allowed":"move"}'>
                          <div style='float:left' :title='item.quebankName'>
                            <FileOutlined/>
                            <span style='margin-left:20px;'>{{item.quebankName}}</span>
                          </div>
                          <div style='float:right' v-if='!(preview==="1"||Number(isUsed)>0)'>
                            <DeleteOutlined style='cursor:pointer;' @click='delListSublibraryItem($event,item)'/>
                            <span class='icon-del' @click='delListSublibraryItem($event,item)'
                                  v-if='!(preview==="1"||Number(isUsed)>0)'>删除</span>
                          </div>
                        </div>
                      </draggable>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane :key="3" tab="实训">
                  <div class='module-tree'>
                    <div class='item '>
                   <span class='item-label w142'>
                  99实训系统：
                   </span>
                      <a-switch
                        checked-children="开"
                        un-checked-children="关"
                        v-model:checked="practiceOn"
                        @change='practiceOnChange'
                        :disabled='preview==="1"||Number(isUsed)>0'
                      />
                    </div>
                    <div class='list-container' v-show='practiceOn'>
                      <div class='list-item' v-for='(item,i) in companyLists' :key='item.id'>
                        <div class='gk-text fl'>
                          公司{{i + 1}}：
                        </div>
                        <div class='list fr' style='width:calc(100% - 70px);'>
                          <div class='fl'>
                            <span class='icon-pre'>公</span>
                            <span class='icon-text'>{{item.name}}</span>
                          </div>
                          <div class='fr'>
                            <a-button type="link" @click="addOrEditCompany(item)" v-if='preview!=="1"'>
                              <EditOutlined class='icon'/>
                              <span class='lh34 mr20 ml10'>编辑</span>
                            </a-button>
                            <a-button type="link" style='cursor: not-allowed' v-else>
                              <EditOutlined class='icon-disable'/>
                              <span class='icon-del lh34 text-disbale'>编辑</span>
                            </a-button>
                            <span v-if='!(preview==="1"||(Number(isUsed)>0))'>
                            <DeleteOutlined class='icon' @click='deleteCompany(item)'/>
                            <span class='icon-del lh34 mt5' @click='deleteCompany(item)'>删除</span>
                          </span>
                            <span v-else>
                            <DeleteOutlined class='icon-disable'/>
                            <span class='icon-del lh34 text-disbale mt5'>删除</span>
                          </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class='item pt0' v-show='practiceOn'>
                      <a-button
                        style='margin-left: 143px'
                        :class="{'disable-edit':preview==='1' || Number(isUsed)>0 ,'other-button':true}"
                        :disabled='preview==="1" ||Number(isUsed)>0'
                        type="primary"
                        @click='addOrEditCompany({})'>
                        <PlusOutlined class='add-member-icon'/>
                        新增公司
                      </a-button>
                    </div>
                  </div>
                  <div class='module-tree'>
                    <div class='item '>
                   <span class='item-label w142'>
                  会计乐实训系统：
                   </span>
                      <a-switch
                        checked-children="开"
                        un-checked-children="关"
                        v-model:checked="bookkeeperOn"
                        @change='bookkeeperOnChange'
                        :disabled='preview==="1"||Number(isUsed)>0'
                      />
                    </div>
                    <div class='item pt0' v-show='bookkeeperOn' style='margin:20px 0 0 143px;'>
                      <a-checkbox v-model:checked="item.checked"
                                  v-for='item in kjlOption'
                                  :key='item.kjlCourseId'
                                  :disabled='preview==="1"||Number(isUsed)>0'
                                  @change='bookkeeperChange($event,item)'
                      >{{item.name}}
                      </a-checkbox>
                    </div>
                  </div>
                  <div class='module-tree'>
                    <div class='item '>
                   <span class='item-label w142'>
                  用友实训系统：
                   </span>
                      <a-switch
                        checked-children="开"
                        un-checked-children="关"
                        v-model:checked="ufidaOn"
                        @change='ufidaOnChange'
                        :disabled='preview==="1"||Number(isUsed)>0'
                      />
                    </div>
                  </div>
                  <div class='module-tree'>
                    <div class='item '>
                   <span class='item-label w142'>
                  恒企实习系统：
                   </span>
                      <a-switch
                        checked-children="开"
                        un-checked-children="关"
                        v-model:checked="hqOn"
                        @change='hqOnChange'
                        :disabled='preview==="1"||Number(isUsed)>0'
                      />
                    </div>
                    <div class='list-container' v-show='hqOn'>
                      <div class='list-item' v-for='(item,i) in hqLists' :key='item.id'>
                        <div class='gk-text fl'>
                          实训{{i + 1}}：
                        </div>
                        <div class='list fr' style='width:calc(100% - 70px);'>
                          <div class='fl'>
                            <span class='icon-pre'>训</span>
                            <span class='icon-text'>{{item.name}}</span>
                          </div>
                          <div class='fr'>
                            <a-button type="link" @click="addOrEditHq(item)" v-if='preview!=="1"'>
                              <EditOutlined class='icon'/>
                              <span class='lh34 mr20 ml10'>编辑</span>
                            </a-button>
                            <a-button type="link" style='cursor: not-allowed' v-else>
                              <EditOutlined class='icon-disable'/>
                              <span class='icon-del lh34 text-disbale'>编辑</span>
                            </a-button>
                            <span v-if='!(preview==="1"||Number(isUsed)>0)'>
                            <DeleteOutlined class='icon' @click='deleteHq(item)'/>
                            <span class='icon-del lh34 mt5' @click='deleteHq(item)'>删除</span>
                          </span>
                            <span v-else>
                            <DeleteOutlined class='icon-disable '/>
                            <span class='icon-del lh34 text-disbale mt5'>删除</span>
                          </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class='item pt0' v-show='hqOn'>
                      <a-button
                        style='margin-left: 143px'
                        type='primary'
                        :class="{'other-button':true,'disable-edit':preview==='1' ||Number(isUsed)>0}"
                        :disabled='preview==="1" ||Number(isUsed)>0'
                        @click='addOrEditHq({})'>
                        <PlusOutlined class='add-member-icon'/>
                        新增实训
                      </a-button>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane :key="4" tab="智适应">
                  <div class='item pb20'>
                    <div class='item-left'>
                      国家考试日期：
                    </div>
                    <a-date-picker v-model:value="examTime"
                                   @openChange='timeOpen'
                                   @change="timeChange"
                                   style='width:200px'
                                   :disabled='preview==="1"'/>
                  </div>
                  <div class='item pb20'>
                    <span class='item-left'>
                          押题宝：
                    </span>
                    <a-switch
                      checked-children="开"
                      un-checked-children="关"
                      v-model:checked="isBetOn"
                      @change='isBetChange'
                      :disabled='preview==="1"|| Number(isUsed)>0 || knowledgeNum < 100'
                    />
                    <span style='padding-left:30px;color:#afafaf'>提示：知识点数量大于等于100个才可以开启押题宝</span>
                  </div>
                  <div class='item pb20'>
                    <div class='item-left'>
                      <span style='color:red;margin-right:10px;'>*</span>图谱开关：
                    </div>
                    <a-switch
                      checked-children="开"
                      un-checked-children="关"
                      v-model:checked="intellAdapt"
                      @change='intellAdaptChange'
                      :disabled='preview==="1"||Number(isUsed)>0 '
                    />
                    <span style='padding-left:30px;color:#afafaf'>提示：图谱开关开启后学员才有知识图谱和智能推荐模块的入口</span>
                  </div>
                  <div class='item' v-if='intellAdapt'>
                    <div class='item-left'>
                      <span style='color:red;margin-right:10px;'>*</span>章节绑定：
                    </div>
                    <a-button type="primary" @click='chapterBindModal()' :disabled='preview==="1"'>绑定
                    </a-button>
                    <span
                      style='padding-left:30px;color:#afafaf'
                    >提示：章节绑定的所有知识点即该课包知识图谱的内容，系统将根据课包章节学习进度去给学员逐步推荐章节绑定的知识点。
                    </span>
                    <a-table :data-source="listOfDataChapterBind"
                             :loading='loading'
                             style='margin:20px 42px 0 130px'
                    >
                      <a-table-column key="sectionName"
                                      title='课包结构'
                                      data-index="sectionName">
                        <template #default="{ text }">
                              <span class='synopsis-text'>
                                {{ text }}
                              </span>
                        </template>
                      </a-table-column>
                      <a-table-column key="knowledgeUnits"
                                      title='知识图谱'
                                      data-index="knowledgeUnits">
                        <template #default="{ text }">
                          <a-tooltip>
                            <template #title>{{text}}</template>
                            <span class='synopsis-text'>
                                {{ getBingData(text) }}
                              </span>
                          </a-tooltip>
                        </template>
                      </a-table-column>
                      <a-table-column key="action" title="操作">
                        <template #default="{ record }">
                          <a-button type='link' @click='modifyBind(record)' style='padding:0;'
                                    :disabled='preview==="1"'>修改
                          </a-button>
                          <a-divider type="vertical" style='margin:0 10px'/>
                          <a-button type='link' @click='untieKnowledgePoints(record)' style='padding:0;'
                                    :disabled='preview==="1"'>解绑
                          </a-button>
                        </template>
                      </a-table-column>
                    </a-table>

                    <div class='item-left' style='margin-left: 22px;' v-if='teachType==="22"'>
                      <span style='color:red;margin-right:10px;'>*</span>学习计划：
                      <a-tooltip :overlayStyle='{"max-width": "255px"}'>
                        <template #title>学习周期不能大于课包中小节总数</template>
                        <QuestionCircleOutlined class='font-question'/>
                      </a-tooltip>
                    </div>
                    <div class="ant-table" style='margin:20px 30px 0 130px' v-if='teachType==="22"'>
                      <table>
                        <thead class="ant-table-thead">
                        <tr>
                          <th class="ant-table-row-cell-break-word">
                            适用人群
                          </th>
                          <th class="ant-table-row-cell-break-word">
                            学习周期(共{{totalSectionNum}}节）
                          </th>
                        </tr>
                        </thead>
                        <tbody class='ant-table-tbody'>
                        <tr>
                          <td class="ant-table-row-cell-break-word">
                            适合初学
                          </td>
                          <td class="ant-table-row-cell-break-word">
                            <a-checkbox v-model:checked="applicableZeroBasis"
                                        :disabled='preview==="1"'
                                        @change='applicableChange($event,"juniorWeekNum","applicableZeroBasisWeek")'
                                        style='margin-right:20px;'
                            >计划1
                            </a-checkbox>
                            <a-input-number :disabled="!applicableZeroBasis||preview==='1'"
                                            v-model:value="applicableZeroBasisWeek"
                                            :min="1"
                                            @focus='applicableFocus("applicableZeroBasisWeek")'
                                            placeHolder='请输入周期'
                                            @blur='applicableWeekChange($event,"juniorWeekNum","applicableZeroBasisWeek")'
                                            :step="1"
                                            style='margin:0 10px;min-width:120px'></a-input-number>
                            周
                          </td>
                        </tr>
                        <tr>
                          <td class="ant-table-row-cell-break-word">
                            适合有基础
                          </td>
                          <td class="ant-table-row-cell-break-word">
                            <a-checkbox v-model:checked="applicableHasAFoundation"
                                        :disabled='preview==="1"'
                                        @change='applicableChange($event,"middleWeekNum","applicableHasAFoundationWeek")'
                                        style='margin-right:20px;'
                            >计划2
                            </a-checkbox>
                            <a-input-number :disabled="!applicableHasAFoundation||preview==='1'"
                                            v-model:value="applicableHasAFoundationWeek"
                                            :min="1" :step="1"
                                            style='margin:0 10px;min-width:120px'
                                            placeHolder='请输入周期'
                                            @focus='applicableFocus("applicableHasAFoundationWeek")'
                                            @blur='applicableWeekChange($event,"middleWeekNum","applicableHasAFoundationWeek")'
                            ></a-input-number>
                            周
                          </td>
                        </tr>
                        <tr>
                          <td class="ant-table-row-cell-break-word">
                            适合速成
                          </td>
                          <td class="ant-table-row-cell-break-word">
                            <a-checkbox v-model:checked="applicableExperts"
                                        :disabled='preview==="1"'
                                        @change='applicableChange($event,"seniorWeekNum","applicableExpertsWeek")'
                                        style='margin-right:20px;'
                            >计划3
                            </a-checkbox>
                            <a-input-number :disabled="!applicableExperts||preview==='1'"
                                            v-model:value="applicableExpertsWeek"
                                            :min="1"
                                            :step="1"
                                            style='margin:0 10px;min-width:120px'
                                            placeHolder='请输入周期'
                                            @focus='applicableFocus("applicableExpertsWeek")'
                                            @blur='applicableWeekChange($event,"seniorWeekNum","applicableExpertsWeek")'
                            ></a-input-number>
                            周
                          </td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class='module-tree pt20 pb60' v-if='isSmart==="1"&&teachType!=="22"&&exerciseType!=="2"'>
                    <div class='item'>
                      <span class='item-label' style='margin-left: -28px;'><span
                        style='color:red;margin:0 5px;'>*</span>真题精炼模块：</span>
                      <span v-if='preview==="1"&&!consolidationModuleCurrent'>
                        无真题精炼模块
                      </span>
                      <a-tree-select
                        v-else
                        :disabled='preview==="1"|| (Number(isUsed)>0)'
                        style="width: calc(100% - 130px)"
                        :tree-data="otherSetIntelligent"
                        tree-default-expand-all
                        show-search
                        :allow-clear='auditStatus==="0"'
                        placeholder="绑定真题精炼模块"
                        v-model:value="consolidationModuleCurrent"
                        @change='consolidationModuleCurrentChange($event)'
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      >
                      </a-tree-select>
                      <div style='color:#afafaf;margin:20px 0 0 106px'>
                        提示：开启智适应必须配置真题精炼模块，系统将根据讲师每课次选择的知识点从配置的模块中抽取习题组装成真题精炼任务发布给学员。
                      </div>
                    </div>
                  </div>
                  <div class='module-tree pt20 pb60' v-if='isSmart==="1"'>
                    <div class='item'>
                      <span class='item-label' style='margin-left: -28px;'>智适应专用：</span>
                      <span v-if='preview==="1"&&!otherSetSubQuestionBankInt.length'>
                        无子题库
                      </span>
                      <a-tree-select
                        v-else
                        :disabled='preview==="1"|| (Number(isUsed)>0)'
                        multiple
                        style="width: calc(100% - 130px)"
                        :tree-data="otherSetIntelligent"
                        tree-default-expand-all
                        show-search
                        placeholder="绑定子题库"
                        v-model:value="subQuestionBankIntCurrent"
                        @change='otherSubQuestionBankChange($event,"otherSetSubQuestionBankInt")'
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      >
                      </a-tree-select>
                      <div style='color:#afafaf;margin:20px 0 0 106px'>
                        提示：智适应专用支持绑定子题库中的多个模块，用于智适应抽题范围。如不绑定则默认章节绑定的知识点下面所有的题都用于智适应抽题范围。
                      </div>
                    </div>
                    <div class='list-container pt20'
                         :style='{margin:otherSetSubQuestionBankInt.length?"20px 16px 20px 106px":"0"}'>
                      <draggable
                        :move='()=>(preview!=="1")'
                        :list="otherSetSubQuestionBankInt"
                        @change="otherSetSubQuestionBankDrag($event,'otherSetSubQuestionBankInt')"
                      >
                        <div class='list' v-for='item in otherSetSubQuestionBankInt' :key='item.id'
                             :style='{cursor:(preview==="1"|| Number(isUsed)>0)?"not-allowed":"move"}'>
                          <div class='fl' :title='item.quebankName'>
                            <FileOutlined/>
                            <span style='margin-left:20px;'>{{item.quebankName}}</span>
                          </div>
                          <div class='fr' v-if='!(preview==="1"||Number(isUsed)>0)'>
                            <DeleteOutlined style='cursor:pointer;' @click='delListSublibraryItem($event,item)'/>
                            <span class='icon-del' v-if='!(preview==="1"||Number(isUsed)>0)'
                                  @click='delListSublibraryItem($event,item)'>删除</span>
                          </div>
                        </div>
                      </draggable>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <a-modal v-model:visible="seeMoreDetails"
             :title="null"
             wrapClassName='member-modal'
             :maskClosable='true'
             :width='600'
             :closable='false'
             :footer='null'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px",padding:0}'
    >
      <a-tabs v-model:activeKey="moreDetailsActiveKey" type="card">
        <a-tab-pane key="1" tab="课包结构" v-if='teachType==="22"'>
          <div style='padding:0 20px;'>
            <div class='chapter-list' v-for='(item) in lackChapterSession' :key='item.id'>
              <div class='chapter-name'>
                <CaretDownOutlined class='icon-arrow' v-if='item.open'
                                   @click='item.open=false'/>
                <CaretRightOutlined class='icon-arrow' v-if='!item.open'
                                    @click='item.open=true'/>
                第{{item.seq}}章：{{item.name}}
              </div>
              <div v-if='item.open'>
                <div class='festival-list' v-for='(itemC) in item.children' :key='itemC.id'>
                  {{item.seq}}.{{itemC.seq}}节 ：{{itemC.name}} <span style="color:red">（缺少）</span>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="知识图谱">
          <div style='padding:0 20px 40px'>
            <a-tree
              class='fix-title'
              :show-line=true
              :replaceFields="{title:'name', key:'id'}"
              :tree-data="moreDetailsTreeData"
              v-model:expandedKeys="moreDetailsExpandedKeys"
              style='text-align:left'
            >
            </a-tree>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <a-modal v-model:visible="seeDetails"
             title="提交审批"
             wrapClassName='member-modal'
             :maskClosable='false'
             :width='600'
             :confirmLoading='loading'
             :closable='true'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <template #footer>
        <a-button key="back" @click="seeDetails = false" style='margin-left:20px'>取消</a-button>
        <a-button @click="seeDetailsF()"
                  style='margin-left:20px'
                  v-if='isSmart==="1" && ((teachType==="22"&&mainVideo) || knowledgeExplanationVideo)'
        >查看
        </a-button>
        <a-button key="submit" @click="seeDetailsComfirm()" style='margin:0 20px' :loading="loading" type='primary'>确定
        </a-button>
      </template>
      <div style='padding-left:20px;'>
        <div style='margin-right:20px;'>
          课包审批通过后，可进入教务排课与网校销售阶段。
        </div>
        <div v-if='mainVideo && isSmart==="1" && teachType==="22"'>
          {{ '1、该课包缺少' + mainVideo + '个主视频' }}
        </div>
        <div v-if='knowledgeExplanationVideo && isSmart==="1"'>
          {{ (mainVideo && teachType==='22' ? 2 : 1) + '、知识图谱中缺少' + knowledgeExplanationVideo + '个知识讲解视频' }}
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="chapterBindVisible"
             @cancel='chapterBindVisible = false;'
             @ok='bindKnowledgePoints'
             title="章节绑定"
             wrapClassName='member-modal'
             :maskClosable='false'
             :width='600'
             :confirmLoading='loading'
             :closable='true'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <template #footer>
        <a-button key="back" @click="chapterBindVisible = false;">关闭</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="bindKnowledgePoints">绑定</a-button>
      </template>
      <div class='tree-container'>
        <div class='tree-left'>
          <span class='tree-title'>课包结构</span>
          <div class='struct-container'>
            <a-tree
              class='fix-title'
              v-model:selectedKeys='otherSetSelectedKeys'
              v-model:expandedKeys="otherSetExpandedKeys"
              @select='otherSetTreeNodeClick'
              @expand='otherSetTreeNodeExpand'
              style='text-align:left'
              :tree-data="otherSetTreeData"
              v-if='otherSetTreeData.length'
              :replaceFields='{title:"name",key:"id"}'
            >
            </a-tree>
          </div>
        </div>
        <div class='tree-right'>
          <span class='tree-title'>知识图谱结构</span>
          <!--:defaultExpandAll='true'-->
          <a-tree
            v-model:expandedKeys='knowledgeGraphExpandedKeys'
            @check='knowledgeGraphTreeNodeClick'
            class='fix-title'
            checkable
            v-model:checkedKeys='knowledgeGraphCheckedKeys'
            style='text-align:left;margin-top: 28px;'
            :tree-data="knowledgeGraphTreeData"
            :replaceFields='{title:"name",key:"id"}'
            v-if='knowledgeGraphTreeData.length'
            :showLine='true'
          >
          </a-tree>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:visible="trainHqVisible"
             @cancel='trainHqVisible = false;trainHqFromRef.clearValidate()'
             @ok='trainHqConfirm'
             :title="(isEditTrainHq?'编辑':'新增')+'实训'"
             wrapClassName='member-modal'
             :maskClosable='false'
             :width='600'
             :confirmLoading='loading'
             :closable='true'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <template #footer>
        <a-button key="back" @click="trainHqVisible = false;trainHqFromRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="trainHqConfirm">保存</a-button>
      </template>
      <a-form :label-col="{ span:  5 }"
              :wrapper-col="{ span: 17 }"
              :model="trainHqFromState"
              :rules="trainHqFromRules"
              ref="trainHqFromRef"
              class='common-modal'>

        <a-form-item label="实训名称"
                     name="name"
                     hasFeedback
                     style='position:relative;'
        >
          <a-input v-model:value="trainHqFromState.name"
                   placeholder="请输入实训名称"
                   allowClear
                   @pressEnter='trainHqConfirm'
          />
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:trainHqFromState.name?.length>40? 'red':'inherit'
                }"
          >
          {{trainHqFromState.name?.length || 0}}/40</span>
        </a-form-item>

        <a-form-item label="账套ID"
                     name="accountHqId"
                     hasFeedback
                     style='position:relative;'
        >
          <a-input v-model:value="trainHqFromState.accountHqId"
                   placeholder="请输入账套ID"
                   :disabled='isUsed>0&&isEditTrainHq'
                   allowClear
                   @pressEnter='trainHqConfirm'
          />
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:trainHqFromState.accountHqId?.length>40? 'red':'inherit'
                }"
          >
          {{trainHqFromState.accountHqId?.length || 0}}/40</span>
        </a-form-item>

      </a-form>
    </a-modal>

    <a-modal v-model:visible="train99Visible"
             @cancel='train99Visible = false;train99FromRef.clearValidate()'
             @ok='train99Confirm'
             :title="(isEditTrain99?'编辑':'新增') + '公司'"
             wrapClassName='member-modal'
             :maskClosable='false'
             :width='600'
             :confirmLoading='loading'
             :closable='true'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <template #footer>
        <a-button key="back" @click="train99Visible = false;train99FromRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="train99Confirm">保存</a-button>
      </template>
      <a-form :label-col="{ span:  5 }"
              :wrapper-col="{ span: 17 }"
              :model="train99FromState"
              :rules="train99FromRules"
              ref="train99FromRef"
              class='common-modal'>

        <a-form-item label="公司名称"
                     name="name"
                     hasFeedback
                     style='position:relative;'
        >
          <a-input v-model:value="train99FromState.name"
                   placeholder="请输入公司名称"
                   allowClear
                   @pressEnter='train99Confirm'
                   :disabled='isUsed>0&&isEditTrain99'
          />
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:train99FromState.name?.length>40? 'red':'inherit'
                }"
          >
          {{train99FromState.name?.length || 0}}/40</span>
        </a-form-item>

        <a-form-item label="有效期限"
                     name="termType"
                     hasFeedback
        >
          <a-select v-model:value="train99FromState.termType"
                    placeholder="请选择有效期限"
                    showSearch
                    :disabled='isUsed>0&&isEditTrain99'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
          >
            <a-select-option :value="0" :key='0'>半年</a-select-option>
            <a-select-option :value="1" :key='1'>1年</a-select-option>
            <a-select-option :value="2" :key='2'>2年</a-select-option>
            <a-select-option :value="3" :key='3'>3年</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="权限设置"
                     name="permission"
                     hasFeedback
        >
          <a-select v-model:value="train99FromState.permission"
                    placeholder="请选择权限设置"
                    showSearch
                    mode='multiple'
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
          >
            <a-select-option value="业务中心" key='业务中心'>业务中心</a-select-option>
            <a-select-option value="数字大脑" key='数字大脑'>数字大脑</a-select-option>
            <a-select-option value="财务中心" key='财务中心'>财务中心</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="上传数据包"
                     name="filePath"
                     hasFeedback
        >
          <a-upload
            :customRequest='customDataPackRequest("package/dataPack")'
            v-model:file-list="train99FileList"
            accept='.zip,.rar'
            :show-upload-list="{showRemoveIcon:true}"
            class='course-upload'
            :remove='removeTrain99FileList'
          >
            <a-button
              :disabled='train99FileList.length > 0'
              :loading='loading'
            >
              <UploadOutlined/>
              本地上传
            </a-button>
          </a-upload>
          <span> 支持zip、rar格式 </span>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="rewardSetVisible"
             @cancel='rewardSetVisible = false'
             @ok='rewardSetConfirm()'
             title="奖励设置"
             wrapClassName='member-modal'
             :maskClosable='false'
             :confirmLoading='loading'
             :closable='true'
             :width='520'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <div style='position:relative;'>
        <span style='color:red;margin:0 5px;'>*</span><span style='margin-right:12px;'>本地上传</span>
        <a-upload
          :beforeUpload='rewardSetBeforeUpload'
          v-model:file-list="rewardSetFileList"
          :customRequest='customRequest("package/rewardSet")'
          accept='.xls,.xlsx,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.pdf,.mp4'
          :show-upload-list='{showRemoveIcon:false}'
        >
          <a-button
            :loading='loading'
          >
            <UploadOutlined/>
            上传文件
          </a-button>
        </a-upload>
        <a-button @click="rewardSetResourceCall"
                  style='position: absolute;top: 0;left: 216px;'
        >
          <DownloadOutlined/>
          资源调用
        </a-button>
      </div>
    </a-modal>

    <a-modal v-model:visible="levelModalVisible"
             @cancel="levelModalVisible=false;levelFromRef.clearValidate()"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='900'
             @ok="saveLevelOperate"
             :title="isEditLevel?'编辑关卡':'新增关卡'"
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >
      <template #footer>
        <a-button key="back" @click="levelModalVisible = false;levelFromRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="saveLevelOperate">保存</a-button>
      </template>
      <a-form :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
              :model="levelFromState"
              :rules="levelFromRules"
              ref="levelFromRef"
              class='common-modal'>

        <a-form-item label="选择试卷"
                     name="newLevel"
                     hasFeedback
                     :wrapper-col="{ span: 18 }"
                     :label-col="{ span: 6 }"
                     style='width:50%;float:left;'
        >
          <a-select v-model:value="levelFromState.newLevel"
                    placeholder="请选择模块"
                    showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                    @change='getPapers(true)'
          >
            <a-select-option :value="item.id" :key='item.id' v-for='item in moduleArr'>{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label=""
                     name="testPaperName"
                     :wrapper-col="{ span: 18 }"
                     :label-col="{ span: 0 }"
                     hasFeedback
                     style='width:50%;'
        >
          <a-select v-model:value="levelFromState.testPaperName"
                    placeholder="请选择试卷"
                    showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                    @change='testPaperNameChange'
          >
            <a-select-option :value="item.examId" :key='item.examId' v-for='item in paperArr'>{{item.examName}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="达标条件"
                     name="complianceConditions"
                     hasFeedback
                     style='width:50%;'
                     :wrapper-col="{ span: 18 }"
                     :label-col="{ span: 6 }"
        >
          <a-input-number v-model:value="levelFromState.complianceConditions" :min="0" :step="1"
                          :max='totalTestPaperScore'
                          placeholder='请输入分数值'
                          :precision='0' style='width:140px;margin-right:20px;' @pressEnter='confirmRecordLocalUpload'/>
          <span style='margin-left:20px;'>试卷总分：<span style='color:#8fc9fe'>{{totalTestPaperScore}}分</span></span>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="editLessonVisible"
             title="编辑课次"
             @ok="editLessonConfirm"
             @cancel="editLessonVisible = false;editLessonFormRef.clearValidate()"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="editLessonVisible = false;editLessonFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="editLessonConfirm">保存</a-button>
      </template>
      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="editLessonFormState"
              :rules="editLessonFormRules"
              ref="editLessonFormRef"
              class='common-modal'>
        <a-form-item label="课次名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="editLessonFormState.name" placeholder="请输入课次名称" allowClear
                   @pressEnter='editLessonConfirm'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:editLessonFormState.name?.length>25? 'red':'inherit'
                }"
          >
          {{editLessonFormState.name?.length || 0}}/25</span>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="addSectionVisible"
             :title="`${isEditSection ? '重命名节' : '新增节'}`"
             @ok="addSectionConfirm"
             @cancel="addSectionVisible = false;addSectionFormRef.clearValidate()"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="addSectionVisible = false;addSectionFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="addSectionConfirm">保存</a-button>
      </template>
      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="addSectionFormState"
              :rules="addSectionFormRules"
              ref="addSectionFormRef"
              class='common-modal'>
        <a-form-item label="本节名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="addSectionFormState.name" placeholder="请输入本节名称" allowClear
                   @pressEnter='addSectionConfirm'/>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="addChapterVisible"
             :title="`${isEditChapter ? '重命名章' : '新增章'}`"
             @ok="addChapterConfirm"
             @cancel="addChapterVisible = false;addChapterFormRef.clearValidate()"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="addChapterVisible = false;addChapterFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="addChapterConfirm">保存</a-button>
      </template>
      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="addChapterFormState"
              :rules="addChapterFormRules"
              ref="addChapterFormRef"
              class='common-modal'>
        <a-form-item label="本章名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="addChapterFormState.name" placeholder="请输入本章名称" allowClear
                   @pressEnter='addChapterConfirm'/>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="chapterStructureVisible"
             @cancel='chapterStructureVisible = false'
             @ok='chapterImport()'
             title="excel导入章节"
             okText='确定上传'
             wrapClassName='member-modal'
             :maskClosable='false'
             :confirmLoading='loading'
             :closable='true'
             :width='520'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <div style='position:relative;padding-bottom:30px;'>
        <span style='color:red;margin:0 5px;'>*</span><span style='margin-right:12px;'>章节结构</span>
        <a-upload
          class='import-atlas-upload'
          list-type="picture"
          v-model:file-list="chapterStructureFileList"
          :customRequest='customRequest("package/chapterStructure")'
          accept='.xls,.xlsx'
          :show-upload-list='{showRemoveIcon:true}'
        >
          <a-button
            :disabled='disableChapterStructureFileList'
            :loading='loading'
          >
            <UploadOutlined/>
            上传文件
          </a-button>
        </a-upload>
        <a-button @click="templateDownload"
                  style='position: absolute;top: 0;left: 216px;'
        >
          <DownloadOutlined/>
          模板下载
        </a-button>
        <span style='position:absolute;left:96px;top:42px;'>excel导入章节同时将会清除已有的章节结构！</span>
      </div>
    </a-modal>

    <a-modal v-model:visible="learnSetVideoImportVisible"
             @cancel='learnSetVideoImportVisible = false'
             @ok='learnSetVideoImportConfirm()'
             title="导入视频"
             okText='确定'
             wrapClassName='member-modal'
             :maskClosable='false'
             :confirmLoading='loading'
             :closable='true'
             :width='520'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <div style='position:relative;padding-bottom:30px;'>
        <span style='color:red;margin:0 5px;'>*</span><span style='margin-right:12px;'>章节结构</span>
        <a-upload
          class='import-atlas-upload'
          list-type="picture"
          v-model:file-list="learnSetVideoImportFileList"
          :customRequest='customRequest("package/learnSet")'
          accept='.xls,.xlsx'
          :show-upload-list='{showRemoveIcon:true}'
        >
          <a-button
            :disabled='disablelearnSetVideoImportFileList'
            :loading='loading'
          >
            <UploadOutlined/>
            上传文件
          </a-button>
        </a-upload>
        <a-button @click="learnSetVideoImportTemplateDownload"
                  style='position: absolute;top: 0;left: 216px;'
        >
          <DownloadOutlined/>
          模板下载
        </a-button>
      </div>
    </a-modal>

    <a-modal v-model:visible="recordLocalUploadVisible"
             :title="getLabel(recordLocalUploadLabel,!isRecordLocalUploadEdit)"
             @ok="confirmRecordLocalUpload"
             @cancel="recordLocalUploadVisible = false;recordLocalUploadFormRef.clearValidate()"
             :closable='true'
             :maskClosable='false'
    >
      <template #footer>
        <a-button key="back" @click="recordLocalUploadVisible = false;recordLocalUploadFormRef.clearValidate()">取消
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="confirmRecordLocalUpload">保存</a-button>
      </template>
      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="recordLocalUploadFormState"
              :rules="recordLocalUploadFormRules"
              ref="recordLocalUploadFormRef"
              class='common-modal'>
        <a-form-item label="视频"
                     name="videoUrl"
                     hasFeedback
                     v-if='recordLocalUploadLabel==="localVideo"&&!isRecordLocalUploadEdit'
        >
          <a-upload
            :customRequest='recordLocalUploadCustomRequest()'
            v-model:file-list="recordLocalUploadFileList"
            list-type="picture-card"
            accept='.mp4,.flv,.avi,.mpg,.wmv,.mov,.3gp,.asf'
            :show-upload-list="{showPreviewIcon:true,showRemoveIcon:true}"
            class='course-upload'
            @preview='filePreview'
            :remove='removeRecordLocalUploadFileList'
          >
            <div v-if='recordLocalUploadFileList.length === 0'>
              <plus-outlined></plus-outlined>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
          <div style='margin-top:-10px;'>
            支持格式flv,avi,mpg,mp4,wmv,mov,3gp,.asf等
          </div>
          <div style='line-height:18px;'>
            (本地上传到保利威的视频需要经过保利威审核后才能正常播放)
          </div>
        </a-form-item>
        <a-form-item label="保利威ID"
                     name="videoUrl"
                     hasFeedback
                     v-if='recordLocalUploadLabel==="polyway"&&!isRecordLocalUploadEdit'
        >
          <a-input v-model:value="recordLocalUploadFormState.videoUrl"
                   placeholder="请输入保利威ID"
                   allowClear
                   @pressEnter='confirmRecordLocalUpload'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:recordLocalUploadFormState.videoUrl?.length>50? 'red':'inherit'
                }"
          >
          {{recordLocalUploadFormState.videoUrl?.length || 0}}/50</span>
        </a-form-item>
        <a-form-item label="视频地址"
                     name="videoUrl"
                     hasFeedback
                     v-if='recordLocalUploadLabel==="showInteraction"&&!isRecordLocalUploadEdit'
        >
          <a-input v-model:value="recordLocalUploadFormState.videoUrl"
                   placeholder="请输入视频地址"
                   allowClear
                   @pressEnter='confirmRecordLocalUpload'/>
        </a-form-item>
        <a-form-item label="视频时长"
                     v-if="recordLocalUploadLabel==='showInteraction'"
                     name="videoDuration"
        >
          <a-input-number v-model:value="recordLocalUploadFormState.videoDuration" :min="1" :step="1"
                          placeholder='请输入视频时长'
                          :precision='0' style='width:100px;margin-right:20px;' @pressEnter='confirmRecordLocalUpload'/>
          分钟
        </a-form-item>
        <a-form-item label="视频标签" name="videoType" hasFeedback>
          <a-select v-model:value="recordLocalUploadFormState.videoType"
                    placeholder="请选择视频标签"
                    showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="1"
                             key='1'
            >主要
            </a-select-option>
            <a-select-option value="2"
                             key='2'
            >冲刺
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="视频名字"
                     name="attachmentName"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="recordLocalUploadFormState.attachmentName" placeholder="请输入视频名字" allowClear
                   @pressEnter='confirmRecordLocalUpload'/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:recordLocalUploadFormState.attachmentName?.length>50? 'red':'inherit'
                }"
          >
          {{recordLocalUploadFormState.attachmentName?.length || 0}}/50</span>
        </a-form-item>
        <a-form-item label="指导讲师" name="authorId" hasFeedback>
          <a-spin :spinning='loading' :delay='1000'>
            <a-select v-model:value="recordLocalUploadFormState.authorId"
                      placeholder="请选择指导讲师"
                      allowClear
                      showSearch
                      :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
              <a-select-option :value="item.id"
                               :key='item.id'
                               v-for='item of teacherList'
              >{{item.name}}
              </a-select-option>
            </a-select>
          </a-spin>
        </a-form-item>
        <a-form-item label="排序"
                     v-if='!isRecordLocalUploadEdit'
                     name="seq"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     allowClear
                     :wrapper-col="{ span: 10 }"
        >
          <a-input-number v-model:value="recordLocalUploadFormState.seq" :min="1" :step="1" placeholder='请输入序号'
                          :precision='0' style='width:150px;' @pressEnter='confirmRecordLocalUpload'/>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="examOperateVisible"
             @cancel="examOperateVisible=false"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='520'
             @ok="saveExamOperate"
             :title="isEditTask?'编辑考试':'新增考试'"
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >
      <template #footer>
        <a-button key="back" @click="examOperateVisible = false;examOperateFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="otherEdit(currentTask)" v-if='isEditTask'>
          跳转题库
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="saveExamOperate">保存</a-button>
      </template>

      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="examOperateFormState"
              :rules="examOperateFormRules"
              ref="examOperateFormRef"
              class='common-modal'>

        <a-form-item label="任务名称"
                     name="missionName"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="examOperateFormState.missionName" placeholder="请输入任务名称"/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:examOperateFormState.missionName?.length>50? 'red':'inherit'
                }"
          >
          {{examOperateFormState.missionName?.length || 0}}/50</span>
        </a-form-item>

        <a-form-item label="组卷方式"
                     v-if='!isEditTask'
                     name="formingMethod"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     :wrapper-col="{ span: 10 }"
        >
          <a-select v-model:value="examOperateFormState.formingMethod" placeholder="请选择组卷方式" showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
          >
            <a-select-option :value="1" key='1'>选题/录题组卷</a-select-option>
            <a-select-option :value="2" key='2'>题型难度</a-select-option>
            <a-select-option :value="3" key='3'>知识点难度抽题组卷</a-select-option>
            <a-select-option :value="4" key='4'>题型难度随机组卷</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="试题乱序"
                     v-if='examOperateFormState.formingMethod!==4 && !isEditTask'
                     name="formingMethod"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     :wrapper-col="{ span: 10 }"
        >
          <a-select v-model:value="examOperateFormState.isFixed" placeholder="请选择试题乱序方式" showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
          >
            <a-select-option value="1">否</a-select-option>
            <a-select-option value="2">是</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="子题库"
                     name="subQuestionBank"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     :wrapper-col="{ span: 10 }"
                     v-if='!isEditTask || (isEditTask && examOperateFormState.subQuestionBank)'
        >
          <a-tree-select
            :disabled='isEditTask'
            v-model:value="examOperateFormState.subQuestionBank"
            :tree-data='exam'
            show-search
            style="width: 100%;text-align: left"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择子题库"
            allow-clear
            tree-default-expand-all
            @change='subQuestionBankChange'
          >
          </a-tree-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="jobOperateVisible"
             @cancel="jobOperateVisible=false"
             :title="isEditTask?'编辑作业':'新增作业'"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='520'
             @ok="saveJobOperate"
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >
      <template #footer>
        <a-button key="back" @click="jobOperateVisible = false;jobOperateFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="otherEdit(currentTask)" v-if='isEditTask'>
          跳转题库
        </a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="saveJobOperate">保存</a-button>
      </template>

      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="jobOperateFormState"
              :rules="jobOperateFormRules"
              ref="jobOperateFormRef"
              class='common-modal'>

        <a-form-item label="任务名称"
                     name="name"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >
          <a-input v-model:value="jobOperateFormState.name" placeholder="请输入任务名称"/>
          <span :style="{
                  marginTop: '2px',
                  position:'absolute',
                  right:'-40px',
                  color:jobOperateFormState.name?.length>50? 'red':'inherit'
                }"
          >
          {{jobOperateFormState.name?.length || 0}}/50</span>
        </a-form-item>

        <a-form-item label="任务类型"
                     name="taskForm"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     :wrapper-col="{ span: 10 }"
        >
          <a-select v-model:value="jobOperateFormState.taskForm" placeholder="请选择任务类型" showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
          >
            <a-select-option value="0" key='0'>课前</a-select-option>
            <a-select-option value="1" key='1'>课中</a-select-option>
            <a-select-option value="2" key='2'>课后</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="子题库"
                     v-if='!isEditTask'
                     name="subQuestionBank"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
                     :wrapper-col="{ span: 10 }"
        >
          <a-tree-select
            v-model:value="jobOperateFormState.subQuestionBank"
            :tree-data='exercise'
            show-search
            style="width: 100%;text-align: left"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择子题库"
            allow-clear
            tree-default-expand-all
            @change='execrisesSubQuestionBankChange'
          >
          </a-tree-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="examSetVisible"
             @cancel="examSetVisible=false"
             title="考试设置"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='520'
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >
      <template #footer>
        <a-button key="back" @click="examSetVisible = false;examSetFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="saveExam">保存</a-button>
      </template>

      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="examSetFormState"
              :rules="examSetFormRules"
              ref="examSetFormRef"
              class='common-modal'>

        <a-form-item label="考试时长"
                     name="examLength"
                     hasFeedback
        >

          <a-input-number v-model:value="examSetFormState.examLength" :min="0" :step="1" placeholder='请输入考试时长'
                          :precision='0' style='width:150px;margin-right:10px' @pressEnter='saveExam'/>
          分钟
        </a-form-item>

        <a-form-item label="及格分数"
                     name="passScore"
                     hasFeedback
                     style='max-width: 460px;position:relative;'
        >

          <a-input-number v-model:value="examSetFormState.passScore" :min="0" :step="1" placeholder='请输入及格分数'
                          :precision='0' style='width:150px;margin-right:10px' @pressEnter='saveExam'/>
        </a-form-item>

        <a-form-item label="试卷类型"
                     name="paperType"
                     hasFeedback
                     required
        >
          <a-select v-model:value="examSetFormState.paperType" placeholder="请选择试卷类型" showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'
                    @change='paperTypeChange'>
            <a-select-option value="1" key='1'>阶段考试</a-select-option>
            <a-select-option value="2" key='2'>单科考试</a-select-option>
            <a-select-option value="3" key='3'>模拟考试</a-select-option>
            <a-select-option value="4" key='4'>密押考试</a-select-option>
            <a-select-option value="6" key='6'>实操考试</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="机考类型"
                     name="computerType"
                     hasFeedback
                     required
                     v-if='examSetFormState.paperType==="5"'
        >
          <a-select v-model:value="examSetFormState.computerType" placeholder="请选择机考类型" showSearch
                    :filterOption='(inputValue, option) => (option.children[0].children.indexOf(inputValue) > -1)'>
            <a-select-option value="1" key='1'>初级</a-select-option>
            <a-select-option value="2" key='2'>中级</a-select-option>
            <a-select-option value="3" key='3'>税务师</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="是否重考"
                     name="isRedo"
                     hasFeedback
                     required
        >
          <a-radio-group v-model:value="examSetFormState.isRedo">
            <a-radio value="1" disabled>是</a-radio>
            <a-radio value="0" disabled>否</a-radio>
          </a-radio-group>
        </a-form-item>
        <div v-if='examSetFormState.paperType==="6"&&(currentExamType==="3"||currentExamType==="2")'
             style='position:absolute;top: 228px;left: 50px;color:#bfbfbf'>
          补考按结课28天后遇到的10号开放权限，直到合格为止
        </div>
        <a-form-item label="答题次数"
                     name="answerTimes"
                     hasFeedback
                     required
        >
          <a-radio-group v-model:value="examSetFormState.answerTimes" :disabled='exerciseType ==="2"'>
            <a-radio :value="0">无限制</a-radio>
            <a-radio :value="1">
              <a-input-number v-model:value='examSetFormState.answerTime' :min="1"
                              :step="1" :disabled='exerciseType ==="2"'></a-input-number>
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="出成绩"
                     name="resultWay"
                     hasFeedback
                     required
                     v-if='exerciseType ==="1"'
        >
          <a-radio-group v-model:value="examSetFormState.resultWay">
            <a-radio value="1">交卷即出</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="authorityVisible"
             @cancel="authorityVisible=false"
             title="权限设置"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='520'
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >
      <template #footer>
        <a-button key="back" @click="authorityVisible = false;authorityFormRef.clearValidate()">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="saveQuestionnaire">保存</a-button>
      </template>

      <a-form :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18 }"
              :model="authorityFormState"
              :rules="authorityFormRules"
              ref="authorityFormRef"
              class='common-modal'>
        <a-form-item label="答题次数"
                     name="answerTimes"
                     hasFeedback
                     required
        >
          <a-radio-group v-model:value="authorityFormState.answerTimes">
            <a-radio :value="0">无限制</a-radio>
            <a-radio :value="1">
              <a-input-number v-model:value='authorityFormState.answerTime' :min="1"
                              :step="1"></a-input-number>
            </a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="questionnairePreview"
             @cancel="closeQuestionnaire('questionnaireType')"
             title="选择问卷"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='1000'
             :footer='null'
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >
      <div class='header'>
        <div class='header-container'>
          <div class='header-item'>
            <label style='min-width:90px;line-height:32px'>关键词搜索: </label>
            <a-input placeholder="支持名称搜索" v-model:value="questionnaireName"
                     @pressEnter="questionOrEvaluationCall({key:'questionnaireType'})"/>
          </div>
          <div class='header-item'>
            <label style='min-width:90px;line-height:32px'>问卷类型: </label>
            <a-select showSearch placeHolder="请选择问卷类型" v-model:value="questionnaireType" allowClear
                      style='min-width:100px;'>
              <a-select-option value="1">总部测评</a-select-option>
              <a-select-option value="2">校区测评</a-select-option>
            </a-select>
          </div>
          <a-button type="primary" @click="questionOrEvaluationCall({key:'questionnaireType'})">查询</a-button>
          <a-button type="primary" @click="newQuestionnaireOrEvaluation('questionnaireType')" style='margin-left: 50px'>
            新增问卷
          </a-button>
        </div>
      </div>
      <a-table :data-source="listOfQuestionnaireData"
               :loading='loading'
               :scroll='{y: "350px"}'
      >
        <a-table-column key="paperId"
                        title='问卷ID'
                        data-index="paperId"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="name"
                        title='问卷名称'
                        data-index="name"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="evaluateId"
                        title='问卷类型'
                        data-index="evaluateId"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getQuestionnaireType(text) }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="majorName"
                        title='问卷学科'
                        data-index="majorName"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="questionNumber"
                        title='题量'
                        data-index="questionNumber"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="status"
                        title='问卷状态'
                        data-index="status"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getEvaluationStatus(text) }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="paperId"
                        title='操作'
                        data-index="paperId"
                        width='200px'>
          <template #default="{ record }">
              <span>
                  <a-button type='link' @click='transferQuestionnaire(record,"questionnaireType")' style='padding:0;'
                            v-if='showTransfer(record,false)'>调用</a-button>
                  <a-button type='link' @click='cancelCall(record,"questionnaireType")' style='padding:0;'
                            v-if='showTransfer(record,true)'>取消调用</a-button>
                  <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button type='link' @click='previewExaminationQuestionnaire(record)'
                            style='padding:0;'>预览</a-button>
              </span>
          </template>
        </a-table-column>
      </a-table>
    </a-modal>

    <a-modal v-model:visible="evaluationPreview"
             @cancel="closeQuestionnaire('evaluationType')"
             title="选择测评"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='1000'
             :footer='null'
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >

      <div class='header'>
        <div class='header-container'>
          <div class='header-item'>
            <label style='min-width:90px;line-height:32px'>关键词搜索: </label>
            <a-input placeholder="支持名称搜索" v-model:value="evaluationName"
                     @pressEnter="questionOrEvaluationCall({key:'evaluationType'})"/>
          </div>
          <div class='header-item'>
            <label style='min-width:90px;line-height:32px'>测评类型: </label>
            <a-select showSearch placeHolder="请选择测评类型" v-model:value="evaluationType" allowClear
                      style='min-width:100px;'>
              <a-select-option value="1">招生测评</a-select-option>
              <a-select-option value="2">入学测评</a-select-option>
            </a-select>
          </div>
          <a-button type="primary" @click="questionOrEvaluationCall({key:'evaluationType'})">查询</a-button>
          <a-button type="primary" @click="newQuestionnaireOrEvaluation('evaluationType')" style='margin-left: 50px'>
            新增测评
          </a-button>
        </div>
      </div>
      <a-table :data-source="listOfEvaluationData"
               :loading='loading'
               :scroll='{y: "350px"}'
      >
        <a-table-column key="paperId"
                        title='测评ID'
                        data-index="paperId"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="name"
                        title='测评名称'
                        data-index="name"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="evaluateId"
                        title='测评类型'
                        data-index="evaluateId"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getEvaluationType(text) }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="majorName"
                        title='问卷学科'
                        data-index="majorName"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="questionNumber"
                        title='题量'
                        data-index="questionNumber"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="status"
                        title='问卷状态'
                        data-index="status"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getEvaluationStatus(text) }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="paperId"
                        title='操作'
                        data-index="paperId"
                        width='200px'>
          <template #default="{ record }">
              <span>
                  <a-button type='link' @click='transferQuestionnaire(record,"evaluationType")' style='padding:0;'
                            v-if='showTransfer(record,false)'>调用</a-button>
                  <a-button type='link' @click='cancelCall(record,"evaluationType")' style='padding:0;'
                            v-if='showTransfer(record,true)'>取消调用</a-button>
                  <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button type='link' @click='previewExaminationQuestionnaire(record)'
                            style='padding:0;'>预览</a-button>
              </span>
          </template>
        </a-table-column>
      </a-table>

    </a-modal>

    <a-modal v-model:visible="exerciseListPreview"
             @cancel="homeworkSubQuestionBank=[];exerciseListPreview=false"
             title="选择作业"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='1000'
             :footer='null'
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >

      <div class='header'>
        <div class='header-container'>
          <div class='header-item'>
            <a-select placeHolder="请选择查询关键字" v-model:value="queryKeywordsJob"
                      style='min-width:100px;' @change='queryKeywordsJobChange'>
              <a-select-option value="1">作业ID</a-select-option>
              <a-select-option value="2">作业名称</a-select-option>
            </a-select>
            <a-input placeholder="名称搜索" v-model:value="testExerciseName"
                     @pressEnter="getCallList('exercise')" v-if='queryKeywordsJob==="2"'/>
            <a-input placeholder="ID搜索" v-model:value="testExerciseId" type="number" min="0"
                     @pressEnter="getCallList('exercise')" v-if='queryKeywordsJob==="1"'/>
          </div>

          <div class='header-item'>
            <label style='min-width:90px;line-height:32px'>子题库: </label>
            <a-tree-select
              v-model:value="homeworkSubQuestionBank"
              :tree-data='exerciseSearch'
              show-search
              multiple
              tree-checkable
              style="width: 100%;text-align: left"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择子题库"
              allow-clear
              tree-default-expand-all
              @change='subQuestionBankChangeSearch($event,"exerciseSearch")'
            >
            </a-tree-select>
          </div>
          <a-button type="primary" @click="getCallList('exercise')">查询</a-button>
        </div>
      </div>
      <a-table :data-source="listOfDataExercise"
               :loading='loading'
               :scroll='{y: "350px"}'
      >
        <a-table-column key="id"
                        title='作业ID'
                        data-index="id"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="name"
                        title='作业名称'
                        data-index="name"
                        width='150px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="number"
                        title='题量'
                        data-index="number"
                        width='80px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="score"
                        title='分数'
                        data-index="score"
                        width='80px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="action"
                        title='操作'
                        data-index="action"
                        width='150px'>
          <template #default="{ record }">
              <span>
                  <a-button type='link' @click='transfer(record,true)' style='padding:0;'
                            v-if='showTransfer(record,false)'>调用</a-button>
                  <a-button type='link' @click='cancelCall(record,"evaluationType")' style='padding:0;'
                            v-if='showTransfer(record,true)'>取消调用</a-button>
                  <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button type='link' @click='previewExaminationPaper(record,packetInfo)'
                            style='padding:0;'>预览</a-button>
              </span>
          </template>
        </a-table-column>
      </a-table>

    </a-modal>

    <a-modal v-model:visible="examListPreview"
             @cancel="examSubQuestionBankExam=[];examListPreview=false"
             title="选择试卷"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='1000'
             :footer='null'
             :bodyStyle='{"overflow": "hidden",maxHeight:"550px"}'
    >

      <div class='header flex'>
        <div class='header-container'>
          <div class='header-item w31'>
            <a-select placeHolder="请选择查询关键字" v-model:value="queryKeywords"
                      style='min-width:100px;' @change='queryKeywordsChange'>
              <a-select-option value="1">试卷ID</a-select-option>
              <a-select-option value="2">试卷名称</a-select-option>
            </a-select>
            <a-input placeholder="名称搜索" v-model:value="testPaperName"
                     @pressEnter="getCallList('exam')" v-if='queryKeywords==="2"'/>
            <a-input placeholder="ID搜索" v-model:value="testPaperId" type="number" min="0"
                     @pressEnter="getCallList('exam')" v-if='queryKeywords==="1"'/>
          </div>

          <div class='header-item w31'>
            <label style='min-width:90px;line-height:32px'>组卷方式: </label>
            <a-select showSearch allowClear placeHolder="请选择组卷方式" v-model:value="formingMethod"
                      style='margin-right: 20px;width:calc(100% - 100px);flex:1'>
              <a-select-option value="1">选题组卷/录题组卷</a-select-option>
              <a-select-option value="2">题型难度</a-select-option>
              <a-select-option value="3">知识点难度抽题组卷</a-select-option>
              <a-select-option value="4">题型难度随机组卷</a-select-option>
            </a-select>
          </div>

          <div class='header-item mr0 w31'>
            <label style='min-width:90px;line-height:32px'>子题库: </label>
            <a-tree-select
              tree-checkable
              v-model:value="examSubQuestionBankExam"
              :tree-data='examSearch'
              show-search
              multiple
              style="width: 100%;text-align: left"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择子题库"
              allow-clear
              tree-default-expand-all
              @change='subQuestionBankChangeSearch($event,"examSearch")'
            >
            </a-tree-select>
          </div>
        </div>
        <a-button type="primary" @click="getCallList('exam')">查询</a-button>
      </div>
      <a-table :data-source="listOfData"
               :loading='loading'
               :scroll='{y: "350px"}'
      >
        <a-table-column key="id"
                        title='试卷ID'
                        data-index="id"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="name"
                        title='试卷名称'
                        data-index="name"
                        width='150px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="year"
                        title='试卷年份'
                        data-index="year"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="groupWay"
                        title='组卷方式'
                        data-index="groupWay"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getFormingMethod(text) }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="type"
                        title='试卷分类'
                        data-index="type"
                        width='100px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ getType(text) }}
                </span>
          </template>
        </a-table-column>

        <a-table-column key="number"
                        title='题量'
                        data-index="number"
                        width='80px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="score"
                        title='分数'
                        data-index="score"
                        width='80px'>
          <template #default="{ text }">
                <span class='synopsis-text'>
                  {{ text }}
                </span>
          </template>
        </a-table-column>
        <a-table-column key="action"
                        title='操作'
                        data-index="action"
                        width='150px'>
          <template #default="{ record }">
              <span>
                  <a-button type='link' @click='transfer(record,false)' style='padding:0;'
                            v-if='showTransfer(record,false)'>调用</a-button>
                  <a-button type='link' @click='cancelCall(record,"exam")' style='padding:0;'
                            v-if='showTransfer(record,true)'>取消调用</a-button>
                  <a-divider type="vertical" style='margin:0 10px'/>
                  <a-button type='link' @click='previewExaminationPaper(record,packetInfo)'
                            style='padding:0;'>预览</a-button>
              </span>
          </template>
        </a-table-column>
      </a-table>

    </a-modal>

    <a-modal v-model:visible="localUploadVisible"
             @cancel='localUploadVisible = false'
             title="本地上传"
             wrapClassName='member-modal'
             :maskClosable='false'
             :closable='true'
             :width='520'
             :footer='null'
             :bodyStyle='{"overflow": "hidden",maxHeight:"600px"}'
    >
      <div style='margin-bottom: 20px;'>
        <span style='color:red'>*</span>学习目标：
        <a-select showSearch placeHolder="请选择学习目标" v-model:value="localUploadLearnTarget" style='min-width:100px;'>
          <a-select-option value="1">了解</a-select-option>
          <a-select-option value="2">理解</a-select-option>
          <a-select-option value="3">掌握</a-select-option>
          <a-select-option value="4">应用</a-select-option>
          <a-select-option value="5">分析</a-select-option>
          <a-select-option value="6">创新</a-select-option>
        </a-select>
      </div>
      <!--      -->
      <a-upload
        v-model:file-list="localUploadFileList"
        :multiple="true"
        :customRequest='customRequest("package/localupload")'
        :before-upload='prepareBeforeUpload'
        accept='.jpg,.jpeg,.png,.bmp,.xls,.xlsx,.docx,.pdf,.doc,.pptx,.ppt,.mp4,.zip,.rar'
      >
        <a-button>
          <UploadOutlined/>
          上传文件
        </a-button>
      </a-upload>
      <span style='margin-top:15px;color: rgba(0,0,0,.45);font-size: 14px;'>支持扩展名：pdf 、doc 、docx 、xls 、xlsx 、ppt 、pptx 、png 、jpg 、bmp 、jpeg 、mp4 、zip 、rar</span>
      <div style="text-align: center;margin-top: 20px;">
        <a-button style="margin-right: 20px;" @click="localUploadCancel">取消</a-button>
        <a-button type="primary" :loading="loading" @click="localUploadConfirm">确定上传</a-button>
      </div>
    </a-modal>

    <a-modal v-model:visible="mainfileAssocateVisible"
             :maskClosable="false"
             title="讲义资源关联"
             wrapClassName='associate-modal'
             :footer='null'
             @cancel="closeAssocateBindModal()"
             :bodyStyle='{maxHeight:"500px",overflowY:"auto"}'
    >
      <a-spin :spinning="loading" :delay='1000'>
        <div class='associate'>
            <span style='float: left'>
              主讲义（共{{totalPage}}页）
            </span>
          <span style='float: right;cursor: pointer' @click='learnSetPreview(currentResource)'><EyeOutlined/>预览</span>
        </div>
        <div class='association-table' v-for='(itemArr,i) in mainFileAssocateClassList' :key='i'>
          <div style='margin-bottom: 10px;'>
            {{'第' + itemArr[0].sectionSeq + '节 ' + itemArr[0].sectionName}}
            <CaretRightOutlined @click='itemArr.expend=false' v-if='itemArr.expend' style='cursor: pointer'/>
            <CaretDownOutlined @click='itemArr.expend=true' v-if='!itemArr.expend' style='cursor: pointer'/>
          </div>
          <div v-for='item in itemArr' :class='{"h0":itemArr.expend,"association-list":true}' :key='item.id'>
            <div class='list-item'>
              <span class="associate-title" :title="item.name">
                 <a-avatar :size="20"
                           style="vertical-align: middle;margin-top:-5px"
                           shape='circle'
                           :style="{ 'background-color': getColor(item.taskType) }"
                 >{{getDescType(item.taskType)}}</a-avatar>
                 {{item.name}}
             </span>
              <a-input-number v-model:value="item.pageNum"
                              :min="1"
                              :max="1000000"
                              :step="1"
                              placeholder='请输入页码'
                              style='width:120px;float:right'
                              @change='pageNumModelChangeDetect($event)'
                              @focus='currentAssocatePageNum = undefined'
                              @blur='currentAssocatePageNum = undefined'
              ></a-input-number>
              <span style='min-width: 70px;float:right'>
                <a-checkbox v-model:checked="item.isBindAssoicate"
                            :disabled='(currentBindLength>=bindLimit&&(!item.isBindAssoicate))||(!item.pageNum)'
                            @change='isBindChange($event, item)'
                ></a-checkbox>
               <a-button type="dashed"
                         @click="getBindBlur(item)"
                         style='margin:0 10px'
                         :disabled='
                         (currentBindLength>=bindLimit)
                           ||
                           (!item.pageNum)
                           ||
                         item.isBindAssoicate'>{{'绑定'}}</a-button>
              </span>
            </div>
          </div>
        </div>
      </a-spin>
    </a-modal>

  </a-spin>
</template>
<script lang="ts">
import PrepareCourse from './prepare-course'

export default PrepareCourse
</script>
<style lang="less" scoped>
  @import './prepare-course';
</style>
