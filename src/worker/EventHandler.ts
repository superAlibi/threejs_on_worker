import {
  Vector2,
} from 'three'

import { MassageEventAction } from './types';


import { EventHandlerState } from './EventHandlerState';

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


  rotate() {

  }
  pickup(x: number, y: number) {

    this.rayCaster.setFromCamera(new Vector2(x, y), this.camera)
    const pickups = this.rayCaster.intersectObjects(Handler?.scene.children)
    this.pickups = pickups
    this.outline.selectedObjects = pickups.map(i => i.object)
  }
}
let Handler: EventHandler
self.addEventListener("message", (e: MessageEvent<MassageEventAction>) => {
  const { data } = e
  switch (data.type) {
    case 'init':
      Handler = new EventHandler(data.canvas)
      break;
    case 'resize':
      Handler?.resize(data.width, data.height)
      break;
    case 'mousemove':
      Handler?.pickup(data.x, data.y)
      break;
  }
})
