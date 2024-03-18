import {
    ArcCurve, BufferGeometry,
    CatmullRomCurve3, CurvePath, DoubleSide, EdgesGeometry, EllipseCurve,
    ExtrudeGeometry,
    LatheGeometry,
    Line, LineBasicMaterial,
    LineCurve,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Points, PointsMaterial,
    Shape,
    ShapeGeometry,
    SplineCurve, TubeGeometry, Vector2, Vector3
} from "three";

const ellipseCurveGeo = new EllipseCurve(0, 0, 5, 3),
    ellipseBuff = new BufferGeometry().setFromPoints(ellipseCurveGeo.getPoints(8))

export const EllipseCurvePointModel = new Points(ellipseBuff, new PointsMaterial({ color: 0xff0000 }))
export const EllipseCurveLineModel = new Line(new BufferGeometry().setFromPoints(ellipseCurveGeo.getPoints(30)), new LineBasicMaterial({ color: 0xffff00 }))

// 圆
const arcCurve = new ArcCurve(0, 0, 5),
    arcGeoBuff = new BufferGeometry().setFromPoints(arcCurve.getPoints(50))

export const arcCurveModel = new Line(arcGeoBuff, new LineBasicMaterial({ color: 0x00ffff }))

// 三维曲线
const CatmullRomCurrve3MetaArr: Vector3[] = ([
    new Vector3(0, 0, 0),
    new Vector3(2, 1, 0),
    new Vector3(0, 2, 1),
    new Vector3(-2, 1, 0),
]),
    catmullRomCurrve3 = new CatmullRomCurve3(CatmullRomCurrve3MetaArr),
    catmullrowGeo = new BufferGeometry().setFromPoints(catmullRomCurrve3.getPoints(30))

export const catmullrowLineModel = new Line(catmullrowGeo, new LineBasicMaterial({ color: 0x444444 }))

//二维曲线
const splineMetaArr: Vector2[] = [
    new Vector2(-4, 0),
    new Vector2(0, 1),
    new Vector2(4, 0),
],
    splineCurve = new SplineCurve(splineMetaArr),
    splineGeo = new BufferGeometry().setFromPoints(splineCurve.getPoints(30))
export const splineModel = new Line(splineGeo, new LineBasicMaterial({ color: 0x888888 }))

/**
 * 组合线模型
 */
const lineH = 5, arcR = 2
const curvePath = new CurvePath(),
    line1 = new LineCurve(new Vector2(lineH, lineH), new Vector2(lineH, 0)),
    line2 = new ArcCurve(lineH - arcR, 0, arcR, -Math.PI, 0),
    line3 = new LineCurve(new Vector2(lineH - 2 * arcR, 0), new Vector2(lineH - 2 * arcR, lineH)),
    linebm = new LineBasicMaterial({ color: 0x666666 })

curvePath.curves.push(line1, line2, line3)
const curvePathBuffGeo = new BufferGeometry().setFromPoints(curvePath.getPoints(50) as Vector2[])
export const curvePathModel = new Line(curvePathBuffGeo, linebm)



// 通过线段路径绘制管道
const catmullRowMetaArr2 = CatmullRomCurrve3MetaArr.map(i => i.multiplyScalar(4)),
    catmullRow2 = new CatmullRomCurve3(catmullRowMetaArr2),
    tubeGeo = new TubeGeometry(catmullRow2, 200, 1, 30),
    tubeMaterial = new MeshLambertMaterial({ color: 0x999999, side: DoubleSide })
export const TubeModel = new Mesh(tubeGeo, tubeMaterial)




// 旋转几何体
const splineMetaArr1: Vector2[] = [
    new Vector2(2, 2),
    new Vector2(1, 0),
    new Vector2(2, -2),
], splineCurve1 = new SplineCurve(splineMetaArr1)
const latheGeo = new LatheGeometry(splineCurve1.getPoints(30), 30, Math.PI / 3),
    latheGeoMaterial = new MeshLambertMaterial({ color: 0x00ffff, side: DoubleSide })
export const latheModel = new Mesh(latheGeo, latheGeoMaterial)




// 曲线旋转成型测试
const splineMetaArr2: Vector2[] = [
    // 锥高太低,且灯光太高的情况下看不到阴影
    new Vector2(0, 1),
    new Vector2(4, 0),
], splineCurve2 = new SplineCurve(splineMetaArr2),
    latheGeo1 = new LatheGeometry(splineCurve2.getPoints(2), 30)
export const latheModel1 = new Mesh(latheGeo1, new MeshLambertMaterial({ color: 0x00ffff, side: DoubleSide }))



// 闭合线段路径填充内部成型
const LoopLineMetaArr = [
    new Vector2(0, 0),
    new Vector2(1, 0),
    new Vector2(1, 1),
    new Vector2(0, 1),
], shap = new Shape(LoopLineMetaArr),
    shapGeo = new ShapeGeometry(shap),
    material = new MeshLambertMaterial({ color: 0x88ffff, wireframe: true })

export const ShapModel = new Mesh(shapGeo, material)

// 根据面拉伸成型
const ExtrudeGeo = new ExtrudeGeometry(shap, {
    depth: 10,
    // bevelThickness: 1, // 拉伸方向圆角个数
    bevelSize: 2, // 面的圆角个数
    bevelSegments: 6
})
export const ExtrudeModel = new Mesh(ExtrudeGeo, new MeshLambertMaterial({ color: 0x00ffff }))



// 根据面跟据线段路径移动成型模型 
const ExtrudeGeo1 = new ExtrudeGeometry(shap, {
    extrudePath: catmullRow2,
    steps: 30
}), nm = material.clone();
nm.wireframe = false
export const ExtrudeModel1 = new Mesh(ExtrudeGeo1, nm)


// 模型边线模型
const edgeGeo = new EdgesGeometry(ExtrudeGeo),
    edgematerial = new MeshBasicMaterial({ color: 0xff00ff })
export const LineSegmentsModel = new LineSegments(edgeGeo, edgematerial)