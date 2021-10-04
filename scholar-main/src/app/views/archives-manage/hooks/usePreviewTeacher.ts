import { ref } from 'vue'

export function usePreviewTeacher () {
  const previewVisible = ref(false)
  const previewData = ref({})
  const previewTeacher = (data) => {
    previewData.value = data
    previewVisible.value = true
  }

  return {
    previewVisible,
    previewData,
    previewTeacher
  }
}
