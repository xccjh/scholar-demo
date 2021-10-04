import { nextTick, ref } from 'vue'
import { CommonData, Json } from '@/common/base'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { SessionStorageUtil } from '@/common/utils'
import { AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

export function useTrainKjl (packetInfo) {
  const bookkeeperOn = ref(packetInfo.isKjlTrain === '1')
  const kjlOption = ref<{kjlCourseId: string; name: string, checked?: boolean}[]>([])
  const kjlLists = ref<Json>([])
  let lockcheck = false
  /**
   * 开启实训
   * @param val
   */
  const bookkeeperOnChange = (val) => {
    const flag = val ? '1' : '0'
    packetInfo.isKjlTrain = flag
    PrepareCourseApi.packageInfoUpdate({ id: packetInfo.id, isKjlTrain: flag }).then(
      res => {
        if (res.data.status === 201) {
          if (flag === '1') {
            if (kjlOption.value.length) {
              getKjlTrain()
            } else {
              getKjlOption().then(res => {
                if (res) {
                  getKjlTrain()
                }
              })
            }
          }
          SessionStorageUtil.putPacketInfoItem('isKjlTrain', flag)
        }
      }
    )
  }

  /**
   * 获取实训回显
   */
  const getKjlTrain = () => {
    return new Promise((resolve) => {
      PrepareCourseApi.getKjlTrain(packetInfo.id).then(
        res => {
          if (res.data.status === 200) {
            kjlLists.value = res.data.data
            resolve(true)
          }
        })
    })
  }

  /**
   * 获取会计乐实训选项
   */
  const getKjlOption = () => {
    return new Promise((resolve) => {
      PrepareCourseApi.getKjlOption().then((res:AxiosResponse<CommonData<{kjlCourseId: string; name: string, checked?: boolean}>>) => {
        if (res.data.status === 200) {
          kjlOption.value = res.data.data
          resolve(true)
        }
      })
    })
  }

  /**
   * 初始化实训数据
   */
  const initBookkeeper = () => {
    if (packetInfo.isKjlTrain === '1') {
      getKjlOption().then(res => {
        if (res) {
          getKjlTrain().then(res => {
            if (res) {
              syncChecked()
            }
          })
        }
      })
    }
  }

  /**
   * 回显选项
   */
  const syncChecked = () => {
    kjlLists.value.forEach(kjlItem => {
      kjlOption.value.every((item) => {
        if (kjlItem.code === item.kjlCourseId) {
          item.checked = true
        } else {
          return true
        }
      })
    })
  }

  /**
   * 新增删除会计乐
   * @param flag
   * @param item
   */
  const bookkeeperChange = (e, item) => {
    if (!lockcheck) {
      lockcheck = true
      if (e.target.checked) {
        const params = {
          courseId: packetInfo.courseId,
          coursePacketId: packetInfo.id,
          name: item.name,
          code: item.kjlCourseId,
          trainType: '0',
          status: '1',
          seq: 0
        }
        PrepareCourseApi.saveKjlTrain(params).then(res => {
          if (res.data.status === 201) {
            getKjlTrain().then(() => {
              lockcheck = false
            })
          }
        })
      } else {
        const id = kjlLists.value.find(kjlItem => kjlItem.code === item.kjlCourseId).id
        PrepareCourseApi.delKjlTrain(id).then(res => {
          if (res.data.status === 204) {
            getKjlTrain().then(() => {
              lockcheck = false
            })
          }
        })
      }
    } else {
      message.warning('正在处理中，请稍后再操作')
      nextTick(() => {
        item.checked = !e.target.checked
      })
    }
  }
  // initBookkeeper()
  return {
    bookkeeperOn,
    bookkeeperOnChange,
    bookkeeperChange,
    kjlOption,
    kjlLists,
    initBookkeeper
  }
}
