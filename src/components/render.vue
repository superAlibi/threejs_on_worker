<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref, unref } from 'vue'
import State from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from "dat.gui";
import { EventDispatcher } from 'R/worker';



const canvasRef = ref<HTMLCanvasElement>()
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
  canvas.parentElement?.appendChild(state.dom)
  renderLoop()
})
onBeforeMount(() => {
  resizeObserve.disconnect()
})
onUnmounted(() => {
  state.dom.remove()
  gui.destroy()
})
</script>

<template>
  <canvas class="w-full h-full block" ref="canvasRef"></canvas>
</template>
