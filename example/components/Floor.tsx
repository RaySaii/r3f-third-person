import {useBox} from "@react-three/cannon"
import React from "react"
import {useFrame} from "@react-three/fiber"


export default function Floor() {
  useBox(() => ({
    type: "Static",
    args: [25, 0.2, 25],
    mass: 0,
    material: {
      friction: 0,
      name: "floor"
    },
    collisionFilterGroup: 2
  }))
  return (
    <group>
      <mesh name={'floor'}>
        <boxGeometry args={[25, 0.3, 25]} name="floor-box"/>
        <meshPhongMaterial color="green"/>
      </mesh>
      {/*<gridHelper args={[25, 25]}/>*/}
    </group>
  )
}
