
import { MessageEventMap, PointerEventInfo, Settings, } from './types.ts';
import { InitEvent, ChangeEvent, ResizeEvent } from './events/index.ts';
import { OrbitControls } from './Addons.js'
import { UIState } from './states/ui.ts';
import { Renderer } from './states/renderer.ts';
let renderer: Renderer,
  stateMgr: StateManager
/**
 * 事件处理器,同时也是渲染器实际内容
 */
class StateManager extends UIState {

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.dispatchEvent(new ResizeEvent(renderer, this))
  }
  mouseDown() {
    this.dispatchEvent(new ChangeEvent(renderer, this))
  }
}




/**
 * 画布大小变化处理器
 */
class ResizeHandler {
  handler = ({ detail, renderer }: ResizeEvent) => {
    renderer.composer.setSize(detail.width, detail.height)
    renderer.renderer.setSize(detail.width, detail.height, false)
    renderer.camera.aspect = detail.width / detail.height
    renderer.camera.updateProjectionMatrix()
  }
}

/**
 * 轨道控制器处理
 */
class OrbitHandler {
  orbitControls?: OrbitControls

  constructor() {
    // this.orbitControls = new OrbitControls(renderer.camera)
  }
  handler = ({ detail, renderer }: ResizeEvent) => {
    console.log('OrbitHandler', detail, renderer);

  }
}
/**
 * 测量处理类
 */
/* class MeasureHandler {

}
 */
type EventReceiver<T extends MessageEventMap = MessageEventMap> = {
  [prop in keyof T]: (p: T[prop]) => void
} & {

}

/**
 * 事件接收器
 * 接收来自主线程的消息并分发给渲染器
 * 同时继承EventTarget,用于分发自定义事件,在有需要的地方接受自定义事件
 */
const receiver: EventReceiver = {
  init(t: MessageEventMap['init']) {
    stateMgr = new StateManager();
    renderer = new Renderer(t.canvas, t.setting || new Settings());
    stateMgr.dispatchEvent(new InitEvent(renderer, stateMgr));
    const resizeHandler = new ResizeHandler();
    stateMgr.addEventListener('resize', resizeHandler.handler);
    const orbitHandler = new OrbitHandler();
    stateMgr.addEventListener('change', orbitHandler.handler);
  },
  setting(t: MessageEventMap['setting']) {
    console.log(t);

  },
  resize(t: MessageEventMap['resize']) {
    stateMgr.resize(t.width, t.height);
  },
  keyboard(t: MessageEventMap['keyboard']) {
    console.log(t);
  },

  pointermove(p: MessageEventMap['pointermove']) {
    console.log(p);

  },
  pointerup(p: PointerEventInfo): void {
    console.log(p);

  },
  pointerdown(p: PointerEventInfo): void {
    console.log(p);

  },
  touch(p: any) {
    console.log(p);
  },

}

self.addEventListener("message", (e) => {
  const { data: { type, ...ops } } = e
  const handler = receiver[type as keyof MessageEventMap]
  if (handler) {
    handler(ops)
  } else {
    console.warn(`未处理的事件类型${type}`)
  }
})
self.addEventListener('error', (e) => {
  self.postMessage({ error: e.message, stack: e.error.stack })
})