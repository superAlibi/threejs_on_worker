
export interface InitEventMessage { type: 'init', canvas: OffscreenCanvas }
export interface ResizeEventMessage { type: 'resize', width: number, height: number }
export interface MouseMoveEventMessage { type: 'mousemove', x: number, y: number }
export type MassageEventAction = InitEventMessage | ResizeEventMessage | MouseMoveEventMessage