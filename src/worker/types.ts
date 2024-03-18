
export interface InitEventMessage { type: 'init', canvas: OffscreenCanvas }
export interface ResizeEventMessage { type: 'resize', width: number, height: number }
export type MassageEventAction = InitEventMessage | ResizeEventMessage