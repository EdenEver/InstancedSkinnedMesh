import {
  AdaptiveDpr,
  AdaptiveEvents,
  Bvh,
  Environment,
  OrbitControls,
  PerformanceMonitor,
  Preload,
} from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Whales } from "./Whales"
import { Perf } from "r3f-perf"
import { Suspense, useState } from "react"

const amount = 4
const whaleCount = 3 * Math.pow(amount, 3)

function App() {
  return (
    <>
      <fogExp2 attach="fog" args={["lightblue", 0.015]} />

      <Whales count={whaleCount} />

      <directionalLight position={[-5, 20, -15]} intensity={1} castShadow />

      <Environment preset="sunset" environmentIntensity={0.5} />

      <OrbitControls autoRotate />

      <Perf />
    </>
  )
}

const Wrapper = () => {
  const [dpr, setDpr] = useState(1)

  return (
    <Canvas
      dpr={dpr}
      style={{
        backgroundColor: "lightblue",
      }}
      shadows
      camera={{
        position: [10, 10, 10],
      }}
    >
      <PerformanceMonitor
        factor={1}
        flipflops={3}
        onChange={({ factor }) => setDpr(Math.floor(0.5 + 1.5 * factor))}
      >
        <Suspense>
          <Bvh firstHitOnly>
            <App />
          </Bvh>

          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Preload all />
        </Suspense>
      </PerformanceMonitor>
    </Canvas>
  )
}

export default Wrapper
