<script setup lang="ts">
import { onMounted, ref, unref, onBeforeUnmount, watch } from 'vue'
import State from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from "dat.gui";
import { EventInteractor } from 'R/helper';
import { EventSetting, GUISetting } from './types'
import { useElementSize, useEventListener } from '@vueuse/core'
interface RenderProp {
  eventSetting: Partial<EventSetting>,
  guiSetting: Partial<GUISetting>,
  stateEnable: boolean
}
const props = defineProps<Partial<RenderProp>>()

const canvasRef = ref<HTMLCanvasElement>()
const { width, height } = useElementSize(canvasRef)
let gui: GUI,
  state: State
watch(() => props.guiSetting, (v) => {
  if (v && !gui) {
    gui = new GUI(v);
  } else if (!v) {
    gui?.destroy()
  }
})
watch(() => props.stateEnable, (v) => {


  if (v && !state) {
    const canvas = unref(canvasRef)!
    state = new State()
    canvas.parentElement?.appendChild(state.dom)
  } else if (!v) {
    state?.dom?.remove()
  }
})
function renderLoop() {
  state?.update()
  requestAnimationFrame(renderLoop)
}

const dispatcher = new EventInteractor()
useEventListener(document, 'keydown', dispatcher.keyboard)
useEventListener(document, 'keydown', dispatcher.keyboard)
watch([width, height], ([w, h]) => {
  dispatcher.resize(w, h)
})


onMounted(() => {
  const canvas = unref(canvasRef)!
  canvas.width = unref(width)
  canvas.height = unref(height)
  const offscreen = canvas.transferControlToOffscreen()
  dispatcher.initRender(offscreen)

  if (props.stateEnable) {
    state = new State()
    canvas.parentElement?.appendChild(state.dom)
  }
  if (props.guiSetting) {
    gui = new GUI(props.guiSetting);
  }
  renderLoop()

})
onBeforeUnmount(() => {

  const canvas = unref(canvasRef)!
  if (canvas.parentElement) {
    state?.dom?.remove()
  }

  gui?.destroy()
})
/**
 * 指针移动回调处理
 * @param params 
 */
function handlerPointerMove(params: PointerEvent) {
  console.log(params.type);

  if (!props.eventSetting?.move) {
    params.preventDefault()
    return
  }
  dispatcher.onMouseMove(params)
}
/**
 * 指针按键回弹事件
 * @param params 
 */
function handlerPointerDown(params: PointerEvent) {
  dispatcher.onMouseDown(params)
}
function handlerWheelEvent(params: MouseEvent) {
  if (!props.eventSetting?.wheel) {
    return
  }
  dispatcher.wheel(params)
}
function handlerContentMenu(params: MouseEvent) {
  params.preventDefault()
  console.log('此功能不可用');

}
function handlerPorinterCancel(params: PointerEvent) {
  console.log('指针取消事件');

  dispatcher.onMouseUp(params)
}
</script>

<template>
  <canvas @pointermove="handlerPointerMove" @pointercancel="handlerPorinterCancel" @pointerout="handlerPorinterCancel"
    @pointerup="handlerPorinterCancel" @pointerdown="handlerPointerDown" @wheel.passive="handlerWheelEvent"
    @contextmenu="handlerContentMenu" class="w-full h-full block" ref="canvasRef"></canvas>
</template>