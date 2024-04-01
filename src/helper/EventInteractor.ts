

import { MessageEventMap, PointerEventInfo, Settings } from "../core/types"

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

  worker: Worker=new Worker(new URL('worker.ts', import.meta.url),{type:'module'})
  constructor() {
    // this.worker = new InnterWorker()
    this.worker.addEventListener('message', this.workerOnMessage)
    this.worker.addEventListener('error', (e) => {
      alert( e.message)
    })
  }
  postMessage<K extends keyof T = keyof MessageEventMap>(type: K, data: T[K], transfer?: Transferable[]): void {
    if (transfer) {
      this.worker.postMessage({ type, ...data }, transfer)
    } else {
      this.worker.postMessage({ type, ...data })
    }
  }
  workerOnMessage = (e: MessageEvent) => {
    alert(JSON.stringify(e.data))
  }
}
// https://gitee.com/alibi-jia/threejs_on_worker.git
export class EventInteractor extends EventTarget {
  #resizeTimeoutId: number = 0
  renderWorker = new RenderWorker()

  constructor() {
    super()
  
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