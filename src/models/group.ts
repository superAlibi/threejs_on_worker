import {
    CapsuleGeometry, CircleGeometry,
    DoubleSide, Group,
    Mesh, MeshLambertMaterial,
    Vector3
} from 'three'

const group = new Group();
group.name = "分组测试"
const material = new MeshLambertMaterial({ color: 0x00ffff, wireframe: true })
const circle = new CircleGeometry(1),
    circleMaterial = material.clone(),
    circleMesh = new Mesh(circle, circleMaterial);
circleMaterial.side = DoubleSide
circleMesh.position.add(new Vector3(1, 0, 0))
circleMesh.name = "圆饼"
const capsuleModel = new Mesh(new CapsuleGeometry(1, 2, 4, 20), material)
capsuleModel.name = "胶囊"
capsuleModel.position.sub(new Vector3(1, 0, 0))
group.add(capsuleModel, circleMesh)
group.rotateZ(Math.PI / 6)
const worldPostion = new Vector3()
circleMesh.getWorldPosition(worldPostion)

export { group as GroupModel }