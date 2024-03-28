import { MessageEventMap } from "../types"

export class InitEvent extends CustomEvent<MessageEventMap['init']>{
  constructor(data: MessageEventMap['init']) {
    super('init', { detail: data })
  }
}

export class ResizeEvent extends CustomEvent<MessageEventMap['resize']>{
  constructor(data: MessageEventMap['resize']) {
    super('resize', { detail: data })
  }
}
export class PickupEvent extends CustomEvent<MessageEventMap['pickup']>{
  constructor(data: MessageEventMap['pickup']) {
    super('resize', { detail: data })
  }
}
export class RotateEvent extends CustomEvent<MessageEventMap['rotate']>{
  constructor(data: MessageEventMap['rotate']) {
    super('rotate', { detail: data })
  }
}
export class SettingsEvent extends CustomEvent<MessageEventMap['setting']>{
  constructor(data: MessageEventMap['setting']) {
    super('settings', { detail: data })
  }
}