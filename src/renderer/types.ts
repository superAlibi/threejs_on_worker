
export interface InitEventMessage { type: 'init', canvas: OffscreenCanvas, setting: Settings }
export interface ResizeEventMessage { type: 'resize', width: number, height: number }
export interface MouseMoveEventMessage { type: 'pointerMove', x: number, y: number }
export interface SettingEventMessage { type: 'pointerMove', x: number, y: number }


/**
 * 发送给工作者消息类型定义
 */
export type MassageEventAction = InitEventMessage | ResizeEventMessage | MouseMoveEventMessage

export interface MessageEventMap {
  init: { canvas: OffscreenCanvas, setting: Settings },
  resize: { width: number, height: number },
  pointerMove: { x: number, y: number },
  settings: { setting: Settings },
  rotate: { x: number, y: number }
}
export interface SceneSetting {
  background: { type?: 'url' | 'hex', value?: string | number },
  ambientLight: {
    color: string | number
    intensity: number
  },
  hemisphereLight: {
    color: string | number
    intensity: number
  },
  directionalLight: {
    color: string | number
    intensity: number,
    target: {
      x: number,
      y: number,
      z: number
    }
  }[]
  axesHelper: {
    visible: boolean
    lenght: number
  }

}
export interface CameraSetting {
  fov: number,
  near: number,
  far: number,
  position?: {
    x: number,
    y: number,
    z: number
  }
}
export interface RenderSetting {
  clearColor: {
    value: number | string,
    alpha: number
  }
  clippingPlanes?: Array<{

  }>
}



class SettingState {
  scene: SceneSetting
  camera: CameraSetting

  render: RenderSetting

  constructor() {

    this.scene = {
      background: {
        // type: 'hex',
        // value: 0xff00ff
      },
      ambientLight: {
        color: '#ffffff',
        intensity: 0
      },
      hemisphereLight: {
        color: '#ffffff',
        intensity: 0
      },
      directionalLight: [{
        color: '#ffffff',
        intensity: 0.2,
        target: {
          x: -1,
          y: -10,
          z: -2
        }
      }],
      axesHelper: {
        visible: true,
        lenght: 100
      }
    }
    this.camera = {
      fov: 75,
      near: 0.1,
      far: 1000,
      position: {
        x: 15,
        y: 14,
        z: 13
      }

    }
    this.render = {
      clearColor: {
        value: 0xff00ff,
        alpha: .2
      }
    }
  }
}
export class Settings extends SettingState {
  constructor() {
    super()
  }

  setting(p: SettingState) {
    Object.assign(this, p)
  }



}