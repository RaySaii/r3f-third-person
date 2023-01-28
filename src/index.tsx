import {Suspense, useEffect, useMemo, useRef, useState} from 'react'
import * as THREE from 'three'
import {useFrame, useThree} from '@react-three/fiber'
import {
  useThirdPersonAnimations,
  useThirdPersonCameraControls,
  useInputEventManager,
  useKeyboardMouseMovement,
  useCharacterState,
  useCapsuleCollider,
  useRay,
} from './hooks'
import getInputMovementRotation from "./utils/getInputMovementRotation"
import {Triplet, useRaycastClosest} from "@react-three/cannon"
import {Object3D, PerspectiveCamera} from "three"

type CharacterProps = {
  velocity?: number
}

const ThirdPersonCharacterControls = ({
                                        cameraOptions = {} as any,
                                        characterObj = new Object3D(),
                                        characterProps = {} as CharacterProps,
                                        animationPaths = {},
                                        onLoad = () => {
                                        },
                                      }) => {
  const {
    camera,
    scene,
    gl: {domElement},
  } = useThree()
  const {} = useThree()
  // set up refs that influence character and camera position
  const height = 1.38
  const collider = useCapsuleCollider({height})
  const [position, setPosition] = useState([0, 0, 0])
  const modelRef = useRef(new THREE.Group())
  const cameraContainer = useRef(new THREE.Object3D())
  const rayVector = useRef(new THREE.Vector3())
  const ray = useRay({position, rayVector, ...cameraOptions})
  const [hitNormal, setHitNormal] = useState(new THREE.Vector3(0, 1, 0))
  const [hitPoint, setHitPoint] = useState()
  const rayhitGround = useRef<any>({})
  const castOffset = 0.03
  const timer = useRef(0 as any)
  const feetRay = useRef(false)

  let to = [position[0], position[1] - castOffset, position[2]] as Triplet
  let from = [position[0], position[1] + height / 2, position[2]] as Triplet

  useRaycastClosest(({
    from,
    to,
    skipBackfaces: true,
    collisionFilterMask: 2
  }), (e) => {
    clearTimeout(timer.current)
    console.log('hit')
    // setHitNormal(new THREE.Vector3(...e.hitNormalWorld))
    // setHitPoint(new THREE.Vector3(...e.hitPointWorld))
    rayhitGround.current = e
    timer.current = setTimeout(() => {
      rayhitGround.current = {}
      console.log('unhit')
    }, 100)
  }, [position])

  // get character state based on user inputs + collider position + animations
  const inputManager = useInputEventManager(domElement)
  const inputs: any = useKeyboardMouseMovement(inputManager)
  const controls = useThirdPersonCameraControls({
    camera: camera as PerspectiveCamera,
    domElement,
    target: modelRef.current,
    inputManager,
    cameraOptions,
    cameraContainer,
  })
  const {actions = {} as any, mixer} = useThirdPersonAnimations(
    characterObj,
    animationPaths,
    onLoad
  )
  const {animation, isMoving} = useCharacterState(inputs, position, mixer)

  // subscribe to collider velocity/position changes
  const charVelocity = characterProps.velocity ?? 4
  const velocity = useRef([0, 0, 0])


  useEffect(() => {
    collider.velocity.subscribe((v) => {
      velocity.current = v
    })

    collider.position.subscribe((p) => {
      // position is set on collider so we copy it to model
      modelRef.current.position.set(p[0], p[1]+0.03, p[2])
      // setState with position to  useCharacterState
      setPosition(p)
    })
  }, [])


  useFrame((state, delta) => {
    let newRotation = new THREE.Euler()
    let xVelocity = 0
    let zVelocity = 0
    const {quaternion} = modelRef.current

    if (isMoving) {
      const {model, movement} = getInputMovementRotation(inputs)

      // first rotate the model group
      modelRef.current.rotateY(model.direction * -0.05)
      newRotation = characterObj.rotation.clone()
      newRotation.y = model.rotation

      const mtx = new THREE.Matrix4().makeRotationFromQuaternion(quaternion)
      movement.applyMatrix4(mtx)

      // then apply velocity to collider influenced by model groups rotation
      const baseVelocity = inputs.down ? charVelocity / 2 : charVelocity
      xVelocity = movement.x * baseVelocity
      zVelocity = movement.z * baseVelocity
    }
    let newVelocity = new THREE.Vector3(xVelocity, velocity.current[1], zVelocity)
    if (rayhitGround.current.hasHit) {
      newVelocity.y = 0
      const groundNormal = hitNormal
      const q = new THREE.Quaternion().setFromUnitVectors(groundNormal, new THREE.Vector3(0, 1, 0))
      newVelocity.applyQuaternion(q)

      if (animation === 'jump') {
        newVelocity.y = 5.5
        collider.position.set(position[0], rayhitGround.current.hitPointWorld[1] + castOffset * 2, position[2])
      } else {
        collider.position.set(position[0], rayhitGround.current.hitPointWorld[1] + newVelocity.y / 60, position[2])
      }
      collider.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z)
    }


    // rotate character model inside model group
    const newQuat = new THREE.Quaternion().setFromEuler(newRotation)
    characterObj.quaternion.slerp(newQuat, 0.1)

    // quaternion is set on model group so we copy it to collider
    collider.quaternion.copy(quaternion)
    // check camera raycast collision and pass that to controls to
    cameraContainer.current.getWorldPosition(rayVector.current)
    controls?.update(ray)
  }, -1)

  // Transition to new animation when loaded
  useEffect(() => {
    actions?.[animation]?.reset().fadeIn(0.2).play()
    return () => {
      actions?.[animation]?.fadeOut(0.2)
    }
  }, [animation, actions])

  let _from = new THREE.Vector3(...from)
  const rayd = new THREE.Vector3(...to).sub(_from)

  return (
    <>
      <group ref={modelRef} rotation={[0, Math.PI, 0]} {...characterProps}>
        <Suspense fallback={null}>
          {/*<mesh position={[0, 0, 0]}>*/}
          {/*  <boxBufferGeometry args={[0.4, 0.4, 0.4]}/>*/}
          {/*  <meshBasicMaterial color="red"/>*/}
          {/*</mesh>*/}
          <primitive object={characterObj} dispose={null}/>
        </Suspense>
      </group>
      {/*<arrowHelper args={[hitNormal, hitPoint, 3, 0xff0000]}/>*/}
      {/*<arrowHelper args={[rayd.normalize(), _from, rayd.length(), 'yellow']}/>*/}
    </>
  )
}

export default ThirdPersonCharacterControls
