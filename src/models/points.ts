import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Points, PointsMaterial } from "three";

const vertices = new Uint8Array([
    0, 0, 0,
    5, 0, 0,
    0, 10, 0,
    0, 0, 1,
    0, 0, 10,
    5, 0, 1
]),
    attribu = new BufferAttribute(vertices, 3), bufferGeometry = new BufferGeometry();
bufferGeometry.setAttribute('position', attribu)
const pointMaterial = new PointsMaterial({ color: 0xff0000, size: 1 }),
    lineMaterial = new LineBasicMaterial({ color: 0xffff00 }),
    LineModel = new Line(bufferGeometry.clone(), lineMaterial),
    PointModel = new Points(bufferGeometry, pointMaterial);
export { PointModel, LineModel }