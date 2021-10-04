import { computed, defineComponent, toRefs, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { MenuServiceKey } from '@/common/services'
import { useStore } from 'vuex'
import {
  getName,
  getPreview,
  isPicture,
  LocalStorageUtil,
  randomString,
  SessionStorageUtil,
  ToolsUtil
} from '@/common/utils'
import { MemberItem } from './entity'
import { message } from 'ant-design-vue'
import { AliOssInstane, UploadXHRArgs } from '@/common/services/ali-oss.service'
import { Json } from '@/common/base'
import { CourseListApi } from '../course-list/api'
import { win } from '@/common/base/common'
import { ScpCourseApi } from './api'
import { CoursePreviewApi } from '@/app/views/course-manage/pages/course-preview/api'
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router'
import { CommonVideoItem } from '@/app/views/course-manage/pages/course-preview/entity'
import { useRequiredInject } from '@/common/hooks'
import { uesTabChange, useCourseInfo, useKnowledge, useTabTopOperate } from './hook'
import { beforeUpload, checkChange, filePreview, previewItem, templateDownload } from './utils'

declare const window: win
export default defineComponent({
  name: 'scp-course',
  components: {
    draggable
  },
  async setup () {
    const store = useStore()
    const userId = LocalStorageUtil.getUserId()
    const loading = computed(() => store.state.loading)
    const route: RouteLocationNormalizedLoaded = useRoute()
    const menuService = useRequiredInject(MenuServiceKey)
    const title = SessionStorageUtil.getCourseName()
    const courseInfo:Json = { // 课程信息变更检测
      bakCheck: {}
    }
    const attachmentInformation :{ // 切换知识点用来讲解视频视频和学习资料变更检测
      explanationVideoBak:Partial<CommonVideoItem>[],
      learningMaterialsBak:Partial<CommonVideoItem>[]
    } = {
      explanationVideoBak: [],
      learningMaterialsBak: []
    }

    /**
     * 课程进度
     */
    const {
      curProgress,
      tabCurProgress,
      changeProgress
    } = uesTabChange(route, (cb) => {
      saveData(cb)
    })

    /**
     * 课程信息
     */
    const {
      /**
       * 课程表单
       */
      formRef,
      formState,
      rules,
      state, // 课程成员信息
      detailRecordEnd, // 初始化回显结束
      fileList, // 课程封面
      getMemberList, // 课程组成员列表
      getAdustList, // 习题审核成员列表
      removeCourseCover, // 移除课程封面
      checkCourseInfoChange, // 检查课程信息变更

      /**
       * 课程信息弹框
       */
      aduitStaffVisible,
      courseStaffVisible,
      aduitKey,
      courseKey,
      courseSearch,
      AduitSearch,
      removeAduitMember,
      addAduitMember,
      removeMember,
      addMember,
      aduitItemSelectInner,
      itemSelectInner,
      courseComfirm,
      courseCancel,
      auditCancel,
      auditComfirm,
      clickAduit
    } = useCourseInfo(route, courseInfo)

    const {
      /**
       * 头操作
       */
      disableImportAtlasFileList,
      importAtlasFileList,
      importAtlasVisible,
      knowledgeExcelUploadPercent,
      knowledgeExcelUploading,
      importAtlasCancel,
      importAtlasComfirm,
      importAtlasModal,
      filterKnowledgePointsClick,
      exportKnowledgeExcel,
      exportKnowledgeDetail,
      businessLoading,
      resetMap,
      resetKnowledges,
      /**
       * 表单操作
       */
      // 知识点表单
      formRefKnowledge,
      formStateKnowledge,
      chapterWeight,
      localVideoFileList,
      learningMaterialsFileList,
      disableLearningMaterialsFileUpload,
      handelChange,
      // 富文本
      config,
      loadObj,
      ClassicEditor,
      // 讲解视频
      uploadExplanationVideo,
      confirmUpload,
      removeFileItem,
      editFileItem,
      polywayVisible,
      localUploadvisible,
      polywayFromRef,
      localVideoFromRef,
      localVideoFromRules,
      polywayFromRules,
      videoUpload,
      /**
       * 树操作
       */
      expandedKeys,
      selectedKeys,
      searchValue,
      autoExpandParent,
      treeData,
      activedNode,
      totalWeight,
      onExpand,
      getKnowledgeTree,
      saveNode,
      onDragEnter, // 拖
      onDrop, // 拽
      addNode, // 加
      delNode, // 删
      editNode, // 笔
      cancelEdit, // 勾
      confirmEdit, // 叉
      selectTree // 点
    } = useKnowledge(route, attachmentInformation)

    /**
     * 根据tab自动校验保存
     * @param callback 回调
     */
    const saveData = (callback?) => {
      if (curProgress.value === 0) { // 保存课程建设
        formRef.value.validate().then(() => {
          if (checkCourseInfoChange()) {
            const { courseMemberUserIdList, introduction, exercisesAuditUserIdList, coverPath } = formState
            if (exercisesAuditUserIdList.length) {
              ScpCourseApi.saveTheQuestionBankExerciseReviewer((getAdustList.value as MemberItem[]).map(e => e.telphone).join(',')).then(res => {
                if (res.data.code === 200) {
                  ScpCourseApi.curriculumConstructionSave({
                    courseMemberUserIdList: courseMemberUserIdList,
                    introduction,
                    exercisesAuditUserIdList: exercisesAuditUserIdList,
                    coverPath,
                    id: route.params.courseId
                  }).then(resp => {
                    if (resp.data.status === 201) {
                      courseInfo.bakCheck = {
                        courseMemberUserIdList,
                        introduction,
                        exercisesAuditUserIdList,
                        coverPath,
                        id: route.params.courseId
                      }
                      callback && callback()
                      // courseTabChange(direction, index)
                    } else {
                      nextTick(() => {
                        curProgress.value = 0
                      })
                    }
                  }).catch(() => {
                    nextTick(() => {
                      curProgress.value = 0
                    })
                  })
                } else {
                  nextTick(() => {
                    curProgress.value = 0
                  })
                }
              }).catch(() => {
                nextTick(() => {
                  curProgress.value = 0
                })
              })
            } else {
              ScpCourseApi.curriculumConstructionSave({
                courseMemberUserIdList: courseMemberUserIdList,
                introduction,
                exercisesAuditUserIdList: exercisesAuditUserIdList,
                coverPath,
                id: route.params.courseId
              }).then(resp => {
                if (resp.data.status === 201) {
                  courseInfo.bakCheck = {
                    courseMemberUserIdList,
                    introduction,
                    exercisesAuditUserIdList,
                    coverPath,
                    id: route.params.courseId
                  }
                  // courseTabChange(direction, index)
                  callback && callback()
                } else {
                  nextTick(() => {
                    curProgress.value = 0
                  })
                }
              }).catch(() => {
                nextTick(() => {
                  curProgress.value = 0
                })
              })
            }
          } else {
            // courseTabChange(direction, index)
            callback && callback()
          }
        }).catch(err => {
          message.warning('请按规则填写所有必填项')
          console.log(err)
          nextTick(() => {
            curProgress.value = 0
          })
        })
      } else if (curProgress.value === 1) { // 保存知识图谱
        const { kType, weight } = activedNode.value
        if (kType === '2') {
          if (weight !== chapterWeight) {
            saveNode(activedNode.value).then((flagP) => {
              if (flagP) {
                // courseTabChange(direction, index)
                callback && callback()
              } else {
                nextTick(() => {
                  curProgress.value = 1
                })
              }
            }).catch(() => {
              nextTick(() => {
                curProgress.value = 1
              })
            })
          } else {
            // courseTabChange(direction, index)
            callback && callback()
          }
        } else if (kType === '4') {
          if (checkChange(activedNode, formStateKnowledge, attachmentInformation.learningMaterialsBak, attachmentInformation.explanationVideoBak)) {
            saveNode(activedNode.value).then((flagP) => {
              if (flagP) {
                const explanationVideo: Partial<CommonVideoItem>[] = []
                const learningMaterials: Partial<CommonVideoItem>[] = []
                activedNode.value.fileList.forEach(e => {
                  if (e.fileType === 1) {
                    explanationVideo.push(e)
                  } else {
                    learningMaterials.push(e)
                  }
                })
                formStateKnowledge.explanationVideo = explanationVideo
                formStateKnowledge.learningMaterials = learningMaterials
                attachmentInformation.explanationVideoBak = JSON.parse(JSON.stringify(explanationVideo))
                attachmentInformation.learningMaterialsBak = JSON.parse(JSON.stringify(learningMaterials))
                // courseTabChange(direction, index)
                callback && callback()
              } else {
                nextTick(() => {
                  curProgress.value = 1
                })
              }
            }).catch(() => {
              nextTick(() => {
                curProgress.value = 1
              })
            })
          } else {
            // courseTabChange(direction, index)
            callback && callback()
          }
        } else {
          // courseTabChange(direction, index)
          callback && callback()
        }
      }
    }

    /**
     * 初始化课程信息
     */
    const initData = () => {
      Promise.all([CourseListApi.getChargeList({
        platformId: window.__platform__,
        subCode: ToolsUtil.getOrgCode()
      }), ScpCourseApi.getExerciseReviewList()]).then(data => {
        if (data[0].data.status === 200) {
          state.roleArr = data[0].data.data
          state.roleInitArr = JSON.parse(JSON.stringify(state.roleArr))
          state.roleArrBak = JSON.parse(JSON.stringify(state.roleArr))
        }
        if (data[1].data.status === 200) {
          state.nodes = data[1].data.data.filter(item => item.teacherList && item.teacherList.length > 0)
          state.nodesBak = JSON.parse(JSON.stringify(state.nodes))
          state.nodesInit = JSON.parse(JSON.stringify(state.nodes))
          if (state.nodesBak && state.nodesInit) {
            state.nodesBak[0].expand = state.nodesInit[0].expand = true
          }
        }
        CoursePreviewApi.getCourseDetail(route.params.courseId).then(res => {
          if (res.data.status === 200) {
            const {
              courseMemberUserIdList,
              exercisesAuditUserIdList,
              id,
              courseDetail
            } = res.data.data
            courseInfo.bakCheck = {
              courseMemberUserIdList,
              exercisesAuditUserIdList,
              id,
              introduction: courseDetail.introduction,
              coverPath: courseDetail.coverPath
            }
            formState.courseMemberUserIdList = courseMemberUserIdList
            formState.exercisesAuditUserIdList = exercisesAuditUserIdList
            formState.introduction = courseDetail.introduction
            formState.id = id
            formState.coverPath = courseDetail.coverPath
            if (formState.coverPath) {
              fileList.value = [{
                uid: ToolsUtil.getRandomFileName(),
                name: ToolsUtil.getFileName(courseDetail.coverPath),
                type: 'image/png',
                thumbUrl: ToolsUtil.getOssUrl(courseDetail.coverPath) + '?x-oss-process=image/resize,m_fill,h_62,w_62',
                response: {
                  objectName: courseDetail.coverPath
                }
              }]
            }
            getMemberList.value = courseMemberUserIdList
            getAdustList.value = exercisesAuditUserIdList
            detailRecordEnd.value = true
            if (courseMemberUserIdList.length) {
              courseMemberUserIdList.forEach(itemU => {
                (state.roleArrBak || []).every(nodeIp => {
                  if (nodeIp.id === itemU) {
                    nodeIp.isSelected = true
                  } else {
                    return true
                  }
                })
              })
            }
            if (exercisesAuditUserIdList.length) {
              exercisesAuditUserIdList.forEach(item => {
                (state.nodesBak || []).every(node => {
                  node.teacherList.every(nodeI => {
                    if (nodeI.id === item) {
                      nodeI.isSelected = true
                    } else {
                      return true
                    }
                  })
                })
              })
            }
            state.initPage = false
          }
        })
      })
    }

    const fileListMap = {
      localVideoFileList, // 讲解视频本地上传文件
      learningMaterialsFileList, // 学习资料
      importAtlasFileList, // 导入图谱文件
      fileList // 课程封面
    }

    /**
     * oss自定义上传文件
     * */
    const customRequest = (dir = 'scp-course/coverPath', fileListkey: 'importAtlasFileList' | 'learningMaterialsFileList' | 'fileList' | 'localVideoFileList') => {
      return (args: UploadXHRArgs) => {
        const uploadDir = dir
        const fileList = fileListMap[fileListkey]
        AliOssInstane.upload2AliOSS(args, uploadDir).then((imageUrl: string) => {
          if (fileListkey === 'learningMaterialsFileList') {
            if (fileList.value.every(item => item.response)) {
              formStateKnowledge.learningMaterials = [...formStateKnowledge.learningMaterials, ...fileList.value.filter(e => e.response).map(fileItem => ({
                attachmentPath: ToolsUtil.getOssUrl(fileItem.response.objectName, false),
                attachmentName: fileItem.name,
                id: randomString(),
                seq: ToolsUtil.getMaxSeq(fileList.value)
              }))]
              fileListMap[fileListkey].value = []
            }
          }
          if (fileListkey === 'localVideoFileList') {
            videoUpload.localVideoFrom.attachmentPath = ToolsUtil.getOssUrl(imageUrl, false)
          }
          if (fileListkey === 'fileList') {
            formState.coverPath = ToolsUtil.getOssUrl(imageUrl, false)
            formRef.value.clearValidate('coverPath')
          }
        }).catch((err) => {
          console.log(err)
          message.error('上传出错，请稍后再试')
        })
      }
    }

    /**
     * 顶部导航操作
     */
    const {
      goback,
      submitReview,
      approveAllDisabled
    } = useTabTopOperate(saveData, menuService, treeData, route, userId, title)

    /**
     * 课程信息
     */
    initData()
    /**
     * 知识图谱
     */
    getKnowledgeTree()

    return {
      title,
      loading,
      curProgress,
      tabCurProgress,
      formRef,
      formState,
      rules,
      // 选择弹框相关
      aduitStaffVisible,
      courseStaffVisible,
      aduitKey,
      courseKey,
      getMemberList,
      getAdustList,
      ...toRefs(state),
      addMember,
      addAduitMember,
      removeMember,
      removeAduitMember,
      itemSelectInner,
      aduitItemSelectInner,
      auditCancel,
      auditComfirm,
      courseCancel,
      courseComfirm,
      courseSearch,
      AduitSearch,
      clickAduit,
      // 图片上传相关
      fileList,
      customRequest,
      beforeUpload,
      filePreview,
      handelChange,
      removeCourseCover,
      // 知识图谱顶部
      filterKnowledgePointsClick,
      exportKnowledgeExcel,
      exportKnowledgeDetail,
      resetMap,
      resetKnowledges,
      businessLoading,
      // 知识图谱树相关
      selectTree,
      onExpand,
      expandedKeys,
      selectedKeys,
      searchValue,
      autoExpandParent,
      treeData,
      activedNode,
      auditStatus: route.params.auditStatus as string,
      status: route.params.status as string,
      totalWeight,
      chapterWeight,
      formRefKnowledge,
      formStateKnowledge,
      previewItem,
      getName,
      getPreview,
      isPicture,
      // 富文本相关
      ClassicEditor,
      config,
      loadObj,
      // 资料上传相关
      uploadExplanationVideo,
      confirmUpload,
      removeFileItem,
      editFileItem,
      polywayVisible,
      localUploadvisible,
      polywayFromRef,
      localVideoFromRef,
      localVideoFromRules,
      polywayFromRules,
      localVideoFileList,
      learningMaterialsFileList,
      disableLearningMaterialsFileUpload,
      ...videoUpload,
      // 树节点操作相关
      editNode,
      delNode,
      addNode,
      confirmEdit,
      cancelEdit,
      onDragEnter,
      onDrop,
      // 导入图谱相关
      importAtlasCancel,
      importAtlasComfirm,
      templateDownload,
      importAtlasModal,
      importAtlasVisible,
      importAtlasFileList,
      disableImportAtlasFileList,
      knowledgeExcelUploadPercent,
      knowledgeExcelUploading,
      // 提交审批
      submitReview,
      approveAllDisabled,
      changeProgress,
      goback
    }
  }
})
