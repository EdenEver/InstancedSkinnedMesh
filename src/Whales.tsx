import { useGLTF } from "@react-three/drei"
import { GroupProps, useFrame } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import { Group, AnimationMixer, Color, SkinnedMesh, Vector4 } from "three"
import { InstancedSkinnedMesh } from "./InstancedSkinnedMesh.js"

type Props = {
  count?: number
}

type WhalesProps = GroupProps & Props

// do: make local
const amount = 4
const duration = 3.25
const variance: Vector4[] = []
let mixer: AnimationMixer | null = null // do: useAnimations(animations, ...)

let dummy: SkinnedMesh | null = null
let mesh: InstancedSkinnedMesh | null = null

export const Whales = ({ count = 1, ...props }: WhalesProps) => {
  const group = useRef<Group>(null)

  const { scene, animations } = useGLTF("/whale.gltf")

  // do: useAnimations(animations, ...)

  useEffect(() => {
    if (!scene) return

    const m: SkinnedMesh = scene.getObjectByName("poly_whale") as SkinnedMesh

    if (!m) return

    dummy = m

    mesh = new InstancedSkinnedMesh(m.geometry, m.material, count)

    mesh.copy(m)
    mesh.bind(m.skeleton, m.bindMatrix)

    m.visible = false

    mesh.frustumCulled = false

    mixer = new AnimationMixer(scene)

    // mixer.clipAction(scene.animations[0], mesh).play()
    mixer.clipAction(animations[0]).play()

    for (let i = 0; i < count; i++) {
      const v = new Vector4(Math.random(), Math.random() * 2 - 1, 3 * Math.random(), duration * Math.random())

      variance.push(v)

      mesh.setColorAt(i, new Color(`hsl(${Math.random() * 360}, 100%, 50%)`))
    }

    group.current?.add(mesh)
  }, [animations, count, scene])

  useFrame(({ clock }) => {
    if (!mesh || !dummy || !mixer) return

    let i = 0

    const offset = (amount - 1) / 2

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < 3 * amount; z++) {
          const v = variance[i++]

          const t = (v.w + clock.elapsedTime) % duration

          const pt = Math.abs(0.5 - t / duration)

          dummy.position.set(
            offset - 2 * x + v.x,
            offset - y + v.y,
            offset - 4 * z + v.z - clock.elapsedTime + Math.pow(pt, 4)
          )

          dummy.position.multiplyScalar(5)

          dummy.position.z = 50 + (dummy.position.z % 120)

          dummy.updateMatrix()

          mixer.setTime(t)

          dummy.skeleton.bones.forEach((b) => {
            b.updateMatrixWorld()
          })

          mesh.setMatrixAt(i, dummy.matrix)

          mesh.setBonesAt(i, dummy.skeleton)
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true

    if (mesh.skeleton && mesh.skeleton.boneTexture) {
      mesh.skeleton.boneTexture.needsUpdate = true
    }
  })

  return (
    <group {...props}>
      <group ref={group} />
    </group>
  )
}
