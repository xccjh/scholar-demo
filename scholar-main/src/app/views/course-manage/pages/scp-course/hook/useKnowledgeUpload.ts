import { reactive, ref, UnwrapRef } from 'vue'
import { CommonVideoItem } from '@/app/views/course-manage/pages/course-preview/entity'
import { getPreview, queryParam, ToolsUtil } from '@/common/utils'
import { message } from 'ant-design-vue'
import { hexSha1 } from '@/common/utils/sha1'
import { ScpCourseApi } from '../api'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'

export function useKnowledgeUpload (formStateKnowledge, localVideoFileList) {
  let reset = false
  const polywayVisible = ref(false) //  保利威弹框
  const localUploadvisible = ref(false) //  本地上传弹框
  const localVideoFromRef = ref()
  const polywayFromRef = ref()
  const polywayFromRules = {
    attachmentPath: [
      { required: true, message: '请填写保利威ID', trigger: 'blur' }
    ],
    attachmentName: [
      { required: true, message: '请填写视频名称', trigger: 'blur' },
      { whitespace: true, message: '请填写视频名称', trigger: 'blur' },
      { min: 0, max: 100, message: '视频名称不能超过100个字符', trigger: 'change' }
    ]
  }
  const localVideoFromRules = {
    attachmentPath: [
      { required: true, message: '请上传视频', trigger: 'blur' }
    ],
    attachmentName: [
      { required: true, message: '请填写视频名称', trigger: 'blur' },
      { whitespace: true, message: '请填写视频名称', trigger: 'blur' },
      { min: 0, max: 100, message: '视频名称不能超过100个字符', trigger: 'change' }
    ]
  }
  const videoUpload: { polywayFrom: UnwrapRef<CommonVideoItem>, localVideoFrom: UnwrapRef<CommonVideoItem> } = {
    polywayFrom: reactive({
      attachmentPath: '',
      id: '',
      attachmentName: '',
      seq: 1
    }),
    localVideoFrom: reactive({
      attachmentPath: '',
      id: '',
      attachmentName: '',
      seq: 1
    })
  }
  /**
   * 打开上传视频弹框
   * @param label 类型
   * @param add 操作
   */
  const uploadExplanationVideo = (label: 'polywayFrom' | 'localVideoFrom', add = true) => {
    reset = add
    if (reset) { // 新增
      videoUpload[label].attachmentPath = ''
      videoUpload[label].seq = ToolsUtil.getMaxSeq(formStateKnowledge.explanationVideo)
      videoUpload[label].attachmentName = ''
      videoUpload[label].id = ''
    }
    if (label === 'polywayFrom') {
      polywayVisible.value = true
    } else {
      localVideoFileList.value = []
      localUploadvisible.value = true
    }
  }

  /**
   * 判断是否已经存在同地址或同名的数据
   * @param pre 已经存在的数据
   * @param label  类型
   * @param edit 找到编辑对应的索引
   * @param reset 新增/编辑
   */
  const verifySameName = (pre: Partial<CommonVideoItem>[], label: 'polywayFrom' | 'localVideoFrom', edit: { index: number }, reset: boolean) => {
    // 判断是否跟存在数据同地址
    const flag = pre.every((ee, ii) => {
      // 编辑状态且是对应项 (对应项改动跳过本项同名校验)
      const editself = (!reset) && ee.id === videoUpload[label].id
      if (editself) {
        return true
      } else {
        // 编辑状态下其他项或新增状态下
        if (ee.attachmentPath === videoUpload[label].attachmentPath) { // 找到同地址项索引
          edit.index = ii
        } else {
          return true
        }
      }
    })
    if (!flag) { // 新增状态下有同名项
      message.warning(label === 'localVideoFrom' ? '讲解视频已经存在同地址视频' : '讲解视频已经存在该id视频')
      return false
    }

    // 判断是否跟存在数据同名
    const flag3 = pre.every((value) => {
      const editself = (!reset) && value.id === videoUpload[label].id
      const isSame = value.attachmentName !== videoUpload[label].attachmentName
      if (editself || isSame) { // 编辑状态且是对应项跳过本项同名校验   或   不同名跳过
        return true
      }
    })

    if (!flag3) {
      message.warning('讲解视频已经存在该视频名称，请更换名称')
    } else {
      return true
    }
  }

  /**
   * @param reset 新增/编辑
   * @param pre 已经存在的数据
   * @param label 类型
   * @param editIndex 当前存储项索引
   */
  const storingData = (reset: boolean, pre: Partial<CommonVideoItem>[], label: 'polywayFrom' | 'localVideoFrom', editIndex: number) => {
    if (reset) { // 新增
      videoUpload[label].id = ToolsUtil.getRandomFileName()
      formStateKnowledge.explanationVideo = [...pre, JSON.parse(JSON.stringify(videoUpload[label]))]
    } else { // 编辑
      const {
        attachmentPath,
        attachmentName
      } = videoUpload[label]
      pre[editIndex].attachmentName = attachmentName
      pre[editIndex].attachmentPath = attachmentPath
      formStateKnowledge.explanationVideo = pre
    }
    if (label === 'polywayFrom') {
      polywayVisible.value = false
    } else {
      localUploadvisible.value = false
    }
  }

  /**
   * 确定上传
   * @param label
   */
  const confirmUpload = (label: 'polywayFrom' | 'localVideoFrom') => {
    let frormRef = polywayFromRef
    if (label === 'localVideoFrom') {
      frormRef = localVideoFromRef
    }
    frormRef.value
      .validate()
      .then(() => {
        return new Promise((resolve, reject) => {
          const edit = {
            index: 0
          }
          const pre = formStateKnowledge.explanationVideo
          if (pre.length) {
            if (!verifySameName(pre, label, edit, reset)) {
              reject(new Error('已经存在同名'))
              return
            }
          }
          if (label === 'polywayFrom') {
            const params: Partial<{
              sign: string;
              ptime: number;
              vids: string
            }> = {
              ptime: new Date().getTime(),
              vids: videoUpload[label].attachmentPath
            }
            const sign = hexSha1(queryParam(params) + process.env.VUE_APP_secretkey)
            params.sign = sign.toUpperCase()
            ScpCourseApi.getVideoLength(params).then(res => {
              if (res.data.code === 200) {
                if (res.data.data.length) {
                  storingData(reset, pre, label, edit.index)
                  resolve(true)
                } else {
                  message.warning('请填写正确的视频ID')
                  reject(new Error('请填写正确的视频ID'))
                }
              } else {
                message.warning('请填写正确的视频ID')
                reject(new Error('请填写正确的视频ID'))
              }
            }, () => {
              message.warning('保利威id校验服务异常,请稍后再试')
              reject(new Error('保利威id校验服务异常,请稍后再试'))
            })
          } else {
            storingData(reset, pre, label, edit.index)
            resolve(true)
          }
        })
      })
      .catch((error: ValidateErrorEntity<CommonVideoItem>) => {
        console.log((error))
      })
  }

  /**
   * 编辑文件
   * @param fileItem
   */
  const editFileItem = (fileItem: CommonVideoItem) => {
    if (fileItem.attachmentPath.indexOf('.') < 0) {
      videoUpload.polywayFrom.attachmentPath = fileItem.attachmentPath
      videoUpload.polywayFrom.id = fileItem.id
      videoUpload.polywayFrom.attachmentName = fileItem.attachmentName
      videoUpload.polywayFrom.seq = fileItem.seq
      uploadExplanationVideo('polywayFrom', false)
    } else {
      videoUpload.localVideoFrom.attachmentPath = fileItem.attachmentPath
      videoUpload.localVideoFrom.id = fileItem.id
      videoUpload.localVideoFrom.attachmentName = fileItem.attachmentName
      videoUpload.localVideoFrom.seq = fileItem.seq
      uploadExplanationVideo('localVideoFrom', false)
      localVideoFileList.value = [{
        uid: ToolsUtil.getRandomFileName(),
        type: 'video/mp4',
        name: ToolsUtil.getFileName(fileItem.attachmentPath),
        thumbUrl: getPreview(fileItem.attachmentPath),
        response: {
          objectName: ToolsUtil.getOssUrl(fileItem.attachmentPath)
        }
      }]
    }
  }

  /**
   * 移除文件
   * @param fileItem
   * @param label
   */
  const removeFileItem = (fileItem: Partial<CommonVideoItem>, label: 'learningMaterials' | 'explanationVideo') => {
    if (label === 'learningMaterials') {
      if (formStateKnowledge.learningMaterials.length) {
        formStateKnowledge.learningMaterials.every((ee, ii) => {
          if (ee.id === fileItem.id) {
            formStateKnowledge.learningMaterials.splice(ii, 1)
          } else {
            return true
          }
        })
      }
    } else {
      if (formStateKnowledge.explanationVideo.length) {
        formStateKnowledge.explanationVideo.every((ee, ii) => {
          if (ee.id === fileItem.id) {
            formStateKnowledge.explanationVideo.splice(ii, 1)
          } else {
            return true
          }
        })
      }
    }
  }
  return {
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
    videoUpload
  }
}
