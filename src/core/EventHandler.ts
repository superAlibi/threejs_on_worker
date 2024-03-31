
import { MessageEventMap, Settings, } from './types';
import { InitEvent, ChangeEvent, ResizeEvent } from './events';
import { OrbitControls } from './Addons'
import { UIState } from './states/ui';
import { Renderer } from './states/renderer';
let renderer: Renderer;
/**
 * 事件处理器,同时也是渲染器实际内容
 */
class EventHandler extends UIState {

  resize(width: number, height: number) {

    this.width = width
    this.height = height
    this.dispatchEvent(new ResizeEvent(renderer,this))

  }

}
let handler: EventHandler


type ABEventReceiver<T extends MessageEventMap = MessageEventMap> = {
  [prop in keyof T]: (p: T[prop]) => void
} & {

}

/**
 * 事件接收器
 * 接收来自主线程的消息并分发给渲染器
 * 同时继承EventTarget,用于分发自定义事件,在有需要的地方接受自定义事件
 */
const receiver: ABEventReceiver = {

  init(t: MessageEventMap['init']) {
    handler = new EventHandler()
    
    console.log(t);
    
    renderer = new Renderer(t.canvas, t.setting || new Settings())
    handler.dispatchEvent(new InitEvent(renderer,handler))
  },
  resize(t: MessageEventMap['resize']) {
  },
  keyboard(t: MessageEventMap['keyboard']) {
  },
  setting(t: MessageEventMap['setting']) {
  },
  pointer(p: MessageEventMap['pointer']) {
    // throw new Error('Function not implemented.');
  },
  touch: function (p: any) {
    // throw new Error('Function not implemented.');
  }
}

self.addEventListener("message", (e) => {
  const { data: { type, ...ops } } = e
  receiver[type as keyof MessageEventMap](ops)
})
self.addEventListener('error', console.error);
