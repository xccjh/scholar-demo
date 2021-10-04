export function getTagType (type) {
  if (type === '1') {
    return '阶段标签'
  } else if (type === '2') {
    return '考期标签'
  } else {
    return '未知'
  }
}
