import {
    BufferAttribute, BufferGeometry, DoubleSide,
    Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry
} from "three";




const arr = new Uint8Array([
    // 第一个三角
    0, 0, 0,
    5, 0, 0,
    5, 8, 0,
    // 第二个三角
    0, 0, 0,
    5, 8, 0,
    0, 8, 0

]), attribute = new BufferAttribute(arr, 3),
    bufferGeometry = new BufferGeometry(),
    material = new MeshBasicMaterial({ color: 0xffff00, side: DoubleSide })
bufferGeometry.setAttribute('position', attribute)


export const PlaneModel = new Mesh(bufferGeometry, material)



const metaArr = new Uint8Array([
    0, 0, 0,
    5, 0, 0,
    5, 8, 0,
    0, 8, 0
]), ma = new BufferAttribute(metaArr, 3),
    bgeo = new BufferGeometry(),
    index = new Uint8Array([0, 1, 2, 0, 2, 3]),
    indexAtrribute = new BufferAttribute(index, 1),
    mm = new MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide })
bgeo.setAttribute('position', ma)
bgeo.setIndex(indexAtrribute)

export const IndexedPlaneModel = new Mesh(bgeo, mm)


const LamberMaterial = new MeshLambertMaterial({
    color: 0xff0000,
    side: DoubleSide,

}),
    indexedLabmberGeo = bgeo.clone(),
    indexedLabmberGeoNormal = new Uint8Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
    ])
// 不设置法向量就无法使用光照特性
indexedLabmberGeo.setAttribute('normal', new BufferAttribute(indexedLabmberGeoNormal, 3))
export const IndexedLabmberPlaneModel = new Mesh(indexedLabmberGeo, LamberMaterial)

const PlaneGeo = new PlaneGeometry(5, 6,)

const PlaneModelByThree = new Mesh(PlaneGeo, LamberMaterial.clone())
PlaneModelByThree.material.color.set(0x00ffff)
// PlaneGeo.rotateX(-Math.PI / 4)
PlaneGeo.scale(1.5, 1, 1)
PlaneGeo.rotateZ(Math.PI / 4)
export { PlaneModelByThree }