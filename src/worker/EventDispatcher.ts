
import { InitEventMessage, ResizeEventMessage } from "./types"

export class EventDispatcher extends Event {
  #renderWorker: Worker
  #resizeTimeoutId: number = 0
  // #enqueued: boolean = false
  constructor() {
    super("EventDispatcherInitd")
    this.#renderWorker = new Worker(new URL('./EventHandler.ts', import.meta.url), { type: 'module' })
  }
  initRender(offscreen: OffscreenCanvas) {
    const messageBody: InitEventMessage = {
      type: 'init', canvas: offscreen
    }
    this.#renderWorker.postMessage(messageBody, [offscreen])
  }
  resize(width: number, height: number) {
    /* if (this.#enqueued) {
      return
    }
    this.#enqueued = true
    requestAnimationFrame(() => {
      this.#enqueued = false
      const data: ResizeEventMessage = {
        type: 'resize',
        width: width,
        height: height
      }
      this.#renderWorker.postMessage(data)
    }) */
     if (this.#resizeTimeoutId) {
       clearTimeout(this.#resizeTimeoutId)
     }
     this.#resizeTimeoutId = window.setTimeout(() => {
       const data: ResizeEventMessage = {
         type: 'resize',
         width: width,
         height: height
       }
       this.#resizeTimeoutId = 0
       this.#renderWorker.postMessage(data)
     }, 60)
  }
  mouse(e: MouseEvent) {
    // this.#renderWorker.postMessage()
    console.log(e);

  }
  keyboard(e: KeyboardEvent) {
    console.log(e);

  }
  touch(e: TouchEvent) {
    console.log(e);

  }


}