import {useState, useRef} from "react"
import {Triplet, useRaycastClosest} from "@react-three/cannon"
import * as  THREE from "three"

export default function useRay({
                                 rayVector = {current: new THREE.Vector3()},
                                 position = [0, 0, 0],
                                 collisionFilterMask = 1,
                               }) {
  const rayChecker = useRef(setTimeout)
  const from = [position[0], position[1], position[2]] as Triplet
  const to = [rayVector.current.x, rayVector.current.y, rayVector.current.z] as Triplet
  const [ray, setRay] = useState({})
  useRaycastClosest(
    {
      from,
      to,
      skipBackfaces: true,
      collisionFilterMask: 1,
    },
    (e) => {
      // clearTimeout(rayChecker.current);
      setRay({
        hasHit: e.hasHit,
        distance: e.distance,
      })
      // this callback only fires constantly on collision so this
      // timeout resets state once we've stopped colliding
      // rayChecker.current = setTimeout(() => {
      //   setRay({});
      // }, 100);
    },
    [from, to]
  )

  return ray
}
