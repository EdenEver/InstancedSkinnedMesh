import { useAnimations, useGLTF } from "@react-three/drei"
import { GroupProps, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Group, Mesh, SkinnedMesh, Vector4 } from "three"
import { InstancedSkinnedMesh } from "./InstancedSkinnedMesh.js"

type Props = {
  count?: number
}

type WhalesProps = GroupProps & Props

// do: make local
const amount = 4
const duration = 3.25
const variance: Vector4[] = []

const dummies: SkinnedMesh[] = []
const meshes: InstancedSkinnedMesh[] = []

export const Whales = ({ count = 1, ...props }: WhalesProps) => {
  const hasMounted = useRef(false)

  const group = useRef<Group>(null)

  const { scene, nodes, animations } = useGLTF("/knight.glb")

  const { actions } = useAnimations(animations, scene)

  useEffect(() => {
    if (hasMounted.current) return
    hasMounted.current = true

    if (!scene || !nodes) return

    const bodyParts = [
      "Knight_Head",
      "Knight_Body",
      "Knight_ArmLeft",
      "Knight_ArmRight",
      "Knight_LegLeft",
      "Knight_LegRight",
    ]

    for (const part of bodyParts) {
      const m: SkinnedMesh = nodes[part] as SkinnedMesh

      if (!m) return

      dummies.push(m)

      const mesh = new InstancedSkinnedMesh(m.geometry, m.material, count)

      mesh.copy(m)
      mesh.bind(m.skeleton, m.bindMatrix)

      m.visible = false

      mesh.frustumCulled = false

      actions["1H_Melee_Attack_Chop"]?.reset().fadeIn(0.25).play()

      for (let i = 0; i < count; i++) {
        const v = new Vector4(
          Math.random(),
          Math.random() * 2 - 1,
          3 * Math.random(),
          duration * Math.random()
        )

        variance.push(v)
      }

      if (part === "Knight_Head") {
        const helmet = new Mesh(nodes.Knight_Helmet.geometry, nodes.Knight_Helmet.material)

        helmet.frustumCulled = false

        mesh.add(helmet)
      }

      if (part === "Knight_HandRight") {
        const sword = new Mesh(nodes["1H_Sword"].geometry, nodes["1H_Sword"].material)

        sword.frustumCulled = false

        mesh.add(sword)
      }

      group.current?.add(mesh)

      meshes.push(mesh)
    }
  }, [actions, animations, count, nodes, scene])

  useFrame(() => {
    if (!meshes.length || !dummies.length) return

    let i = 0

    const offset = (amount - 1) / 2

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < 3 * amount; z++) {
          const v = variance[i++]

          for (const dummy of dummies) {
            dummy.position.set(offset - 2 * x + v.x, offset - y + v.y, offset - 4 * z + v.z)

            dummy.updateMatrix()

            dummy.skeleton.bones.forEach((b) => {
              b.updateMatrixWorld()
            })

            for (const mesh of meshes) {
              mesh.setMatrixAt(i, dummy.matrix)
              mesh.setBonesAt(i, dummy.skeleton)
            }
          }
        }
      }
    }

    for (const mesh of meshes) {
      mesh.instanceMatrix.needsUpdate = true

      if (mesh.skeleton && mesh.skeleton.boneTexture) {
        mesh.skeleton.boneTexture.needsUpdate = true
      }
    }
  })

  return (
    <group {...props}>
      <group ref={group} castShadow receiveShadow />
    </group>
  )
}
