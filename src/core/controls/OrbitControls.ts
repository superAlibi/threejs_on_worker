
import {
	EventDispatcher,
	MOUSE,
	Quaternion,
	Spherical,
	TOUCH,
	Vector2,
	Vector3,
	Plane,
	Ray,
	MathUtils,
	PerspectiveCamera,
	OrthographicCamera,
	Matrix4
} from 'three';
import { PointerEventInfo,KeyBoardEventInfo,WheelEventInfo } from '../types.ts';
interface WheelEventMetaBase {
	clientX: number,
	clientY: number,
	deltaY: number,
}
interface WheelEventMetaData extends WheelEventMetaBase {
	deltaMode: number,
	ctrlKey: boolean
}
// OrbitControls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };
const _ray = new Ray();
const _plane = new Plane();
const TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);


const EPS = 0.000001;
const STATE = {
	NONE: - 1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
};
class OrbitControls extends EventDispatcher<{
	change: any
	start: any
	end: any
}> {

	/**
	 *			以下是公共参数,相当于设置行为状态
	 */

	// Set to false to disable this control
	enabled: boolean = true
	// "target" sets the location of focus, where the object orbits around
	target: Vector3 = new Vector3()
	// Sets the 3D cursor (similar to Blender), from which the maxTargetRadius takes effect
	cursor: Vector3 = new Vector3();
	// How far you can dolly in and out ( PerspectiveCamera only )
	minDistance: number = 0
	maxDistance: number = Infinity
	// How far you can zoom in and out ( OrthographicCamera only )
	minZoom: number = 0;
	maxZoom: number = Infinity;

	// Limit camera target within a spherical area around the cursor
	minTargetRadius: number = 0;
	maxTargetRadius: number = Infinity;
	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	minPolarAngle: number = 0; // radians
	maxPolarAngle: number = Math.PI; // radians
	// How far you can orbit horizontally, upper and lower limits.
	// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
	minAzimuthAngle: number = - Infinity;// radians
	maxAzimuthAngle: number = Infinity; // radians
	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	enableDamping: boolean = false;
	dampingFactor: number = 0.05;
	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	enableZoom: boolean = true;
	zoomSpeed: number = 1.0;
	// Set to false to disable rotating
	enableRotate: boolean = true;
	rotateSpeed: number = 1.0;
	// Set to false to disable panning
	enablePan: boolean = true;
	panSpeed: number = 1.0;
	screenSpacePanning: boolean = true; // if false, pan orthogonal to world-space direction camera.up
	keyPanSpeed: number = 7.0;	// pixels moved per arrow key push
	zoomToCursor: boolean = false;
	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	autoRotate: boolean = false;
	autoRotateSpeed: number = 2.0; // 30 seconds per orbit when fps is 60
	// The four arrow keys
	keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' }
	// Mouse buttons
	mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
	touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }
	// 暂存的摄像机参数,调用save方法后会写入
	target0: Vector3 = new Vector3();
	position0: Vector3
	zoom0: number


	// public methods
	getPolarAngle() {

		return this.#spherical.phi;

	};

	get azimuthalAngle() {

		return this.#spherical.theta;

	};


	get distance() {

		return this.object.position.distanceTo(this.target);

	};



	saveState() {

		this.target0.copy(this.target);
		this.position0.copy(this.object.position);
		this.zoom0 = this.object.zoom;

	};



	reset = () => {

		this.target.copy(this.target0);
		this.object.position.copy(this.position0);
		this.object.zoom = this.zoom0;
		this.object.updateProjectionMatrix();
		this.dispatchEvent(_changeEvent);
		this.update();

		this.#state = STATE.NONE;

	};

	update: (this: OrbitControls) => void;

	/**
	 * 鼠标滚动处理函数
	 * @param event 
	 * @returns 
	 */
	mouseWheelHandler = (event: WheelEventInfo) => {

		if (!this.enabled || !this.enableZoom || this.#state !== STATE.NONE) return;

		this.dispatchEvent(_startEvent);

		this.#handleMouseWheel(this.#customWheelEvent(event));

		this.dispatchEvent(_endEvent);

	}

	/**
	 * 键盘处理事件处理
	 * 主要是外部dm使用
	 * 
	 * @param event 
	 */
	keyDownHandler = (event: 		KeyBoardEventInfo) => {

		if (!this.enabled || !this.enablePan) return;

		this.#handleKeyDown(event);

	}
	/**
	 * 
	 *   事件处理器部分,监听状态和重置状态
	 * 
	 * 
	 */
	/**
	 * 鼠标开始
	 * @param event 
	 * @returns 
	 */
	pointerDownHandler = (event: PointerEventInfo) => {

		if (this.enabled === false) return;

		//

		if (this.#isTrackingPointer(event)) return;

		//

		this.#addPointer(event.pointerId);

		if (event.pointerType === 'touch') {

			this.#onTouchStart(event);

		} else {

			this.#onMouseDown(event);

		}

	}
	pointerMoveHandler = (event: PointerEventInfo) => {

		if (this.enabled === false) return;

		if (event.pointerType === 'touch') {

			this.#onTouchMove(event);

		} else {

			this.#onMouseMove(event);

		}

	}
	/**
	 * 指针弹出
	 * @param event 
	 */
	pointerUpHandler = (event: PointerEventInfo) => {

		this.#removePointer(event.pointerId);

		switch (this.#pointers.length) {

			case 0:

				this.dispatchEvent(_endEvent);
				this.#state = STATE.NONE;

				break;

			case 1:

				const pointerId = this.#pointers[0];
				const position = this.#pointerPositions[pointerId];

				// minimal placeholder event - allows state correction on pointer-up

				this.#onTouchStart({ pointerId: pointerId, offsetX: position.x, offsetY: position.y } as PointerEventInfo);

				break;

		}

	}
	dispose = () => {

		this.dispatchEvent({ type: 'dispose' }); // should this be added here?

	};
	#state: number = STATE.NONE;
	// current position in spherical coordinates
	#spherical: Spherical = new Spherical()
	#sphericalDelta: Spherical = new Spherical()

	#scale: number = 1
	#panOffset: Vector3 = new Vector3()
	#pointers: Array<number> = [];

	#rotateStart: Vector2 = new Vector2()
	#rotateEnd: Vector2 = new Vector2()
	#rotateDelta: Vector2 = new Vector2()


	#panStart: Vector2 = new Vector2()
	#panEnd: Vector2 = new Vector2()
	#panDelta: Vector2 = new Vector2()


	#dollyStart: Vector2 = new Vector2()
	#dollyEnd: Vector2 = new Vector2()
	#dollyDelta: Vector2 = new Vector2()

	#dollyDirection = new Vector3();
	#mouse = new Vector2();


	#performCursorZoom = false;


	#pointerPositions: Record<number, Vector2> = {};

	#controlActive = false;
	/**
	 * 源码中出现了闭包,这里只做类型声明
	 */
	#panLeft: (distance: number, objectMatrix: Matrix4) => void
	#panUp: (distance: number, objectMatrix: Matrix4) => void
	// deltaX and deltaY are in pixels; right and down are positive
	#pan: (deltax: number, deltay: number) => void;
	#updateZoomParameters(clientX: number, clientY: number) {

		if (!this.zoomToCursor) {

			return;

		}

		this.#performCursorZoom = true;


		const dx = clientX - this.rect.left;
		const dy = clientY - this.rect.top;
		const w = this.rect.width;
		const h = this.rect.height;

		this.#mouse.x = (dx / w) * 2 - 1;
		this.#mouse.y = - (dy / h) * 2 + 1;

		this.#dollyDirection.set(this.#mouse.x, this.#mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();

	}

	/**
	 * 
	 * 
	 * 
	 * 事件回调内部处理函数,私有属性,不对外开放
	 * 
	 * 
	 * 
	 * 
	 * 
	 */

	#clampDistance(dist: number) {

		return Math.max(this.minDistance, Math.min(this.maxDistance, dist));

	}

	#getAutoRotationAngle = (deltaTime: number) => {

		if (deltaTime !== null) {

			return (2 * Math.PI / 60 * this.autoRotateSpeed) * deltaTime;

		} else {

			return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

		}

	}

	#getZoomScale = (delta: number) => {

		const normalizedDelta = Math.abs(delta * 0.01);
		return Math.pow(0.95, this.zoomSpeed * normalizedDelta);

	}
	#dollyOut = (dollyScale: number) => {

		if (this.object instanceof PerspectiveCamera || this.object instanceof OrthographicCamera) {

			this.#scale /= dollyScale;

		} else {

			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			this.enableZoom = false;

		}

	}

	#dollyIn = (dollyScale: number) => {

		if (this.object instanceof PerspectiveCamera || this.object instanceof OrthographicCamera) {

			this.#scale *= dollyScale;

		} else {

			console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			this.enableZoom = false;

		}

	}
	/**
	 * 事件回调内部处理函数
	 * 
	 * @param event 
	 */
	#handleMouseWheel = (event: WheelEventMetaBase) => {

		this.#updateZoomParameters(event.clientX, event.clientY);

		if (event.deltaY < 0) {

			this.#dollyIn(this.#getZoomScale(event.deltaY));

		} else if (event.deltaY > 0) {

			this.#dollyOut(this.#getZoomScale(event.deltaY));

		}

		this.update();

	}



	#handleTouchStartRotate = (event: PointerEventInfo) => {

		if (this.#pointers.length === 1) {

			this.#rotateStart.set(event.offsetX, event.offsetY);

		} else {

			const position = this.#getSecondPointerPosition(event);

			const x = 0.5 * (event.offsetX + position.x);
			const y = 0.5 * (event.offsetY + position.y);

			this.#rotateStart.set(x, y);

		}

	}

	#handleTouchStartPan = (event: PointerEventInfo) => {

		if (this.#pointers.length === 1) {

			this.#panStart.set(event.offsetX, event.offsetY);

		} else {

			const position = this.#getSecondPointerPosition(event);

			const x = 0.5 * (event.offsetX + position.x);
			const y = 0.5 * (event.offsetY + position.y);

			this.#panStart.set(x, y);

		}

	}

	#handleTouchStartDolly = (event: PointerEventInfo) => {

		const position = this.#getSecondPointerPosition(event);

		const dx = event.offsetX - position.x;
		const dy = event.offsetY - position.y;

		const distance = Math.sqrt(dx * dx + dy * dy);

		this.#dollyStart.set(0, distance);

	}

	#handleTouchStartDollyPan = (event: PointerEventInfo) => {

		if (this.enableZoom) this.#handleTouchStartDolly(event);

		if (this.enablePan) this.#handleTouchStartPan(event);

	}

	#handleTouchStartDollyRotate = (event: PointerEventInfo) => {

		if (this.enableZoom) this.#handleTouchStartDolly(event);

		if (this.enableRotate) this.#handleTouchStartRotate(event);

	}

	#handleTouchMoveRotate = (event: PointerEventInfo) => {

		if (this.#pointers.length == 1) {

			this.#rotateEnd.set(event.offsetX, event.offsetY);

		} else {

			const position = this.#getSecondPointerPosition(event);

			const x = 0.5 * (event.offsetX + position.x);
			const y = 0.5 * (event.offsetY + position.y);

			this.#rotateEnd.set(x, y);

		}

		this.#rotateDelta.subVectors(this.#rotateEnd, this.#rotateStart).multiplyScalar(this.rotateSpeed);


		this.#rotateLeft(2 * Math.PI * this.#rotateDelta.x / this.clientHeight); // yes, height

		this.#rotateUp(2 * Math.PI * this.#rotateDelta.y / this.clientHeight);

		this.#rotateStart.copy(this.#rotateEnd);

	}

	#handleTouchMovePan = (event: PointerEventInfo) => {

		if (this.#pointers.length === 1) {

			this.#panEnd.set(event.offsetX, event.offsetY);

		} else {

			const position = this.#getSecondPointerPosition(event);

			const x = 0.5 * (event.offsetX + position.x);
			const y = 0.5 * (event.offsetY + position.y);

			this.#panEnd.set(x, y);

		}

		this.#panDelta.subVectors(this.#panEnd, this.#panStart).multiplyScalar(this.panSpeed);

		this.#pan(this.#panDelta.x, this.#panDelta.y);

		this.#panStart.copy(this.#panEnd);

	}

	#handleTouchMoveDolly = (event: PointerEventInfo) => {

		const position = this.#getSecondPointerPosition(event);

		const dx = event.offsetX - position.x;
		const dy = event.offsetY - position.y;

		const distance = Math.sqrt(dx * dx + dy * dy);

		this.#dollyEnd.set(0, distance);

		this.#dollyDelta.set(0, Math.pow(this.#dollyEnd.y / this.#dollyStart.y, this.zoomSpeed));

		this.#dollyOut(this.#dollyDelta.y);

		this.#dollyStart.copy(this.#dollyEnd);

		const centerX = (event.offsetX + position.x) * 0.5;
		const centerY = (event.offsetY + position.y) * 0.5;

		this.#updateZoomParameters(centerX, centerY);

	}

	#handleTouchMoveDollyPan = (event: PointerEventInfo) => {

		if (this.enableZoom) this.#handleTouchMoveDolly(event);

		if (this.enablePan) this.#handleTouchMovePan(event);

	}

	#handleTouchMoveDollyRotate = (event: PointerEventInfo) => {

		if (this.enableZoom) this.#handleTouchMoveDolly(event);

		if (this.enableRotate) this.#handleTouchMoveRotate(event);

	}
	#trackPointer = (event: PointerEventInfo) => {

		let position = this.#pointerPositions[event.pointerId];

		if (!position) {

			position = new Vector2();
			this.#pointerPositions[event.pointerId] = position;

		}

		position.set(event.offsetX, event.offsetY);

	}

	#getSecondPointerPosition = (event: PointerEventInfo) => {

		const pointerId = (event.pointerId === this.#pointers[0]) ? this.#pointers[1] : this.#pointers[0];

		return this.#pointerPositions[pointerId];

	}

	#handleMouseDownRotate = (event: PointerEventInfo) => {

		this.#rotateStart.set(event.clientX, event.clientY);

	}

	#handleMouseDownDolly = (event: PointerEventInfo) => {

		this.#updateZoomParameters(event.clientX, event.clientX);
		this.#dollyStart.set(event.clientX, event.clientY);

	}


	#handleMouseDownPan(event: PointerEventInfo) {

		this.#panStart.set(event.clientX, event.clientY);

	}

	#handleMouseMoveRotate = (event: PointerEventInfo) => {

		this.#rotateEnd.set(event.clientX, event.clientY);

		this.#rotateDelta.subVectors(this.#rotateEnd, this.#rotateStart).multiplyScalar(this.rotateSpeed);


		this.#rotateLeft(2 * Math.PI * this.#rotateDelta.x / this.clientHeight); // yes, height

		this.#rotateUp(2 * Math.PI * this.#rotateDelta.y / this.clientHeight);

		this.#rotateStart.copy(this.#rotateEnd);

		this.update();

	}
	#isTrackingPointer(event: PointerEventInfo) {

		for (let i = 0; i < this.#pointers.length; i++) {

			if (this.#pointers[i] == event.pointerId) return true;

		}

		return false;

	}

	#handleMouseMoveDolly = (event: PointerEventInfo) => {

		this.#dollyEnd.set(event.clientX, event.clientY);

		this.#dollyDelta.subVectors(this.#dollyEnd, this.#dollyStart);

		if (this.#dollyDelta.y > 0) {

			this.#dollyOut(this.#getZoomScale(this.#dollyDelta.y));

		} else if (this.#dollyDelta.y < 0) {

			this.#dollyIn(this.#getZoomScale(this.#dollyDelta.y));

		}

		this.#dollyStart.copy(this.#dollyEnd);

		this.update();

	}

	#handleMouseMovePan = (event: PointerEventInfo) => {

		this.#panEnd.set(event.clientX, event.clientY);

		this.#panDelta.subVectors(this.#panEnd, this.#panStart).multiplyScalar(this.panSpeed);

		this.#pan(this.#panDelta.x, this.#panDelta.y);

		this.#panStart.copy(this.#panEnd);

		this.update();

	}
	#onMouseDown = (event: PointerEventInfo) => {

		let mouseAction: number;

		switch (event.button) {

			case 0:

				mouseAction = this.mouseButtons.LEFT;
				break;

			case 1:

				mouseAction = this.mouseButtons.MIDDLE;
				break;

			case 2:

				mouseAction = this.mouseButtons.RIGHT;
				break;

			default:

				mouseAction = - 1;

		}

		switch (mouseAction) {

			case MOUSE.DOLLY:

				if (this.enableZoom === false) return;

				this.#handleMouseDownDolly(event);

				this.#state = STATE.DOLLY;

				break;

			case MOUSE.ROTATE:

				if (event.ctrlKey || event.metaKey || event.shiftKey) {

					if (this.enablePan === false) return;

					this.#handleMouseDownPan(event);

					this.#state = STATE.PAN;

				} else {

					if (this.enableRotate === false) return;

					this.#handleMouseDownRotate(event);

					this.#state = STATE.ROTATE;

				}

				break;

			case MOUSE.PAN:

				if (event.ctrlKey || event.metaKey || event.shiftKey) {

					if (this.enableRotate === false) return;

					this.#handleMouseDownRotate(event);

					this.#state = STATE.ROTATE;

				} else {

					if (this.enablePan === false) return;

					this.#handleMouseDownPan(event);

					this.#state = STATE.PAN;

				}

				break;

			default:

				this.#state = STATE.NONE;

		}

		if (this.#state !== STATE.NONE) {

			this.dispatchEvent(_startEvent);

		}

	}
	#onMouseMove = (event: PointerEventInfo) => {

		switch (this.#state) {

			case STATE.ROTATE:

				if (this.enableRotate === false) return;

				this.#handleMouseMoveRotate(event);

				break;

			case STATE.DOLLY:

				if (this.enableZoom === false) return;

				this.#handleMouseMoveDolly(event);

				break;

			case STATE.PAN:

				if (this.enablePan === false) return;

				this.#handleMouseMovePan(event);

				break;

		}

	}




	#customWheelEvent = (event: WheelEventMetaData) => {

		const mode = event.deltaMode;

		// minimal wheel event altered to meet delta-zoom demand
		const newEvent = {
			clientX: event.clientX,
			clientY: event.clientY,
			deltaY: event.deltaY,
		};

		switch (mode) {

			case 1: // LINE_MODE
				newEvent.deltaY *= 16;
				break;

			case 2: // PAGE_MODE
				newEvent.deltaY *= 100;
				break;

		}

		// detect if event was triggered by pinching
		if (event.ctrlKey && !this.#controlActive) {

			newEvent.deltaY *= 10;

		}

		return newEvent;

	}





	#onTouchStart = (event: PointerEventInfo) => {

		this.#trackPointer(event);

		switch (this.#pointers.length) {

			case 1:

				switch (this.touches.ONE) {

					case TOUCH.ROTATE:

						if (this.enableRotate === false) return;

						this.#handleTouchStartRotate(event);

						this.#state = STATE.TOUCH_ROTATE;

						break;

					case TOUCH.PAN:

						if (this.enablePan === false) return;

						this.#handleTouchStartPan(event);

						this.#state = STATE.TOUCH_PAN;

						break;

					default:

						this.#state = STATE.NONE;

				}

				break;

			case 2:

				switch (this.touches.TWO) {

					case TOUCH.DOLLY_PAN:

						if (this.enableZoom === false && this.enablePan === false) return;

						this.#handleTouchStartDollyPan(event);

						this.#state = STATE.TOUCH_DOLLY_PAN;

						break;

					case TOUCH.DOLLY_ROTATE:

						if (this.enableZoom === false && this.enableRotate === false) return;

						this.#handleTouchStartDollyRotate(event);

						this.#state = STATE.TOUCH_DOLLY_ROTATE;

						break;

					default:

						this.#state = STATE.NONE;

				}

				break;

			default:

				this.#state = STATE.NONE;

		}

		if (this.#state !== STATE.NONE) {

			this.dispatchEvent(_startEvent);

		}

	}

	#onTouchMove = (event: PointerEventInfo) => {

		this.#trackPointer(event);

		switch (this.#state) {

			case STATE.TOUCH_ROTATE:

				if (this.enableRotate === false) return;

				this.#handleTouchMoveRotate(event);

				this.update();

				break;

			case STATE.TOUCH_PAN:

				if (this.enablePan === false) return;

				this.#handleTouchMovePan(event);

				this.update();

				break;

			case STATE.TOUCH_DOLLY_PAN:

				if (this.enableZoom === false && this.enablePan === false) return;

				this.#handleTouchMoveDollyPan(event);

				this.update();

				break;

			case STATE.TOUCH_DOLLY_ROTATE:

				if (this.enableZoom === false && this.enableRotate === false) return;

				this.#handleTouchMoveDollyRotate(event);

				this.update();

				break;

			default:

				this.#state = STATE.NONE;

		}

	}


	#addPointer = (pointerId: number) => {

		this.#pointers.push(pointerId);

	}

	#removePointer = (pointerId: number) => {

		delete this.#pointerPositions[pointerId];

		for (let i = 0; i < this.#pointers.length; i++) {

			if (this.#pointers[i] == pointerId) {

				this.#pointers.splice(i, 1);
				return;

			}

		}

	}


	#handleKeyDown = (event: KeyBoardEventInfo) => {

		let needsUpdate = false;

		switch (event.code) {

			case this.keys.UP:

				if (event.ctrlKey || event.metaKey || event.shiftKey) {

					this.#rotateUp(2 * Math.PI * this.rotateSpeed / this.clientHeight);

				} else {

					this.#pan(0, this.keyPanSpeed);

				}

				needsUpdate = true;
				break;

			case this.keys.BOTTOM:

				if (event.ctrlKey || event.metaKey || event.shiftKey) {

					this.#rotateUp(- 2 * Math.PI * this.rotateSpeed / this.clientHeight);

				} else {

					this.#pan(0, - this.keyPanSpeed);

				}

				needsUpdate = true;
				break;

			case this.keys.LEFT:

				if (event.ctrlKey || event.metaKey || event.shiftKey) {

					this.#rotateLeft(2 * Math.PI * this.rotateSpeed / this.clientHeight);

				} else {

					this.#pan(this.keyPanSpeed, 0);

				}

				needsUpdate = true;
				break;

			case this.keys.RIGHT:

				if (event.ctrlKey || event.metaKey || event.shiftKey) {

					this.#rotateLeft(- 2 * Math.PI * this.rotateSpeed / this.clientHeight);

				} else {

					this.#pan(- this.keyPanSpeed, 0);

				}

				needsUpdate = true;
				break;

		}

		if (needsUpdate) {

			// prevent the browser from scrolling on cursor keys

			this.update();

		}


	}
	#rotateLeft = (angle: number) => {

		this.#sphericalDelta.theta -= angle;

	}

	#rotateUp = (angle: number) => {

		this.#sphericalDelta.phi -= angle;

	}
	get polarAngle() {
		return this.#spherical.phi
	}
	// 以下是状态参数
	constructor(public object: PerspectiveCamera | OrthographicCamera, public rect: DOMRect, public clientHeight: number, public clientWidth: number) {

		super();



		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;



		//
		// public methods
		//




		// this method is exposed, but perhaps it would be better if we can make it private...
		this.update = (() => {

			const offset = new Vector3();

			// so camera.up is the orbit axis
			const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
			const quatInverse = quat.clone().invert();

			const lastPosition = new Vector3();
			const lastQuaternion = new Quaternion();
			const lastTargetPosition = new Vector3();

			const twoPI = 2 * Math.PI;

			return (deltaTime: number = 0) => {

				const position = this.object.position;

				offset.copy(position).sub(this.target);

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				this.#spherical.setFromVector3(offset);

				if (this.autoRotate && this.#state === STATE.NONE) {

					this.#rotateLeft(this.#getAutoRotationAngle(deltaTime));

				}

				if (this.enableDamping) {

					this.#spherical.theta += this.#sphericalDelta.theta * this.dampingFactor;
					this.#spherical.phi += this.#sphericalDelta.phi * this.dampingFactor;

				} else {

					this.#spherical.theta += this.#sphericalDelta.theta;
					this.#spherical.phi += this.#sphericalDelta.phi;

				}

				// restrict theta to be between desired limits

				let min = this.minAzimuthAngle;
				let max = this.maxAzimuthAngle;

				if (isFinite(min) && isFinite(max)) {

					if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

					if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

					if (min <= max) {

						this.#spherical.theta = Math.max(min, Math.min(max, this.#spherical.theta));

					} else {

						this.#spherical.theta = (this.#spherical.theta > (min + max) / 2) ?
							Math.max(min, this.#spherical.theta) :
							Math.min(max, this.#spherical.theta);

					}

				}

				// restrict phi to be between desired limits
				this.#spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.#spherical.phi));

				this.#spherical.makeSafe();


				// move target to panned location

				if (this.enableDamping === true) {

					this.target.addScaledVector(this.#panOffset, this.dampingFactor);

				} else {

					this.target.add(this.#panOffset);

				}

				// Limit the target distance from the cursor to create a sphere around the center of interest
				this.target.sub(this.cursor);
				this.target.clampLength(this.minTargetRadius, this.maxTargetRadius);
				this.target.add(this.cursor);

				let zoomChanged = false;
				// adjust the camera position based on zoom only if we're not zooming to the cursor or if it's an ortho camera
				// we adjust zoom later in these cases
				if (this.zoomToCursor && this.#performCursorZoom || this.object instanceof OrthographicCamera) {

					this.#spherical.radius = this.#clampDistance(this.#spherical.radius);

				} else {

					const prevRadius = this.#spherical.radius;
					this.#spherical.radius = this.#clampDistance(this.#spherical.radius * this.#scale);
					zoomChanged = prevRadius != this.#spherical.radius;

				}

				offset.setFromSpherical(this.#spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion(quatInverse);

				position.copy(this.target).add(offset);

				this.object.lookAt(this.target);

				if (this.enableDamping === true) {

					this.#sphericalDelta.theta *= (1 - this.dampingFactor);
					this.#sphericalDelta.phi *= (1 - this.dampingFactor);

					this.#panOffset.multiplyScalar(1 - this.dampingFactor);

				} else {

					this.#sphericalDelta.set(0, 0, 0);

					this.#panOffset.set(0, 0, 0);

				}

				// adjust camera position
				if (this.zoomToCursor && this.#performCursorZoom) {

					let newRadius: number | null = null;
					if (this.object instanceof PerspectiveCamera) {

						// move the camera down the pointer ray
						// this method avoids floating point error
						const prevRadius = offset.length();
						newRadius = this.#clampDistance(prevRadius * this.#scale);

						const radiusDelta = prevRadius - newRadius;
						this.object.position.addScaledVector(this.#dollyDirection, radiusDelta);
						this.object.updateMatrixWorld();

						zoomChanged = !!radiusDelta;

					} else if (this.object.isOrthographicCamera) {

						// adjust the ortho camera position based on zoom changes
						const mouseBefore = new Vector3(this.#mouse.x, this.#mouse.y, 0);
						mouseBefore.unproject(this.object);

						const prevZoom = this.object.zoom;
						this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this.#scale));
						this.object.updateProjectionMatrix();

						zoomChanged = prevZoom !== this.object.zoom;

						const mouseAfter = new Vector3(this.#mouse.x, this.#mouse.y, 0);
						mouseAfter.unproject(this.object);

						this.object.position.sub(mouseAfter).add(mouseBefore);
						this.object.updateMatrixWorld();

						newRadius = offset.length();

					} else {

						console.warn('WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.');
						this.zoomToCursor = false;

					}

					// handle the placement of the target
					if (newRadius !== null) {

						if (this.screenSpacePanning) {

							// position the orbit target in front of the new camera position
							this.target.set(0, 0, - 1)
								.transformDirection(this.object.matrix)
								.multiplyScalar(newRadius)
								.add(this.object.position);

						} else {

							// get the ray and translation plane to compute target
							_ray.origin.copy(this.object.position);
							_ray.direction.set(0, 0, - 1).transformDirection(this.object.matrix);

							// if the camera is 20 degrees above the horizon then don't adjust the focus target to avoid
							// extremely large values
							if (Math.abs(this.object.up.dot(_ray.direction)) < TILT_LIMIT) {

								object.lookAt(this.target);

							} else {

								_plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
								_ray.intersectPlane(_plane, this.target);

							}

						}

					}

				} else if (this.object instanceof OrthographicCamera) {

					const prevZoom = this.object.zoom;
					this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this.#scale));

					if (prevZoom !== this.object.zoom) {

						this.object.updateProjectionMatrix();
						zoomChanged = true;

					}

				}

				this.#scale = 1;
				this.#performCursorZoom = false;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (zoomChanged ||
					lastPosition.distanceToSquared(this.object.position) > EPS ||
					8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ||
					lastTargetPosition.distanceToSquared(this.target) > EPS) {

					this.dispatchEvent(_changeEvent);

					lastPosition.copy(this.object.position);
					lastQuaternion.copy(this.object.quaternion);
					lastTargetPosition.copy(this.target);

					return true;

				}

				return false;

			};

		})();



		this.#state = STATE.NONE;
		this.#panLeft = (() => {

			const v = new Vector3();

			return (distance, objectMatrix) => {

				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
				v.multiplyScalar(- distance);

				this.#panOffset.add(v);

			};

		})();

		this.#panUp = (() => {

			const v = new Vector3();

			return (distance, objectMatrix) => {

				if (this.screenSpacePanning === true) {

					v.setFromMatrixColumn(objectMatrix, 1);

				} else {

					v.setFromMatrixColumn(objectMatrix, 0);
					v.crossVectors(this.object.up, v);

				}

				v.multiplyScalar(distance);

				this.#panOffset.add(v);

			};

		})();


		this.#pan = (() => {

			const offset = new Vector3();

			return (deltaX, deltaY) => {


				if (this.object instanceof PerspectiveCamera) {

					// perspective
					const position = this.object.position;
					offset.copy(position).sub(this.target);
					let targetDistance = offset.length();

					// half of the fov is center to top of screen
					targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

					// we use only clientHeight here so aspect ratio does not distort speed
					this.#panLeft(2 * deltaX * targetDistance / this.clientHeight, this.object.matrix);
					this.#panUp(2 * deltaY * targetDistance / this.clientHeight, this.object.matrix);

				} else if (this.object instanceof OrthographicCamera) {

					// orthographic
					this.#panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / this.clientWidth, this.object.matrix);
					this.#panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / this.clientHeight, this.object.matrix);

				} else {

					// camera neither orthographic nor perspective
					console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
					this.enablePan = false;

				}

			};

		})();


		// force an update at start
		this.update();

	}

}

export { OrbitControls };
