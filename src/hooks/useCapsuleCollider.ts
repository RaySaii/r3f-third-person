import {useCompoundBody} from '@react-three/cannon'
import * as THREE from 'three'
import {useFrame, useThree} from "@react-three/fiber"
import {useEffect, useMemo, useState, useRef} from "react"

export default function useCapsuleCollider({height = 1.7}) {
  const {scene} = useThree()
  const radius = height / 4
  const [, collider] = useCompoundBody(() => ({
    mass: 1,
    fixedRotation: true,
    linearDamping: 0.8,
    angularDamping: 0.5,
    material: {
      friction: 0,
      name: 'no-fric-zone',
    },
    shapes: [
      {type: 'Sphere', position: [0, radius, 0], args: [radius]},
      {type: 'Sphere', position: [0, (height + radius) / 2, 0], args: [radius]},
      {
        type: 'Sphere',
        position: [0, height, 0],
        args: [radius],
      },
    ],
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
    collisionFilterGroup: 1,
  }))

  return collider
}
