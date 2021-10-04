import { ref, defineComponent } from 'vue'
import { LocalStorageUtil, ToolsUtil } from '@/common/utils'
import { CommonApi } from '@/app/api'
import { timer } from 'rxjs'

export default defineComponent({
  name: 'exercise-lib',
  setup () {
    const url = ref('')
    const isLoading = ref(true)
    const getIframe = (cb) => {
      const iframe = document.getElementById('iframe') as any
      if (iframe) {
        cb(iframe)
      } else {
        timer(100).subscribe(() => {
          getIframe(cb)
        })
      }
    }
    const getUrl = (tokenJson) => {
      ToolsUtil.getCodeUid(uid => {
        url.value = process.env.VUE_APP_questionBank + '/#/questionList?proId=' +
          uid +
          '&token=' + tokenJson.token +
          '&refreshToken=' + tokenJson.refreshToken +
          '&show_layout=false'
        getIframe((iframe) => {
          // if (iframe.attachEvent) {
          //   iframe.attachEvent('onload', function () {
          timer(1000).subscribe(() => {
            isLoading.value = false
          })
          //   })
          // } else {
          //   iframe.onload = function () {
          //     timer(1000).subscribe(() => {
          //       isLoading.value = false
          //     })
          //   }
          // }
        })
      })
    }
    ToolsUtil.getTkToken(tokenJson => {
      getUrl(tokenJson)
    })
    return {
      url,
      isLoading
    }
  }
})
