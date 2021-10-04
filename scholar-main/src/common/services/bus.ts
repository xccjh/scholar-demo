class Bus {
  list: { [key: string]: Array<(...args: any[]) => any> };

  constructor () {
    // 收集订阅信息,调度中心
    this.list = {}
  }

  /**
   * 订阅
   * @param name 标识
   * @param fn 回调
   */
  $on (name: string, fn: (...args: any[]) => any) {
    this.list[name] = this.list[name] || []
    this.list[name].push(fn)
  }

  /**
   * 发布
   * @param name 标识
   * @param args 参数
   */
  $emit (name: string, ...args: any[]) {
    if (this.list[name]) {
      this.list[name].forEach((fn: (...args: any[]) => any) => {
        fn(...args)
      })
    }
  }

  /**
   * 取消订阅
   * @param name 标识
   */
  $off (name: string) {
    if (this.list[name]) {
      delete this.list[name]
    }
  }
}

export default new Bus()
