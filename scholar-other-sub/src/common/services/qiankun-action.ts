class QiankunActionsService {
  actions: {
    onGlobalStateChange: (callback: (state: Record<string, any>, prevState: Record<string, any>) => void, fireImmediately?: boolean) => void;
    setGlobalState: (state: Record<string, any>) => boolean | void
  } = {
    onGlobalStateChange: (...arg) => {
      console.warn('Current execute action is empty!')
      console.log(arg)
    },
    setGlobalState: (...arg) => {
      console.warn('Current execute action is empty!')
      console.log(arg)
    }
  };

  setActions (actions) {
    this.actions = actions
  }

  onGlobalStateChange (callback, fireImmediately?) {
    if (this.actions.onGlobalStateChange) {
      return this.actions.onGlobalStateChange(callback, fireImmediately)
    }
  }

  setGlobalState (args) {
    return this.actions.setGlobalState(args)
  }
}

export const QiankunActionsInstance = new QiankunActionsService()
