import { SeriesListDataType } from '../entity'
import { Modal } from 'ant-design-vue'
import { createVNode } from 'vue'
import { CloseCircleOutlined } from '@ant-design/icons-vue/lib'
import { SeriesManagementApi } from '../api'

export function useSeriesTableOperate (searchData) {
  /**
   * 删除系列
   * @param data
   */
  const del = (data:SeriesListDataType) => {
    Modal.confirm({
      title: '删除',
      icon: createVNode(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
      content: '删除该系列会导致该系列下的所有课包进行解绑，确定删除吗？',
      onOk () {
        return new Promise((resolve, reject) => {
          SeriesManagementApi.delSeries(data.id).then((res) => {
            if (res.data.status === 204) {
              searchData()
              resolve(true)
            } else {
              reject(new Error(res.data.message))
            }
          }).catch(err => {
            reject(err)
          })
        })
      }
    })
  }
  return {
    del
  }
}
