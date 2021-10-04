import { AssocateItem, SectionDataType } from '../entity'
import { nextTick, ref } from 'vue'
import { message } from 'ant-design-vue'
import { PrepareCourseApi } from '../api'
import { CommonApi } from '@/app/api'
import { STATISTICALRULES } from '@/common/constants'
import { timer } from 'rxjs'

declare const WebOfficeSDK

export function useAssocateTask (getTaskList, currentLearnSetSection) {
  const bindLimit = ref(1000000) // 主讲义关联任务上限
  const mainFileAssociatLoading = ref<{ [index: number]: boolean }>({})
  const totalPage = ref(0)
  const currentBindLength = ref(0)
  const mainFileAssocateClassList = ref<AssocateItem[][]>([])
  const mainfileAssocateVisible = ref(false)
  const currentAssocatePageNum = ref(0)
  const currentResource = ref<Partial<SectionDataType>>({})
  let wpsInstance: any = null
  let stack: any = null
  let wpsApplication: any = null
  let mainFileAssocateListBak: AssocateItem[] = []

  /**
   * 主讲义关联input焦点变更
   * @param page
   */
  const pageNumModelChangeDetect = (page: number) => {
    if (typeof page === 'number') {
      currentAssocatePageNum.value = page
    }
  }

  /**
   * 是否绑定主讲义
   * @param flag boolean
   * @param item 列表项
   */
  const isBindChange = (e: { target: { checked: boolean } }, item: AssocateItem) => {
    if (e.target.checked) {
      getBindBlur(item)
    } else {
      delBindBlur(item)
    }
  }

  /**
   * blur自当关联
   * @param item
   */
  const getBindBlur = (item: AssocateItem) => {
    if (totalPage.value) {
      const pageNum = currentAssocatePageNum.value || item.pageNum
      if (totalPage.value < pageNum!) {
        nextTick(() => {
          item.isBindAssoicate = false
        })
        message.warning('当前讲义总共 ' + totalPage.value + ' 页,绑定页码超过了主讲义的页数范围!')
        return
      }
      if (item.paperId) {
        PrepareCourseApi.checkTkDecidePaper(item.paperId)
          .then(result => {
            if (result.data.code === 200) {
              if (result.data.data.decide) {
                message.warning('包含综合题的作业任务不能绑定到主讲义中')
                nextTick(() => {
                  item.isBindAssoicate = false
                })
              } else {
                boundTask(item)
              }
            } else {
              message.error('题库服务异常，查询任务信息失败')
            }
          })
      } else {
        boundTask(item)
      }
    } else {
      nextTick(() => {
        item.isBindAssoicate = false
      })
      message.error('该主讲义没有页面，请保证有页面的前提下绑定任务')
    }
  }

  /**
   * 执行主讲义关联任务
   * @param item
   */
  const boundTask = (item: AssocateItem) => {
    const pageNum = currentAssocatePageNum.value || item.pageNum
    const params = {
      courseId: item.courseId,
      coursePacketId: item.coursePacketId,
      courseChapterId: item.courseChapterId,
      courseSectionId: item.courseSectionId,
      courseTaskId: item.id,
      resourceId: currentResource.value.id,
      pageNum,
      seq: item.seq,
      id: item.linkId
    }
    PrepareCourseApi.handoutPageNumberRelatedTasks(params).then(res => {
      if (res.data.status === 201) {
        CommonApi.statisticsLog({
          name: '讲义资料关联更改',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify(params)
        })
        item.linkId = res.data.data.id
        item.isBindAssoicate = true
        currentBindLength.value = mainFileAssocateListBak.filter(resP => {
          return resP.isBindAssoicate
        }).length
      } else {
        timer(0).subscribe(() => {
          item.isBindAssoicate = false
        })
      }
    }, () => {
      timer(0).subscribe(() => {
        item.isBindAssoicate = false
      })
    })
  }
  /**
   * 删除主讲义绑定
   * @param item
   */
  const delBindBlur = (item: AssocateItem) => {
    PrepareCourseApi.delBindBind(item.linkId).then((res) => {
      if (res.data.status === 204) {
        CommonApi.statisticsLog({
          name: '讲义资料关联更改',
          actionCode: STATISTICALRULES.packetInfo['learnSet-lecture-action'].modify,
          content: JSON.stringify({ id: item.linkId })
        })
        delete item.pageNum
        delete item.linkId
        item.isBindAssoicate = false
        currentBindLength.value = mainFileAssocateListBak.filter(resP => {
          return resP.isBindAssoicate
        }).length
      } else {
        nextTick(() => {
          item.isBindAssoicate = true
        })
      }
    }).catch((err) => {
      console.log(err)
      nextTick(() => {
        item.isBindAssoicate = true
      })
    })
  }

  /**
   * 打开主讲义关联弹框
   * @param item
   * @param sectionIdx
   */
  const mainFileAssociate = (item: SectionDataType, sectionIdx: number) => {
    mainFileAssociatLoading.value[sectionIdx] = true
    totalPage.value = 0
    currentResource.value = item
    PrepareCourseApi.getViewUrlWebPath(process.env.VUE_APP_OSS_URL + item.attachmentPath).then((res) => {
      if (res.data.status === 200) {
        wpsInstance = WebOfficeSDK.config({
          url: res.data.data.wpsUrl
        })
        wpsInstance.iframe.style.display = 'none'
        wpsInstance.ready().then(() => {
          wpsApplication = wpsInstance.Application
          stack = wpsApplication.Stack()
          loadWpsApplication(sectionIdx)
        })
      }
    })

    getAssocateMainFileList()
  }

  const loadWpsApplication = (sectionIdx) => {
    try {
      wpsApplication.ActivePresentation.Slides.Count.then(res => {
        totalPage.value = res
        timer(2000).subscribe(() => {
          mainFileAssociatLoading.value[sectionIdx] = false
          mainfileAssocateVisible.value = true
        })
      }).catch(() => {
        timer(1000).subscribe(() => {
          loadWpsApplication(sectionIdx)
        })
      })
    } catch (e) {
      timer(1000).subscribe(() => {
        loadWpsApplication(sectionIdx)
      })
    }
  }

  /**
   * 完成关联
   */
  const closeAssocateBindModal = () => {
    mainfileAssocateVisible.value = false
    totalPage.value = 0
    stack.End()
    wpsInstance.destroy()
    getTaskList()
    const ele = document.getElementsByClassName('web-office-default-container')[0] as HTMLDivElement
    if (ele) {
      ele.parentNode!.removeChild(ele)
    }
  }
  /**
   * 获取主讲义关联列表
   */
  const getAssocateMainFileList = () => {
    PrepareCourseApi.getAssocateMainfileList(currentLearnSetSection.value.courseChapterId, currentResource.value.id).then(res => {
      if (res.data.status === 200) {
        if (res.data.data && res.data.data.length) {
          mainFileAssocateListBak = res.data.data
          mainFileAssocateListBak.forEach((e, i) => {
            mainFileAssocateListBak[i].isBindAssoicate = !!e.pageNum
          })
          mainFileAssocateClassList.value = []
          let sectionSeq
          let innerArr: AssocateItem[] = []
          mainFileAssocateListBak.forEach((ee, ii) => {
            if (!sectionSeq) {
              sectionSeq = ee.sectionSeq
            }
            if (sectionSeq === ee.sectionSeq) {
              innerArr.push(ee)
              if (ii === mainFileAssocateListBak.length - 1) {
                mainFileAssocateClassList.value.push(innerArr)
              }
            } else {
              mainFileAssocateClassList.value.push(innerArr)
              innerArr = []
              sectionSeq = ee.sectionSeq
              innerArr.push(ee)
              if (ii === mainFileAssocateListBak.length - 1) {
                mainFileAssocateClassList.value.push(innerArr)
              }
            }
          })
          currentBindLength.value = res.data.data.filter(resP => {
            return resP.pageNum
          }).length
        } else {
          currentBindLength.value = 0
          mainFileAssocateListBak = []
          mainFileAssocateClassList.value = []
        }
      }
    })
  }

  return {
    getAssocateMainFileList,
    closeAssocateBindModal,
    mainFileAssociate,
    delBindBlur,
    boundTask,
    getBindBlur,
    isBindChange,
    pageNumModelChangeDetect,
    bindLimit,
    mainFileAssociatLoading,
    totalPage,
    currentBindLength,
    currentResource,
    mainFileAssocateListBak,
    mainFileAssocateClassList,
    mainfileAssocateVisible,
    wpsInstance,
    stack,
    wpsApplication,
    currentAssocatePageNum
  }
}
