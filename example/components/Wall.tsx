import {useBox} from "@react-three/cannon"

export default function Wall({args, ...props}: any) {
  useBox(() => ({
    type: "Static",
    args,
    mass: 0,
    material: {
      friction: 0.3,
      name: "wall",
    },
    collisionFilterGroup: 2,
    ...props,
  }))
  return (
    <mesh receiveShadow {...props}>
      <boxGeometry args={args}/>
      <meshPhongMaterial color="white" opacity={0.8} transparent/>
    </mesh>
  )
}
