import { createVNode, ref } from 'vue'
import { Json } from '@/common/base'
import { ReadLibApi } from '@/app/views/resource-manage/pages/read-lib/api'
import { SessionStorageUtil } from '@/common/utils'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { message, Modal } from 'ant-design-vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'

export function useCallResource (route, tableState, menuService, callResourceData) {
  const permitedCall = ref(true)

  /**
   * 判断文件类型是否支持调用
   * @param fileType
   */
  const supportType = (fileType?: string) => {
    if (!fileType) {
      return true
    }
    const supportFileType: string = callResourceData.value.supportFileType
    if (!supportFileType) {
      return true
    }
    return supportFileType.indexOf(fileType.toLowerCase()) !== -1
  }

  /**
   * 判断调用是否已到上限
   */
  const setPermitedCall = () => {
    const limit = Number(callResourceData.value.limit)
    if (callResourceData.value.limit) {
      if (limit === 0) {
        permitedCall.value = true
      } else if (
        callResourceData.value.nodes.length >= limit || limit === -1
      ) {
        permitedCall.value = false
      } else {
        permitedCall.value = true
      }
    }
  }

  const completeCall = () => {
    menuService.goBack(false)
    menuService.gotoUrl({
      title: '课包建设',
      url: '/m/course-manage/prepare-course',
      paramUrl: ''
    })
  }

  const cancelCallResource = (data, index) => {
    Modal.confirm({
      title: '警告',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '取消调用资源（从课包中删除资源）将会导致现有记录丢失，确定取消调用吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          const task = route.query.task;
          (task === '1' ? ReadLibApi.delCourseSectionFileTask(data.taskId)
            : task === '2' ? ReadLibApi.levelInfoDel(data.taskId)
              : ReadLibApi.delCourseSectionFile(data.taskId)).then(res => {
            if (res.data.status === 204) {
              if (route.query.reward === '1') {
                CommonApi.statisticsLog({
                  name: '关卡奖励设置阅读库取消调用',
                  actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
                  content: data.taskId
                })
              } else {
                let field = ''
                if (task === '1') {
                  field = 'learnSet-task-action'
                } else if (task === '101') {
                  field = 'learnSet-lecture-action'
                } else if (task === '104') {
                  field = 'learnSet-material-action'
                } else {
                  field = 'learnSet-record-action'
                }
                CommonApi.statisticsLog({
                  name: '阅读库取消调用',
                  actionCode: STATISTICALRULES.packetInfo[field].delCode,
                  content: data.taskId
                })
              }
              tableState.data[index].isCall = false
              callResourceData.value.nodes = callResourceData.value.nodes.filter(
                (item) => item.id !== tableState.data[index].id
              )
              callResourceData.value.seq -= 1
              SessionStorageUtil.putScpResourceMaterial(callResourceData.value)
              setPermitedCall()
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => reject(err))
        })
      }
    })
  }

  const callResource = (data, index) => {
    const task = route.query.task
    const params: Json = {
      ...callResourceData.value.sectionInfo,
      resourceId: data.id
    }
    if (task === '1') {
      params.sourceType = data.sourceType
      params.name = data.title
      params.taskType = '0'
      params.downloadType = '0'
    } else if (task === '2') {
      params.title = data.title
    } else {
      params.sourceType = data.sourceType
      if (task === '101') {
        params.downloadType = '0'
      } else {
        params.downloadType = '2'
      }
      params.resourceId = data.id
      params.type = task
      params.category = data.category
      params.title = data.title
    }
    params.seq = SessionStorageUtil.getScpResourceMaterial().seq;
    (task === '1' ? ReadLibApi.invokeCourseSectionFileTask(params) : task === '2' ? ReadLibApi.levelInfoAddOrModify(params) : ReadLibApi.invokeCourseSectionFile(params)).then(res => {
      if (res.data.status === 201) {
        let field = ''
        if (task === '1') {
          field = 'learnSet-task-action'
        } else if (task === '101') {
          field = 'learnSet-lecture-action'
        } else if (task === '104') {
          field = 'learnSet-material-action'
        } else {
          field = 'learnSet-record-action'
        }
        if (route.query.reward === '1') {
          CommonApi.statisticsLog({
            name: '关卡奖励设置阅读库调用',
            actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
            content: JSON.stringify(params)
          })
        } else {
          CommonApi.statisticsLog({
            name: '阅读库调用',
            actionCode: STATISTICALRULES.packetInfo[field].addCode,
            content: JSON.stringify(params)
          })
        }
        if (res.data.data && res.data.data.id) {
          tableState.data[index].isCall = true
          tableState.data[index].taskId = res.data.data.id
          tableState.data[index].taskType = res.data.data.taskType
          callResourceData.value.nodes.push({
            id: tableState.data[index].id,
            taskId: res.data.data.id,
            taskType: res.data.data.taskType
          })
          callResourceData.value.seq += 1
          SessionStorageUtil.putScpResourceMaterial(callResourceData.value)
          setPermitedCall()
        }
      } else if (res.data.status === 500 && data.title.length > 30) {
        message.error('可能标题太长，请编辑资源标题保持30字符以内')
      }
    })
  }

  return {
    permitedCall,
    callResource,
    cancelCallResource,
    completeCall,
    callResourceData,
    supportType,
    setPermitedCall
  }
}
