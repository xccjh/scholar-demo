import { CaseMaterialsDataType } from '../entity'
import { message, Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { CaseLibApi } from '../api'
import { SessionStorageUtil } from '@/common/utils'

export function useCaseTableOperate (menuService, searchData, currentCourseId, conditionObj) {
  /**
   * 删除案例资源
   * @param data
   */
  const del = (data: CaseMaterialsDataType): void => {
    Modal.confirm({
      title: '删除',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: `确定删除${data.title}的案例资源？`,
      onOk () {
        return new Promise((resolve, reject) => {
          CaseLibApi.delResource(data.id).then(res => {
            if (res.data.status === 200) {
              resolve(true)
              searchData()
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => reject(err))
        })
      }
    })
  }

  /**
   * 复制案例
   * @param data
   */
  const copy = (data: CaseMaterialsDataType) => {
    Modal.confirm({
      title: '案例复制',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: `确定复制${data.title}的案例资源？`,
      onOk () {
        return new Promise((resolve, reject) => {
          CaseLibApi.copyResource(data.id).then(res => {
            if (res.data.status === 201) {
              resolve(true)
              searchData()
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => reject(err))
        })
      }
    })
  }
  /**
   * 预览
   * @param data
   */
  const preview = (data: CaseMaterialsDataType): void => {
    SessionStorageUtil.removeCaseBackPath()
    menuService.gotoUrl({
      url: '/m/rm/material-pre-case',
      paramUrl: `/${data.id}/${data.type}/${currentCourseId.value}`,
      title: '预览案例'
    })
  }

  /**
   * 编辑案例
   * @param data
   */
  const edit = (data: CaseMaterialsDataType): void => {
    menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/${data.id}/${data.type}/${currentCourseId.value}`,
      title: '编辑案例'
    })
  }

  /**
   * 新增案例资料
   * @param e 菜单项信息
   */
  const addCaseMaterials = () => {
    if (!currentCourseId.value) {
      return message.error('还没有建立课程哦~')
    }
    menuService.gotoUrl({
      url: '/m/rm/material-details',
      paramUrl: `/0/104/${currentCourseId.value}?knowledgePointId=${conditionObj.knowledgePointId || ''}&t=${new Date().getTime()}`,
      title: '新增案例'
    })
  }

  return { del, addCaseMaterials, edit, preview, copy }
}
