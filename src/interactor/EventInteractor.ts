
import { InteractorState, MOUSEBUTTONS, PointerTransformData, domPointerPositionToWEBGLPosition } from "./InteractorState"
import { InitEventMessage, MouseMoveEventMessage, ResizeEventMessage, Settings } from "../renderer/types"

export class EventInteractor extends InteractorState {
  #resizeTimeoutId: number = 0
  constructor(public setting: Settings = new Settings()) {
    super()


  }
  initRender(offscreen: OffscreenCanvas, setting = this.setting) {
    const messageBody: InitEventMessage = {
      type: 'init',
      canvas: offscreen,
      setting
    }

    this.renderWorker.postMessage(messageBody, [offscreen])
  }
  onMouseDown(button: MOUSEBUTTONS, metaData: PointerTransformData) {
    this.currenPointerDown = button;
    this.lastPointerDownPosition = domPointerPositionToWEBGLPosition(metaData)
  }
  onMouseUp(e: PointerEvent) {
    this.currenPointerDown = void 0;
    if (e.button === MOUSEBUTTONS.RIGHT) {
      e.stopPropagation()
      e.preventDefault()
    }
  }
  onMouseMove(metaData: PointerTransformData) {
    return this.currenPointerPosition = domPointerPositionToWEBGLPosition(metaData)
  }
  resize(width: number, height: number) {
    if (this.#resizeTimeoutId) {
      clearTimeout(this.#resizeTimeoutId)
    }
    this.#resizeTimeoutId = window.setTimeout(() => {
      const data: ResizeEventMessage = {
        type: 'resize',
        width,
        height
      }
      this.#resizeTimeoutId = 0
      this.renderWorker.postMessage(data)
    }, 200)
  }
  point(e: PointerEvent, { width, height }: { width: number, height: number }) {
    const metaData = { width, height, offsetX: e.offsetX, offsetY: e.offsetY }
    switch (e.type) {
      case 'pointerup':
        this.onMouseUp(e)
        break;
      case 'pointermove':
        this.onMouseMove(metaData)
        const data: MouseMoveEventMessage = {
          type: 'pointerMove',
          ...this.onMouseMove(metaData)
        }
        this.renderWorker.postMessage(data)
        break;
      case 'pointerdown':
        this.onMouseDown(e.button, metaData)
        break;
    }
  }
  mouse(e: MouseEvent) {
    console.log(e);
  }
  keyboard(e: KeyboardEvent) {
    console.log(e);

  }
  touch(e: TouchEvent) {
    console.log(e);

  }


}