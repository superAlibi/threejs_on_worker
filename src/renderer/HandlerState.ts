import {
  Scene, WebGLRenderer, Raycaster,
  AxesHelper, PerspectiveCamera,
  AmbientLight, Intersection,
  Object3D, Object3DEventMap, Vector2,
  Color, DirectionalLight, HemisphereLight,
} from 'three'
import { EffectComposer, OutlinePass, RenderPass } from './Addons.js'



import {
  BoxMatrix
} from "R/models";
import { CameraSetting, RenderSetting, SceneSetting, Settings } from './types.js';
import { SettingsEvent } from './events/index.js';

/**
 * 事件处理器状态
 * 内部的坐标系必须是场景坐标系,不能是任何dom坐标系
 */
export class EventHandlerState extends EventTarget{
  public composer: EffectComposer;
  public rayCaster: Raycaster
  public renderer: WebGLRenderer
  public rayHitsSet?: Intersection<Object3D<Object3DEventMap>>[]
  public scene: Scene
  public renderPass: RenderPass
  public outline: OutlinePass
  public camera: PerspectiveCamera
  #animalId: number = 0
  constructor(public canvas: OffscreenCanvas, setting: Settings) {
    super()
    const { width, height } = canvas
    this.scene = new Scene()
    this.sceneSetting(setting.scene)
    this.rayCaster = new Raycaster()
    this.camera = new PerspectiveCamera(setting.camera.fov, width / height, setting.camera.near, setting.camera.far)
    this.cameraSetting(setting.camera)
    this.renderer = new WebGLRenderer({ canvas, antialias: true })
    this.renderSetting(setting.render)
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
  /**
   * 更新设置
   * @param setting 
   */
  setting(setting: Settings) {
    this.sceneSetting(setting.scene)
    this.cameraSetting(setting.camera)
    this.renderSetting(setting.render)
    this.dispatchEvent(new SettingsEvent(setting))
  }
  /**
   * 更新相机参数
   * 只用于setting方法调用
   * @param setting 相机设置
   */
  private cameraSetting(setting?: CameraSetting) {
    if (!setting) { return }
    if (setting.position) {
      Object.assign(this.camera.position, setting.position)
    }
    this.camera.lookAt(BoxMatrix.position)
  }
  /**
   * 只用于setting方法调用
   * @param setting 场景设置
   */
  private sceneSetting(setting?: SceneSetting) {
    if (!setting) { return }
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
   * 只用于setting方法调用
   * @param setting 渲染器设置
   */
  private renderSetting(setting?: RenderSetting) {
    if (!setting) { return }
    this.renderer.setClearColor(setting.clearColor.value, setting.clearColor.alpha)
    if (setting.clippingPlanes) {

    }

  }
  begenRender(n: number = 0) {

    if (this.rayHitsSet) {
      const theFirst = this.rayHitsSet.at(0)
      this.outline.selectedObjects = theFirst ? [theFirst.object] : []
    }
    this.#animalId = requestAnimationFrame((n) => this.begenRender(n))
    this.composer.render()
  }
  distory() {
    if (this.#animalId) {
      cancelAnimationFrame(this.#animalId)
    }
    this.renderer.dispose()

  }
}