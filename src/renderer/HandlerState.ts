import {
  Scene, WebGLRenderer,
  PointLight, Raycaster,
  AxesHelper, PerspectiveCamera,
  AmbientLight, Intersection,
  Object3D, Object3DEventMap, Vector2, Color, DirectionalLight, HemisphereLight,
} from 'three'
import { EffectComposer, OutlinePass, RenderPass } from './Addons.js'



import {
  BoxMatrix
} from "R/models";
import { CameraSetting, RenderSetting, SceneSetting, Settings } from './types.js';

export class EventHandlerState {
  public composer: EffectComposer;
  public rayCaster: Raycaster
  public renderer: WebGLRenderer
  public rayHitsSet?: Intersection<Object3D<Object3DEventMap>>[]
  public scene: Scene
  public renderPass: RenderPass
  public outline: OutlinePass
  public camera: PerspectiveCamera
  #animalId: number = 0
  constructor(public canvas: OffscreenCanvas, options: {
    setting: Settings
  }) {
    const { width, height } = canvas
    this.scene = new Scene()
    this.sceneSetting(options.setting.scene)
    this.rayCaster = new Raycaster()
    this.camera = new PerspectiveCamera(options.setting.camera.fov, width / height, options.setting.camera.near, options.setting.camera.far)
    this.cameraSetting(options.setting.camera)
    this.renderer = new WebGLRenderer({ canvas, antialias: true })
    this.renderSetting(options.setting.render)
    this.renderer.setSize(width, height, false)
    this.renderer.setPixelRatio(self.devicePixelRatio)

    this.composer = new EffectComposer(this.renderer)
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass)
    // 外边线shader通道
    this.outline = new OutlinePass(new Vector2(width, height), this.scene, this.camera);


    this.outline.visibleEdgeColor.set(0xffff00);
    this.composer.addPass(this.outline);

    this.begenRender()
  }
  setting(setting: Settings) {
    this.sceneSetting(setting.scene)
    this.cameraSetting(setting.camera)
    this.renderSetting(setting.render)
  }
  private cameraSetting(setting: CameraSetting) {
    if (setting.position) {

      Object.assign(this.camera.position, setting.position)
    }
    this.camera.lookAt(BoxMatrix.position)
  }
  /**
   * 场景初始化
   * @param setting 
   */
  private sceneSetting(setting: SceneSetting) {
    const axesHelper = new AxesHelper(setting.axesHelper.lenght)
    const ambientLight = new AmbientLight(setting.ambientLight.color, setting.ambientLight.intensity)
    const hemisphereLight = new HemisphereLight(setting.hemisphereLight.color, setting.hemisphereLight.intensity)

    setting.directionalLight.forEach((i) => {
      const directionalLight = new DirectionalLight(i.color, i.intensity)
      Object.assign(directionalLight.target, i.target)
      this.scene.add(directionalLight)
    })

    this.scene.add(
      axesHelper,
      BoxMatrix,
      ambientLight,
      hemisphereLight
    )
    if (setting.background.value) {
      this.scene.background = new Color(setting.background.value)
    }
  }
  /**
   * 初始化渲染器
   * @param setting 
   */
  private renderSetting(setting: RenderSetting) {
    this.renderer.setClearColor(setting.clearColor.value, setting.clearColor.alpha)
    if (setting.clippingPlanes) {

    }
    // setting.addEventListener('',()=>{})
  }
  begenRender(n: number = 0) {

    if (this.rayHitsSet) {
      const theFirst = this.rayHitsSet.at(0)
      this.outline.selectedObjects = theFirst ? [theFirst.object] : []
    }
    this.#animalId = requestAnimationFrame((n) => this.begenRender(n))
    this.composer.render()
    // this.renderer.render(this.scene, this.camera)
  }
  distory() {
    if (this.#animalId) {
      cancelAnimationFrame(this.#animalId)
    }
    this.renderer.dispose()

  }
}