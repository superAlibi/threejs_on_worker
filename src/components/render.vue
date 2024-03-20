<script setup lang="ts">
import { onMounted, ref, unref, onBeforeUnmount } from 'vue'
import State from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from "dat.gui";
import { EventDispatcher } from 'R/worker';
import { EventSetting } from './types'
import { useEventListener } from '@vueuse/core'
const props = defineProps<Partial<EventSetting>>()

const canvasRef = ref<HTMLCanvasElement>(),
  gui = new GUI(),
  state = new State()

function renderLoop() {
  state.update()

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
  canvas.parentElement?.appendChild(state.dom)
  renderLoop()

})
onBeforeUnmount(() => {
  clearnDown()
  clearnUp()
  const canvas = unref(canvasRef)!
  if (canvas.parentElement) {
    state.dom.remove()
  }
  resizeObserve.disconnect()
  gui.destroy()
})

function handlerPointerMove(params: MouseEvent) {
  if (!props.move) {
    return
  }
  dispatcher.mouse(params)
}

</script>

<template>
  <canvas @pointercancel="dispatcher.mouse" @pointermove="handlerPointerMove" @pointerup="dispatcher.mouse"
    @pointerdown="dispatcher.mouse" @wheel="dispatcher.mouse" @contextmenu="dispatcher.mouse"
    class="w-full h-full block" ref="canvasRef"></canvas>
</template>
