import { Renderer } from "../states/renderer"
import { UIState } from "../states/ui"

class BaseEvent extends CustomEvent<UIState> {
  constructor(type: string,public renderer: Renderer,detail?:UIState) {
    super(type, { detail })
  }
}
/**
 * 本文件用于表示事件类
 * 任何对框架的操作都应该在此定义事件类，并通过事件类触发
 */
export class InitEvent extends BaseEvent {
  constructor(renderer: Renderer,detail:UIState) {
    super('init', renderer,detail)
  }
}

export class ResizeEvent extends BaseEvent {
  constructor(renderer: Renderer,detail:UIState) {
    super('resize', renderer,detail)
  }
}
export class ChangeEvent extends BaseEvent {
  constructor(data: Renderer,detail:UIState) {
    super('change', data,detail)
  }
}

export interface EventMap extends Omit<GlobalEventHandlersEventMap,'resize'>, WindowEventHandlersEventMap {
  init: InitEvent
  resize: ResizeEvent
  change: ChangeEvent
}