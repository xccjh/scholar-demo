import { Subject, timer } from 'rxjs'
import { nextTick, onUnmounted, reactive, Ref, UnwrapRef, watch } from 'vue'
import { SessionStorageUtil } from '@/common/utils'
import { debounceTime } from 'rxjs/operators'
import { Json, Sorter } from '@/common/base'
import { PAGE_CONSTANT } from '@/common/constants'
import { SearchTableState } from '../entity'
import { moment } from '@/main'

export function useSearchTableAdance<T> (
  _PAGE_ID_: string, // 唯一标识
  cachedKeys: Json, // 缓存字段
  getListData: (tableState: UnwrapRef<SearchTableState<T>>, pageChange?: boolean, sorter?: Sorter, storingData?: () => void) => void, // 数据刷新
  unsubscribe = true // 异步标识
) {
  const allTmpKeys = JSON.parse(JSON.stringify(cachedKeys))
  Object.keys(allTmpKeys).forEach(key => {
    allTmpKeys[key + 'ue'] = JSON.parse(JSON.stringify(allTmpKeys[key]))
  })
  const allTmpKeysBak = JSON.parse(JSON.stringify(allTmpKeys))
  const subject: Subject<any> = new Subject<any>()
  const tableState: UnwrapRef<SearchTableState<T>> = reactive({
    pageIndex: PAGE_CONSTANT.page,
    pageSize: PAGE_CONSTANT.limit,
    ...allTmpKeys,
    data: [],
    total: 0
  })
  /**
   * 防止内存泄露
   */
  if (unsubscribe) {
    onUnmounted(() => {
      subject.unsubscribe()
    })
  }

  /**
   * 旧版浏览器兼容
   */
  watch(() => {
    return tableState.data
  }, (current) => {
    nextTick(() => {
      if (current.length) {
        getTableBodyContent(tableBody => {
          const tableHead = document.querySelector('.table-container .ant-table-header') as HTMLDivElement
          (document.querySelector('.ant-table-scroll') as HTMLDivElement).style.height =
            (tableBody.offsetHeight + tableHead.offsetHeight) - 21 + 'px'
        })
      } else {
        getTableBody(tableScroll => {
          tableScroll.style.height = '210px'
        })
      }
    })
  })

  const getTableBody = (cb) => {
    const tableScroll = document.querySelector('.table-container .ant-table-scroll') as HTMLDivElement
    if (tableScroll) {
      cb(tableScroll)
    } else {
      timer(100).subscribe(() => {
        getTableBody(cb)
      })
    }
  }

  const getTableBodyContent = (cb) => {
    const tableBody = document.querySelector('.table-container .ant-table-scroll .ant-table-tbody') as HTMLDivElement
    if (tableBody) {
      const tableContent = tableBody.querySelectorAll('.ant-table-row')
      if (tableContent?.length) {
        cb(tableBody)
      } else {
        timer(100).subscribe(() => {
          getTableBodyContent(cb)
        })
      }
    } else {
      timer(100).subscribe(() => {
        getTableBodyContent(cb)
      })
    }
  }

  /**
   * 根据不同状态查询
   * @param reset
   */
  const searchData = (reset: boolean | string = false, pageChange?: boolean, sorter?: Sorter) => {
    if (reset === 'button') {
      tableState.pageIndex = 1
      sybcParam()
    } else if (reset === 'collect') {
      collectParam()
      sybcParam()
    } else if (reset) {
      resetData()
    }
    getListData(tableState, pageChange, sorter, storingData)
  }

  /**
   * 处理表格数据
   * @param paginationOption  分页
   * @param filters  过滤
   * @param sorter 排序
   * @param currentDataSource 排序数据项信息
   */
  const searchList = (paginationOption, filters?, sorter?: Sorter, currentDataSource?) => {
    const pageChange = tableState.pageIndex !== paginationOption.current || tableState.pageSize !== paginationOption.pageSize
    tableState.pageIndex = paginationOption.current
    tableState.pageSize = paginationOption.pageSize
    searchData(false, pageChange, sorter)
  }

  /**
   * 初始化查询表格数据
   */
  const initData = () => {
    collectParam()
    sybcParam()
    searchData()
  }

  /**
   * 时间相关
   * @param createTime
   */
  const getDate = (createTime) => {
    // const now = new Date()
    // const startTime = new Date(moment(now).format('YYYY-MM-DD 00:00:00')).getTime()
    // const endTime = new Date(moment(now).format('YYYY-MM-DD 23:59:59')).getTime()
    if (createTime) {
      // if (startTime < createTime && createTime < endTime) {
      //   return moment(createTime).format('HH:mm')
      // } else {
      //   return moment(createTime).format('YYYY-MM-DD')
      // }
      return moment(createTime).format('YYYY-MM-DD HH:mm')
    } else {
      return '--'
    }
  }

  /**
   * 重置查询
   */
  const resetData = () => {
    tableState.pageIndex = 1
    resetInit()
    removeData()
    getListData(tableState)
  }
  /**
   * 重置缓存数据
   */
  const resetInit = () => {
    Object.keys(allTmpKeysBak).forEach(key => {
      tableState[key] = JSON.parse(JSON.stringify(allTmpKeysBak[key]))
    })
  }
  /**
   * 收集持久化数据
   */
  const collectParam = () => {
    const cached = SessionStorageUtil.getSearch(_PAGE_ID_)
    Object.keys(cached).forEach(key => {
      tableState[key] = JSON.parse(JSON.stringify(cached[key]))
    })
  }
  /**
   * 同步缓存数据
   */
  const sybcParam = () => {
    Object.keys(cachedKeys).forEach(key => {
      tableState[key + 'ue'] = tableState[key]
    })
  }

  /**
   * 持久化数据
   */
  const storingData = () => {
    const cached = {}
    Object.keys(cachedKeys).forEach(key => {
      cached[key] = tableState[key]
    })
    passData(cached)
  }

  /**
   * 触发持久化订阅
   * @param value
   */
  const passData = (value) => {
    subject.next(value)
  }

  /**
   * 订阅节流持久化操作
   */
  const subscribeChange = () => {
    subject.pipe(debounceTime(200)).subscribe((value) => {
      SessionStorageUtil.putSearch(_PAGE_ID_, value)
      SessionStorageUtil.putSearchKey(_PAGE_ID_)
    })
  }

  /**
   * 移除持久化数据2
   */
  const removeData = () => {
    SessionStorageUtil.clearSearch(_PAGE_ID_)
    SessionStorageUtil.clearSearchKey(_PAGE_ID_)
  }

  subscribeChange()
  initData()

  return {
    tableState,
    resetData,
    storingData,
    searchData,
    searchList,
    getDate,
    subject
  }
}
