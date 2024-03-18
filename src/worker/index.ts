import { Vector3, } from 'three'

import { EventHandler } from './messagehandler';
import { MassageEventAction } from './types';

// 椭圆点位置
const lightPosition = new Vector3(60, 80, 100)
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
  }
})
