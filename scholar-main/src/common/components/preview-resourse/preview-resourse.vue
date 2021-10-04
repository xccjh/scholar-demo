<template>
  <a-modal
    :visible="visible"
    @update:visible="$emit('update:visible', arguments[0])"
    :title="previewTitle"
    :width="previewWidth"
    :footer='null'
    :maskClosable='false'
    :bodyStyle='previewBodyStyle'
    wrapClassName='preview-modal'
    :dialogClass='previewDialogClass'
    :destroyOnClose='true'
    @cancel="closeModal"
  >
    <div class='preview-container-pic' v-if='imageType && !attachmentPath'></div>
    <div class='preview-container' v-if='!imageType && !attachmentPath'></div>
    <iframe :src='attachmentPath'
            frameborder='0'
            allowfullscreen='true'
            v-if='attachmentPath'
            style='width:100%;height:100%;'
    ></iframe>
    <div class='fullscreen'>
      <FullscreenOutlined @click='enterFullscreen(true)' v-if='!fullScreen' class='icon-fullscreen'/>
      <FullscreenExitOutlined @click='enterFullscreen(false)' v-if='fullScreen' class='icon-fullscreen'/>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue'
import { exitFullscreen, fullScreens, unMountpreview } from '../../utils'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue/lib'

export default defineComponent({
  name: 'PreviewResourse',
  props: {
    imageType: {
      type: Boolean as PropType<boolean>,
      default: () => true
    },
    previewTitle: {
      type: String as PropType<string>,
      default: () => ('资源预览')
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: () => (false)
    },
    attachmentPath: {
      type: String as PropType<string>,
      default: () => ''
    }
  },
  components: {
    FullscreenOutlined,
    FullscreenExitOutlined
  },
  emits: {
    'update:visible': (payload: boolean | { visible: boolean }) => {
      if (typeof payload === 'boolean' || (typeof payload === 'object' && typeof payload.visible === 'boolean')) {
        return true
      }
    }
  },
  setup (props, { emit }) {
    const previewWidth = ref<string | number>(800)
    const fullScreen = ref(false)
    const previewBodyStyle = reactive({ height: '600px', padding: 0 })
    const previewDialogClass = ref<'preview-dialog' | null>(null)
    const enterFullscreen = (fullscreen: boolean) => {
      fullScreen.value = fullscreen
      fullscreen ? fullScreens() : exitFullscreen()
      previewDialogClass.value = fullscreen ? 'preview-dialog' : null
      previewWidth.value = fullscreen ? '100%' : 800
      previewBodyStyle.height = fullscreen ? 'calc(100% - 56px)' : '600px'
    }
    const closeModal = () => {
      enterFullscreen(false)
      if (!props.attachmentPath) {
        unMountpreview(undefined, undefined, () => emit('update:visible', false))
      } else {
        emit('update:visible', false)
      }
    }

    return {
      closeModal,
      previewWidth,
      previewBodyStyle,
      previewDialogClass,
      fullScreen,
      enterFullscreen,
      unMountpreview
    }
  }
})
</script>
