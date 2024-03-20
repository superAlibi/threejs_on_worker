import {
  Scene, WebGLRenderer, PointLight,
  AxesHelper, PerspectiveCamera, Raycaster,
  Vector2, Vector3, AmbientLight,
  BoxGeometry, MeshLambertMaterial, Mesh
} from 'three'
import {
  EffectComposer, OutlinePass,
  RenderPass
} from 'three/examples/jsm/Addons.js'
import {
  BoxMatrix
} from "R/models";
import { MassageEventAction } from './types';


const lightPosition = new Vector3(60, 80, 100)
/**
 * 事件处理器,同时也是渲染器实际内容
 */
class EventHandler extends Event {
  public composer!: EffectComposer;
  public rayCaster!: Raycaster
  public renderer!: WebGLRenderer

  public scene!: Scene
  public outline!: OutlinePass
  public camera!: PerspectiveCamera
  constructor(public canvas: OffscreenCanvas) {

    super('MessageEventHandlerInit')
    const { width, height } = canvas
    const scene = new Scene(),
      rayCaster = new Raycaster(),
      camera = new PerspectiveCamera(90, width / height, 1, 1000)

    const renderer = new WebGLRenderer({ canvas, antialias: true }),
      pointLight = new PointLight(0xffffff, 1),
      axesHelper = new AxesHelper(100),
      // 后处理效果合成器
      composer = new EffectComposer(renderer)



    // 后处理通道,必须加入才能使其他通道生效
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // 外边线shader通道
    const outline = new OutlinePass(new Vector2(width, height), scene, camera);


    outline.visibleEdgeColor.set(0xffff00);

    composer.addPass(outline)
    renderer.setClearAlpha(.4)
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(self.devicePixelRatio)
    pointLight.position.copy(lightPosition)
    pointLight.decay = 0
    scene.add(
      new AmbientLight(0xffffff, 1),
      axesHelper,
      pointLight,
      BoxMatrix
    )



    camera.position.set(15, 14, 13)
    camera.lookAt(BoxMatrix.position)


    Object.assign(this, {
      rayCaster,
      renderer,
      composer,
      scene,
      camera,
      outline
    })
    this.begenRender()
  }

  resize(width: number, height: number) {
    Object.assign(this.canvas, { width, height })
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix()
  }

  begenRender(n?: number) {
    const obj = this.rayCaster.intersectObjects<Mesh<BoxGeometry, MeshLambertMaterial>>(this.scene.children).at(0)
    this.outline.selectedObjects = obj ? [obj.object] : [];
    this.composer.render()
    requestAnimationFrame((n) => this.begenRender(n))
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
  }
})
