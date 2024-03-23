

export enum MOUSEBUTTONS {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  BACK = 3,
  FORWARD = 4,
}
export interface PointerPosition {
  x: number,
  y: number
}
import RenderWorker from '../renderer/EventHandler?worker'
export interface PointerTransformData {
  width: number, height: number, offsetX: number, offsetY: number
}
export function domPointerPositionToWEBGLPosition({ width, height, offsetX, offsetY }: PointerTransformData): PointerPosition {
  const x = offsetX / width * 2 - 1,
    y = -offsetY / height * 2 + 1;
  return { x, y }
}
export class InteractorState extends EventTarget {
  /**
   * 当前已经按住的鼠标键
   */
  currenPointerDown?: MOUSEBUTTONS
  /**
   * 当前鼠标位置,坐标已被归一化
   */
  currenPointerPosition?: PointerPosition
  /**
   *  鼠标最后一次按下的位置,已经被归一化的坐标
   */
  lastPointerDownPosition?: PointerPosition
  protected renderWorker: Worker = new RenderWorker()

  constructor() {
    super()
  }






}