import { reactive, ref, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { timer } from 'rxjs'
import { PrepareCourseApi } from '@/app/views/course-manage/pages/prepare-course/api'
import { moment } from '@/main'

export function useRecordPlan (packetInfo) {
  const totalSectionNum = ref(0)
  const examTimePre = ref()
  const examTime = ref()
  const recordMap = reactive<{
    applicableZeroBasisWeekPre?: number,
    applicableZeroBasisWeek?: number,
    applicableHasAFoundationWeekPre?: number,
    applicableHasAFoundationWeek?: number,
    applicableExpertsWeekPre?: number,
    applicableExpertsWeek?: number,
    applicableZeroBasis?: boolean,
    applicableHasAFoundation?: boolean,
    applicableExperts?: boolean,
  }>({
    applicableZeroBasisWeekPre: undefined,
    applicableZeroBasisWeek: undefined,
    applicableHasAFoundationWeekPre: undefined,
    applicableHasAFoundationWeek: undefined,
    applicableExpertsWeekPre: undefined,
    applicableExpertsWeek: undefined,
    applicableZeroBasis: false,
    applicableHasAFoundation: false,
    applicableExperts: false
  })

  /**
   * 录播任务周期开启关闭
   * @param e
   * @param key
   * @param label
   */
  const applicableChange = (e: { target: { checked: boolean } }, key: string, label: string) => {
    if (!e.target.checked) {
      const map = {
        seniorWeekNum: 'applicableExperts',
        middleWeekNum: 'applicableHasAFoundation',
        juniorWeekNum: 'applicableZeroBasis'
      }
      const { applicableZeroBasisWeek, applicableExpertsWeek, applicableHasAFoundationWeek } = recordMap
      if ((
        key === 'juniorWeekNum' && !(applicableHasAFoundationWeek || applicableExpertsWeek)
      ) || (
        key === 'middleWeekNum' && !(applicableZeroBasisWeek || applicableExpertsWeek)
      ) || (
        key === 'seniorWeekNum' && !(applicableHasAFoundationWeek || applicableZeroBasisWeek)
      )) {
        message.warning('学习计划为必填项,请保留至少一个计划')
        nextTick(() => {
          recordMap[map[key]] = true
        })
        return
      }
      recordMap[label] = undefined
      PrepareCourseApi.setLessonPackage({
        id: packetInfo.id,
        [key]: 0
      })
    }
  }
  /**
   * 录播任务周期Focus
   * @param key
   */
  const applicableFocus = (key: string) => {
    recordMap[key + 'Pre'] = recordMap[key]
  }

  /**
   * 录播任务周期Blur
   * @param data
   * @param key
   * @param label
   */
  const applicableWeekChange = (
    e,
    key: 'middleWeekNum' | 'juniorWeekNum' | 'seniorWeekNum',
    label: 'applicableZeroBasisWeek' | 'applicableHasAFoundationWeek' | 'applicableExpertsWeek'
  ) => {
    if (recordMap[label + 'Pre']) {
      if (recordMap[label] && recordMap[label]! > 0) {
        if (recordMap[label] !== recordMap[label + 'Pre']) {
          PrepareCourseApi.setLessonPackage({
            id: packetInfo.id,
            [key]: recordMap[label]
          })
        }
      } else {
        timer(0).subscribe(() => {
          recordMap[label] = recordMap[label + 'Pre']
        })
      }
    } else {
      if (recordMap[label] && recordMap[label]! > 0) {
        PrepareCourseApi.setLessonPackage({
          id: packetInfo.id,
          [key]: recordMap[label]
        })
      }
    }
  }

  /**
   * 缓存上次时间用以校验是否请求保存
   * @param flag
   */
  const timeOpen = (flag: boolean) => {
    if (flag) {
      examTimePre.value = examTime.value
    }
  }

  /**
   * 实时保存时间
   * @param date
   */
  const timeChange = (date) => {
    if (examTimePre.value) { // 非第一次
      if (date && date._d.getTime() !== examTimePre.value._d.getTime()) { // 对比上次时间不同才保存
        setLessonPackage(date, examTimePre.value)
      } else {
        if (!date) {
          setLessonPackage(date, null)
        }
      }
    } else { // 第一次
      if (date) {
        setLessonPackage(date, null)
      }
    }
  }

  /**
   * 保存课包参数
   * @param date
   * @param reply
   */
  const setLessonPackage = (date, reply) => {
    PrepareCourseApi.setLessonPackage({
      id: packetInfo.id,
      examTime: date ? date.format('YYYY-MM-DD') : new Date(0)
    }).then((res) => {
      if (res.data.status === 201) {
        examTimePre.value = examTime.value
      } else {
        examTime.value = reply
      }
    }).catch((err) => {
      console.error(err)
      examTime.value = reply
    })
  }
  /**
   * 获取智适应课包信息
   */
  const getLessonPackage = () => {
    PrepareCourseApi.getLessonPackage(packetInfo.id, packetInfo.courseId).then(res => {
      if (res.data.status === 200) {
        const {
          juniorWeekNum, middleWeekNum, seniorWeekNum
        } = res.data.data
        // 回显录播计划
        totalSectionNum.value = res.data.data.totalSectionNum || 0
        if (juniorWeekNum) { // 初级
          recordMap.applicableZeroBasisWeekPre = recordMap.applicableZeroBasisWeek = juniorWeekNum
          recordMap.applicableZeroBasis = true
        }
        if (middleWeekNum) { // 中级
          recordMap.applicableHasAFoundationWeekPre = recordMap.applicableHasAFoundationWeek = middleWeekNum
          recordMap.applicableHasAFoundation = true
        }
        if (seniorWeekNum) { // 高级
          recordMap.applicableExpertsWeekPre = recordMap.applicableExpertsWeek = seniorWeekNum
          recordMap.applicableExperts = true
        }
        examTime.value = examTimePre.value = res.data.data.examTime ? moment(new Date(res.data.data.examTime)) : null
      }
    })
  }

  return {
    recordMap,
    applicableChange,
    applicableFocus,
    applicableWeekChange,
    getLessonPackage,
    totalSectionNum,
    examTimePre,
    examTime,
    timeOpen,
    timeChange

  }
}
