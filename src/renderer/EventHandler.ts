import {
  Vector2,
} from 'three'

import { MessageEventMap, } from './types';


import { EventHandlerState } from './HandlerState';
import { InitEvent, PickupEvent, ResizeEvent, RotateEvent, SettingsEvent } from './events';

/**
 * 事件处理器,同时也是渲染器实际内容
 */
class EventHandler extends EventHandlerState {

  resize(width: number, height: number) {
    Object.assign(this.canvas, { width, height })
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix()
  }

  /**
   * 
   * @param x 
   * @param y 
   */
  rotate(x: number, y: number) {

  }
  pickup(x: number, y: number) {
    this.rayCaster.setFromCamera(new Vector2(x, y), this.camera)
    const pickups = this.rayCaster.intersectObjects(this.scene.children)
    this.rayHitsSet = pickups
    this.outline.selectedObjects = pickups.map(i => i.object)
  }
}





/**
 * 事件接收器
 * 接收来自主线程的消息并分发给渲染器
 * 同时继承EventTarget,用于分发自定义事件,在有需要的地方接受自定义事件
 */
class EventReceiver extends EventTarget {
  private handler?: EventHandler

  messageHanlder<K extends keyof MessageEventMap = keyof MessageEventMap>({ data }: MessageEvent<{ type: K, data: MessageEventMap[K] }>) {

    const { type, data: payload } = data
    console.log(type, payload);

    switch (type) {
      case 'init':
        this.init(payload as MessageEventMap['init'])
        break;
      case 'resize':
        this.resize(payload as MessageEventMap['resize'])
        break;
      case 'pickup':
        this.pickup(payload as MessageEventMap['pickup'])
        break;
      case "rotate":
        this.rotate(payload as MessageEventMap['rotate'])
        break;
      case "setting":
    }

  }
  init(t: MessageEventMap['init']) {
    this.handler = new EventHandler(t.canvas, t.setting)
    this.dispatchEvent(new InitEvent(t))
  }
  resize(t: MessageEventMap['resize']) {
    this.handler?.resize(t.width, t.height)
    this.dispatchEvent(new ResizeEvent(t))
  }
  pickup(t: MessageEventMap['pickup']) {
    this.handler?.pickup(t.x, t.y)
    this.dispatchEvent(new PickupEvent(t))
  }
  rotate(t: MessageEventMap['rotate']) {
    this.handler?.rotate(t.x, t.y)
    this.dispatchEvent(new RotateEvent(t))
  }
  setting(t: MessageEventMap['setting']) {
    this.handler?.setting(t.setting)
    this.dispatchEvent(new SettingsEvent(t))
  }
}

const receiver = new EventReceiver()
self.addEventListener("message", (e) => {
  receiver.messageHanlder(e)
})
self.addEventListener('error', console.error);