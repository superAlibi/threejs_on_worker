import { MessageEventMap, PointerPosition } from 'R/renderer';
import InnterWorker from '../renderer/EventHandler?worker'
import { MOUSE } from 'three';

export interface PointerTransformData {
  width: number, height: number,
  offsetX: number, offsetY: number
}
export function domPointerPositionToWEBGLPosition({ width, height, offsetX, offsetY }: PointerTransformData): PointerPosition {
  const x = offsetX / width * 2 - 1,
    y = -offsetY / height * 2 + 1;
  return { x, y }
}

/**
 * 主要用于类型提示的类
 */
class RenderWorker<T extends MessageEventMap = MessageEventMap>  {
  worker: Worker
  constructor(worker?: Worker) {
    this.worker = worker || new InnterWorker()
  }
  postMessage<K extends keyof T = keyof MessageEventMap>(type: K, data: T[K], transfer?: Transferable[]): void {
    if (transfer) {
      this.worker.postMessage({ type, data }, transfer)
    } else {
      this.worker.postMessage({ type, data })
    }
  }
}
export class InteractorState extends EventTarget {
  width?: number
  height?: number
  /**
   * 当前已经按住的鼠标键
   */
  currenPointerDown?: MOUSE
  /**
   * 当前鼠标位置,坐标已被归一化
   */
  currenPointerPosition?: PointerPosition
  /**
   *  鼠标最后一次按下的位置,已经被归一化的坐标
   */
  lastPointerDownPosition?: PointerPosition
  protected renderWorker: RenderWorker = new RenderWorker()

  constructor() {
    super()
  }






}