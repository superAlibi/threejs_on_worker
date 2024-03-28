
import { InteractorState, PointerTransformData, domPointerPositionToWEBGLPosition } from "./InteractorState"
import { Settings } from "../renderer/types"
import { MOUSE } from "three"


export class EventInteractor extends InteractorState {
  #resizeTimeoutId: number = 0
  constructor(public setting: Settings = new Settings()) {
    super()
  }
  initRender(offscreen: OffscreenCanvas, setting = this.setting) {
    this.width = offscreen.width
    this.height = offscreen.height


    this.renderWorker.postMessage('init', {
      canvas: offscreen,
      setting
    }, [offscreen])
  }
  private onMouseDown(button: MOUSE, metaData: PointerTransformData) {
    this.currenPointerDown = button;
    this.lastPointerDownPosition = domPointerPositionToWEBGLPosition(metaData)
  }
  private onMouseUp(e: PointerEvent) {
    this.currenPointerDown = void 0;
    if (e.button === MOUSE.RIGHT) {
      e.stopPropagation()
      e.preventDefault()
    }
  }
  private onMouseMove(metaData: PointerTransformData) {
    const curp = domPointerPositionToWEBGLPosition(metaData)
    if (this.currenPointerDown !== void 0) {
      this.renderWorker.postMessage('rotate', {
        x: 0,
        y: 0
      })
    } else {
      this.renderWorker.postMessage('pickup', curp)

    }
  }
  resize(width: number, height: number) {
    this.width = width
    this.height = height
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
  point(e: PointerEvent) {
    console.log(e);

    if (!this.width || !this.height) {
      throw new Error('width and height must be set before calling point')
    }
    const metaData = { width: this.width, height: this.height, offsetX: e.offsetX, offsetY: e.offsetY }
    switch (e.type) {
      case 'pointerup':
        this.onMouseUp(e)
        break;
      case 'pointermove':
        this.onMouseMove(metaData)
        break;
      case 'pointerdown':
        this.onMouseDown(e.button, metaData)
        break;
    }
  }
  wheel(e: MouseEvent) {

  }
  keyboard(e: KeyboardEvent) {
    console.log(e);

  }
  touch(e: TouchEvent) {
    console.log(e);

  }


}