import { InitEventMessage, ResizeEventMessage } from "./types"

export class EventDispatcher extends Event {
  #renderWorker: Worker
  #resizeTimeoutId: number = 0
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

}