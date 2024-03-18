import { BoxGeometry, Group, Mesh, MeshLambertMaterial } from "three";


const commonMeterial = new MeshLambertMaterial({ color: 0x99ff99 })
const biggeo = new BoxGeometry(10, 4, 10),
  meshBig = new Mesh(biggeo, commonMeterial)
meshBig.position.set(0, 0, -5)

const smallgeo = new BoxGeometry(5, 2, 5),
  meshSmall = new Mesh(smallgeo, commonMeterial)
meshSmall.position.set(0, -1, 2.5)
export const DirectionalModel = new Group()
DirectionalModel.add(meshBig, meshSmall)


