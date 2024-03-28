
import { InteractorState, MouseState, PointerTransformData, dom2GLPosition } from "./InteractorState"
import { Settings } from "../renderer/types"
import { MOUSE, Vector2 } from "three"
import { merge } from 'radash'

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
    const normalizedXOY = dom2GLPosition(metaData)
    const dataInfo: MouseState = {
      downCurrent: button,
      downNormalizedXOY: normalizedXOY,
      downDoriginalXOY: { x: metaData.offsetX, y: metaData.offsetY },
      currentNormalizedXOY: normalizedXOY,
      currentOriginalXOY: { x: metaData.offsetX, y: metaData.offsetY },
      lastOriginalXOY: { x: metaData.offsetX, y: metaData.offsetY }
    }

    this.mouse = dataInfo

  }
  private onMouseUp(e: PointerEvent) {
    this.mouse.downCurrent = void 0;
    if (e.button === MOUSE.RIGHT) {
      e.stopPropagation()
      e.preventDefault()
    }
  }
  private onMouseMove(metaData: PointerTransformData) {
    const curpn = dom2GLPosition(metaData)
    const { offsetX, offsetY } = metaData


    const currentOriginalXOY = { x: offsetX, y: offsetY }
    // 将上一次的位置标记为上一次的位置
    const lastOriginalXOY = this.mouse.currentOriginalXOY
    if (this.mouse.downCurrent !== void 0) {
      if (lastOriginalXOY) {
        const lastXOY = new Vector2(lastOriginalXOY.x, lastOriginalXOY.y);
        const current = new Vector2(offsetX, offsetY)
        const offset = lastXOY.sub(current)
        this.renderWorker.postMessage('rotate', {
          x: offset.x,
          y: offset.y,
        })
      }
    } else {
      this.renderWorker.postMessage('pickup', curpn)
    }
    this.mouse.lastOriginalXOY = lastOriginalXOY
    this.mouse.currentNormalizedXOY = curpn
    this.mouse.currentOriginalXOY = currentOriginalXOY
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