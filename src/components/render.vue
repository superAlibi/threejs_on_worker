<script setup lang="ts">
import { onMounted, ref, unref, onBeforeUnmount, watch } from 'vue'
import State from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from "dat.gui";
import { EventDispatcher } from 'R/worker';
import { EventSetting, GUISetting } from './types'
import { useEventListener } from '@vueuse/core'
interface RenderProp {
  eventSetting: Partial<EventSetting>,
  guiSetting: Partial<GUISetting>,
  stateEnable: boolean
}
const props = defineProps<Partial<RenderProp>>()

const canvasRef = ref<HTMLCanvasElement>()
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

const dispatcher = new EventDispatcher()
const clearnDown = useEventListener(document, 'keydown', dispatcher.keyboard),
  clearnUp = useEventListener(document, 'keydown', dispatcher.keyboard)
const resizeObserve = new ResizeObserver((e) => {
  const { contentRect: { width, height } } = e.at(0)!
  dispatcher.resize(width, height)
})

onMounted(() => {
  const canvas = unref(canvasRef)!
  const styles = getComputedStyle(canvas)
  canvas.width = Number.parseInt(styles.width.slice(0, -2))
  canvas.height = Number.parseInt(styles.height.slice(0, -2))
  const offscreen = canvas.transferControlToOffscreen()
  dispatcher.initRender(offscreen)
  resizeObserve.observe(canvas)
  if (props.stateEnable) {
    state = new State()
    canvas.parentElement?.appendChild(state.dom)
  }
  if(props.guiSetting){
    gui = new GUI(props.guiSetting);
  }
  renderLoop()

})
onBeforeUnmount(() => {
  clearnDown()
  clearnUp()
  const canvas = unref(canvasRef)!
  if (canvas.parentElement) {
    state?.dom?.remove()
  }
  resizeObserve.disconnect()
  gui?.destroy()
})
function handlerWheelEvent(params: MouseEvent) {
  if (!props.eventSetting?.wheel) {
    return
  }
  dispatcher.mouse(params)
}
function handlerPointerMove(params: MouseEvent) {
  if (!props.eventSetting?.move) {
    return
  }
  dispatcher.mouse(params)
}

</script>

<template>
  <canvas @pointercancel="dispatcher.mouse" @pointermove="handlerPointerMove" @pointerup="dispatcher.mouse"
    @pointerdown="dispatcher.mouse" @wheel.passive="handlerWheelEvent" @contextmenu="dispatcher.mouse"
    class="w-full h-full block" ref="canvasRef"></canvas>
</template>
