

import { MessageEventMap, Settings } from "../core/types"
import InnterWorker from 'R/core/EventHandler?worker'

/**
 * 主要用于类型提示的类
 */
class RenderWorker<T extends MessageEventMap = MessageEventMap>  {
  worker: Worker
  constructor() {
    this.worker = new InnterWorker()
  }
  postMessage<K extends keyof T = keyof MessageEventMap>(type: K, data: T[K], transfer?: Transferable[]): void {
    if (transfer) {
      this.worker.postMessage({ type, ...data }, transfer)
    } else {
      this.worker.postMessage({ type, ...data })
    }
  }
}
export class EventInteractor {
  #resizeTimeoutId: number = 0
  renderWorker = new RenderWorker()
  constructor() {


  }
  initRender(offscreen: OffscreenCanvas, setting: Settings=new Settings()) {
    console.log(offscreen);
    

    this.renderWorker.postMessage('init', {
      canvas: offscreen,
      setting
    }, [offscreen])
  }
  onMouseDown = (e: PointerEvent) => {
    // this.renderWorker.postMessage('pointer', e)
  }
  onMouseUp = (e: PointerEvent) => {
    // for (const key in e) {
    //   // console.log(key);
    //   console.log(key , typeof e[key]);
     
    // }
    // this.renderWorker.postMessage('pointer', e)
  }
  onMouseMove = (e: PointerEvent) => {
    
  }
  resize(width: number, height: number) {
    if (this.#resizeTimeoutId) {
      clearTimeout(this.#resizeTimeoutId)
    }
    this.#resizeTimeoutId = window.setTimeout(() => {
      this.#resizeTimeoutId = 0
      this.renderWorker.postMessage('resize', {
        width,
        height
      })
    }, 200)
  }

  wheel = (e: MouseEvent) => {
    // this.renderWorker.postMessage('pointer', e)
  }
  keyboard(e: KeyboardEvent) {
    // this.renderWorker.postMessage('pointer', e)
  }
  touch = (e: TouchEvent) => {
    // this.renderWorker.postMessage('pointer', e)
  }


}