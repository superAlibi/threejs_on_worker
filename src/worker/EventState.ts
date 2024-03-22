import { Vector2 } from "three";

export enum MOUSEBUTTONS {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  BACK = 3,
  FORWARD = 4,
}
export class MouseState {
  currentMouseDown?: MOUSEBUTTONS
  currentMousePosition?: Vector2
  x: number = 0
  y: number = 0
  constructor() {

  }

  onMouseDown(e: PointerEvent) {
    this.currentMouseDown = e.button;
  }
  onMouseUp(e: PointerEvent) {
    this.currentMouseDown = void 0;
    if (e.button === MOUSEBUTTONS.RIGHT) {
      e.stopPropagation()
      e.preventDefault()
    }
  }
  onMouseMove({ width, height, offsetX, offsetY }: { width: number, height: number, offsetX: number, offsetY: number }) {
    const x = offsetX / width * 2 - 1,
      y = -offsetY / height * 2 + 1;

    Object.assign(this, {
      x,
      y,
    })

  }



}