import {
  Scene, WebGLRenderer,
  PointLight, Raycaster,
  AxesHelper, PerspectiveCamera,
  Vector2, Vector3,
  BoxGeometry, MeshLambertMaterial,
  AmbientLight, Mesh, Intersection, Object3D, Object3DEventMap
} from 'three'
import {
  EffectComposer, OutlinePass,
  RenderPass
} from 'three/examples/jsm/Addons.js'



import {
  BoxMatrix
} from "R/models";
const lightPosition = new Vector3(60, 80, 100)

export class EventHandlerState {
  public composer!: EffectComposer;
  public rayCaster!: Raycaster
  public renderer!: WebGLRenderer
  public pickups?:Intersection<Object3D<Object3DEventMap>>[]
  public scene!: Scene
  public outline!: OutlinePass
  public camera!: PerspectiveCamera
  constructor(public canvas: OffscreenCanvas) {


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
  begenRender(n?: number) {
    const obj = this.rayCaster.intersectObjects<Mesh<BoxGeometry, MeshLambertMaterial>>(this.scene.children).at(0)
    this.outline.selectedObjects = obj ? [obj.object] : [];
    this.composer.render()
    requestAnimationFrame((n) => this.begenRender(n))
  }
}