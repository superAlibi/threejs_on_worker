
import { MouseState } from "./EventState"
import { InitEventMessage, MouseMoveEventMessage, ResizeEventMessage } from "./types"

export class EventDispatcher extends MouseState {
  #renderWorker: Worker
  #resizeTimeoutId: number = 0
  // #enqueued: boolean = false
  constructor() {
    super()
    this.#renderWorker = new Worker(new URL('./EventHandler.ts', import.meta.url), { type: 'module' })
  }
  initRender(offscreen: OffscreenCanvas) {
    const messageBody: InitEventMessage = {
      type: 'init',
      canvas: offscreen,
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
  point(e: PointerEvent, { width, height }: { width: number, height: number }) {
    switch (e.type) {
      case 'pointerup':
        this.onMouseUp(e)
        break;
      case 'pointermove':
        this.onMouseMove({ width, height, offsetX: e.offsetX, offsetY: e.offsetY })
        const data: MouseMoveEventMessage = {
          type: 'mousemove',
          x: this.x,
          y: this.y,
        }
        this.#renderWorker.postMessage(data)
        break;
      case 'pointerdown':
        this.onMouseDown(e)
        break;
    }
  }
  mouse(e: MouseEvent) {

  }
  keyboard(e: KeyboardEvent) {
    console.log(e);

  }
  touch(e: TouchEvent) {
    console.log(e);

  }


}