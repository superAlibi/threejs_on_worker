<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref, unref } from 'vue'
import State from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from "dat.gui";
import { EventDispatcher } from './worker';


const canvasRef = ref<HTMLCanvasElement>()
const rendererWorker = new Worker(new URL('./worker/index.ts', import.meta.url), { type: 'module' })

const gui = new GUI(),
  state = new State()

function renderLoop() {
  state.update()
  requestAnimationFrame(renderLoop)
}

const dispatcher = new EventDispatcher()
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
