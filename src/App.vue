<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref, unref } from 'vue'
// import RenderWorker from './worker/index?worker'
import State from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from "dat.gui";
import { InitEventMessage, ResizeEventMessage } from './worker/types';

const canvasRef = ref<HTMLCanvasElement>()
const rendererWorker = new Worker(new URL('./worker/index.ts', import.meta.url), { type: 'module' })

const gui = new GUI(),
  state = new State()

function renderLoop() {
  state.update()
  requestAnimationFrame(renderLoop)
}

// 盒子大小发生改变时的延迟执行函数id
let timeoutid: number
const resizeObserve = new ResizeObserver((e) => {
  const { contentRect: { width, height } } = e.at(0)!

  if (timeoutid) {
    clearTimeout(timeoutid)
  }
  timeoutid = window.setTimeout(() => {

    const data: ResizeEventMessage = {
      type: 'resize',
      width: width,
      height: height
    }
    timeoutid = 0
    rendererWorker.postMessage(data)
  }, 60)

})
onMounted(() => {
  const canvas = unref(canvasRef)!
  const styles = getComputedStyle(canvas)
  canvas.width = Number.parseInt(styles.width.slice(0, -2))
  canvas.height = Number.parseInt(styles.height.slice(0, -2))
  const offscreen = canvas.transferControlToOffscreen()
  const messageBody: InitEventMessage = {
    type: 'init', canvas: offscreen
  }
  rendererWorker.postMessage(messageBody, [offscreen])
  // document.body.append(state.dom)
  resizeObserve.observe(canvas)
  renderLoop()
})
onBeforeMount(() => {
  resizeObserve.disconnect()
})
onUnmounted(() => {
  rendererWorker.terminate()
  gui.destroy()
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style>
canvas {
  display: block;
  height: 100vh;
  width: 100vw;
}
</style>
