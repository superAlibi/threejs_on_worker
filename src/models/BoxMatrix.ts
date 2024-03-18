import { BoxGeometry, Group, Mesh, MeshLambertMaterial } from "three";

const group = new Group(), size = 10, boxSize = 2
for (let index = 0; index < size; index++) {
    for (let ii = 0; ii < size; ii++) {
        const mesh = new Mesh(new BoxGeometry(boxSize, boxSize, boxSize), new MeshLambertMaterial({ color: 0x00ffff }))
        mesh.name = `box${index}-${ii}`
        const xbase = (index - (size / 2)) * boxSize * 2, ybase = 0, zbase = (ii - (size / 2)) * boxSize * 2
        mesh.position.set(xbase, ybase, zbase)
        group.add(mesh)
    }

}
export { group as BoxMatrix }