import {Canvas} from "@react-three/fiber"
import {Debug, Physics} from "@react-three/cannon"
import {Suspense} from "react"
import Wall from "@/components/Wall"
import Floor from "@/components/Floor"
import {Stats} from "@react-three/drei"
import Lighting from "@/components/Lighting"
import ThirdPerson from "@/components/ThirdPerson"

export default function HomePage() {
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Canvas
        flat
        camera={{
          fov: 75,
          near: 0.1,
          far: 3800,
          position: [0, 11, 11],
        }}
      >
        <Physics gravity={[0, -9.81, 0]}>
          <Debug color="lime">
            <Suspense fallback={null}>
              <ThirdPerson/>
            </Suspense>

            <Wall args={[25, 3, 0.2]} position={[0, 1.4, -12.6]}/>
            <Wall args={[25, 3, 0.2]} position={[0, 1.4, 12.6]}/>

            <Wall args={[25, 10, 0.2]} rotation={[-Math.PI / 3, 0, 0]} position={[0, 1.4, -5.6]}/>
            <Wall

              args={[25, 3, 0.2]}
              rotation={[0, -Math.PI / 2, 0]}
              position={[12.6, 1.4, 0]}
            />
            <Wall
              args={[25, 3, 0.2]}
              rotation={[0, -Math.PI / 2, 0]}
              position={[-12.6, 1.4, 0]}
            />
          </Debug>
          <Floor/>
        </Physics>
        <Lighting/>
        <Stats/>
      </Canvas>
    </div>
  )
}
