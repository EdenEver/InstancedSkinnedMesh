import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Whales } from "./Whales"

const amount = 4
const whaleCount = 3 * Math.pow(amount, 3)

function App() {
  return (
    <>
      <fogExp2 attach="fog" args={["lightblue", 0.015]} />

      <Whales count={whaleCount} />

      <directionalLight position={[-5, 20, -15]} intensity={1} castShadow />

      <Environment preset="sunset" environmentIntensity={0.5} />

      <OrbitControls />
    </>
  )
}

const Wrapper = () => {
  return (
    <Canvas
      style={{
        backgroundColor: "lightblue",
      }}
      shadows
      camera={{
        position: [10, 10, 10],
      }}
    >
      <App />
    </Canvas>
  )
}

export default Wrapper
