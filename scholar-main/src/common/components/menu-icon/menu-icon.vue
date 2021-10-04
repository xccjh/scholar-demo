<script lang='ts'>
import { defineComponent, h, PropType } from 'vue'
import { Icons } from '@/assets/plugins'
import { toCamelCase } from '@/common/utils'
export default defineComponent({
  name: 'MenuIcon',
  props: {
    icon: {
      type: String as PropType<string>,
      default: ''
    }
  },
  setup ({ icon }) {
    let IconC
    Icons.every(item => {
      const name = toCamelCase(icon)
      if (item.displayName === icon || item.displayName === name || item.displayName === name + 'Outlined') {
        IconC = item
      } else {
        return true
      }
    })
    return () => IconC ? h(IconC) : h('span')
  }
})
</script>
