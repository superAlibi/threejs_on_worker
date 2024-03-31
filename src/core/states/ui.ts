import { PointerPosition } from 'R/core';
import { Vector2 } from 'three';

export interface PointerTransformData {
  width: number, height: number,
  offsetX: number, offsetY: number
}
export function dom2GLPosition({ width, height, offsetX, offsetY }: PointerTransformData): PointerPosition {
  const x = offsetX / width * 2 - 1,
    y = -offsetY / height * 2 + 1;
  return { x, y }
}

export class UIState extends EventTarget {
  constructor() {
    super()

  }
  /**
   * 画布宽度
   */
  width: number = 0
  /**
   * 画布高度
   *
   */
  height: number = 0

  /**
   * 鼠标按下信息
   */

  /**
    * 当前已经按住的鼠标键
    */
  downCurrent = -1
  /**
  *  鼠标最后一次按下的位置,已经被归一化的坐标
  * 
  */
  downNormalizedXOY = new Vector2()
  /**
   * 鼠标按下时的位置,原始坐标
   */
  downDoriginalXOY = new Vector2()

  /**
   * 鼠标当前位置信息
   */
  /**
   * 鼠标当前位置,原始坐标
   */
  currentOriginalXOY = new Vector2()
  /**
    * 当前鼠标位置,坐标已被归一化
    * 该值主要用于射线
    */
  currentNormalizedXOY = new Vector2()
  /**
   * 鼠标上一次位置,原始坐标
   */
  lastOriginalXOY = new Vector2()
}
