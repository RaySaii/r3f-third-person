import {Triplet, useRaycastClosest} from '@react-three/cannon'
import {useState, useEffect} from 'react'

const getAnimationFromUserInputs = (inputs: any) => {
  const {up, down, right, left, isMouseLooking} = inputs

  if (up && !down) {
    return 'run'
  }

  if (down && !up) {
    return 'backpedal'
  }

  if (!right && left) {
    return isMouseLooking ? 'strafeLeft' : 'turnLeft'
  }

  if (!left && right) {
    return isMouseLooking ? 'strafeRight' : 'turnRight'
  }

  return 'idle'
}

export default function useCharacterState(inputs: any, position: any, mixer: any) {
  const [characterState, setCharacterState] = useState({
    animation: 'idle',
    isJumping: false,
    inAir: false,
    isMoving: false,
    isLanding: false,
  })

  const [jumpPressed, setJumpPressed] = useState(false)
  const [landed, setLanded] = useState(true)

  const {up, down, right, left, jump, isMouseLooking} = inputs
  const {isJumping, inAir, isLanding} = characterState

  useEffect(() => {
    setJumpPressed(jump)
    setLanded(false)
  }, [jump])

  const rayFrom = [position[0], position[1], position[2]] as Triplet
  const rayTo = [position[0], position[1] - 0.05, position[2]] as Triplet
  useRaycastClosest(
    {
      from: rayFrom,
      to: rayTo,
      skipBackfaces: true,
    },
    (e) => {
      if (e.hasHit && !landed) {
        setLanded(true)
      }
    },
    [position]
  )

  useEffect(() => {
    if (inAir && landed) {
      setCharacterState((prevState) => ({
        ...prevState,
        inAir: false,
        animation: 'landing',
        isLanding: true,
      }))
    }
  }, [landed, inAir])

  useEffect(() => {
    setCharacterState((prevState) => ({
      ...prevState,
      isMoving: up || down || left || right,
    }))
  }, [up, down, left, right])

  useEffect(() => {
    if (isJumping || inAir) {
      return
    }
    const newState = {
      animation: getAnimationFromUserInputs(inputs),
      isJumping: false,
    }

    if (jump && !jumpPressed) {
      newState.animation = 'jump'
      newState.isJumping = true
    }

    // let landing animation playout if we're still landing
    if (isLanding && newState.animation === 'idle') {
      return
    }

    setCharacterState((prevState) => ({
      ...prevState,
      isLanding: false,
      ...newState,
    }))
  }, [up, down, left, right, jump, isMouseLooking, isJumping, inAir])

  useEffect(() => {
    let timer = 0 as any
    const checker = () => {
      setCharacterState((prevState) => ({
        ...prevState,
        isJumping: false,
        inAir: true,
        animation: 'inAir',
      }))
    }
    if (characterState.isJumping) {
      // play 200ms of jump animation then transition to inAir
      timer = setTimeout(checker, 200)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [characterState.isJumping])

  useEffect(() => {
    if (!mixer) {
      return
    }
    const onMixerFinish = () => {
      setCharacterState((prevState) => ({
        ...prevState,
        isJumping: false,
        inAir: false,
        isLanding: false,
        animation: 'idle',
      }))
    }

    mixer.addEventListener('finished', onMixerFinish)

    return () => {
      mixer.removeEventListener('finished', onMixerFinish)
    }
  }, [mixer])

  return characterState
}
