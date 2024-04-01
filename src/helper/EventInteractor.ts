

import { MessageEventMap, PointerEventInfo, Settings } from "../core/types"
import InnterWorker from 'R/core/EventHandler?worker'

function getPointerEventInfo(e: PointerEvent): PointerEventInfo {
  const { clientX,
    clientY, pointerType,
    pointerId, width, height,
    pressure, tangentialPressure,
    tiltX, tiltY, twist,
    isPrimary, buttons, ctrlKey,
    shiftKey, altKey, metaKey,
    offsetX, offsetY, type,
    button, timeStamp } = e
  const pointerEventInfo: PointerEventInfo = {
    clientX,
    clientY, pointerType,
    pointerId, width, height,
    pressure, tangentialPressure,
    tiltX, tiltY, twist,
    isPrimary, buttons, ctrlKey,
    shiftKey, altKey, metaKey,
    offsetX, offsetY, type,
    button, timeStamp
  }
  return pointerEventInfo
}

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
  initRender(offscreen: OffscreenCanvas, setting: Settings = new Settings()) {
    this.renderWorker.postMessage('init', {
      canvas: offscreen,
      setting
    }, [offscreen])
  }
  onMouseDown = (e: PointerEvent) => {
    this.renderWorker.postMessage('pointerdown', getPointerEventInfo(e))
  }
  onMouseUp = (e: PointerEvent) => {
    this.renderWorker.postMessage('pointerup', getPointerEventInfo(e))
  }
  onMouseMove = (e: PointerEvent) => {
    this.renderWorker.postMessage('pointermove', getPointerEventInfo(e))
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