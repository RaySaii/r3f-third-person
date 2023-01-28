import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {useEffect, useState, useRef, useMemo} from 'react'
import * as THREE from 'three'
import {AnimationClip, AnimationMixer, Object3D} from 'three'
import {useFrame} from '@react-three/fiber'

const FBX_LOADER = new FBXLoader()
const GLTF_LOADER = new GLTFLoader()

const keys = [
  'idle',
  'walk',
  'run',
  'jump',
  'landing',
  'inAir',
  'backpedal',
  'turnLeft',
  'turnRight',
  'strafeLeft',
  'strafeRight',
]
type Callback = (value: string, index: number, array: string[]) => void;
type AnimationPaths = {
  [key in typeof keys[number]]: string
}

async function asyncForEach(array: string[], callback: Callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function loadModelSync(url: string, loader: any) {
  return new Promise((resolve, reject) => {
    loader.load(url, (data: any) => resolve(data), null, reject)
  })
}

function useThirdPersonAnimations(
  characterObj = new Object3D(),
  animationPaths = {} as AnimationPaths,
  onLoad = () => {
  }
) {
  const ref = useRef<any>({})
  const [clips, setClips] = useState<AnimationClip[]>([])
  const [actualRef, setRef] = useState(ref)
  const [mixer, setMixer] = useState(new AnimationMixer(new THREE.Object3D()))
  const lazyActions = useRef<any>({})
  const [animations, setAnimations] = useState({} as { [key in typeof keys[number]]: any })

  // set character obj + mixer for character
  useEffect(() => {
    if (characterObj) {
      setRef({current: characterObj})
      setMixer(new AnimationMixer(new THREE.Object3D()))
    }
  }, [characterObj.name])

  // load animations async initially
  useEffect(() => {
    const loadAnimations = async () => {
      const newAnimations = {} as { [key in typeof keys[number]]: any }

      await asyncForEach(keys, async (key) => {
        const fileExt = animationPaths[key].split('.').pop()
        const loader = fileExt === 'fbx' ? FBX_LOADER : GLTF_LOADER
        const model = await loadModelSync(animationPaths[key], loader)
        newAnimations[key] = model
      })
      setAnimations(newAnimations)
      onLoad()
    }

    loadAnimations()
  }, [])

  // set clips once animations are loaded
  useEffect(() => {
    const clipsToSet = [] as AnimationClip[]

    Object.keys(animations).forEach((name) => {
      if (animations[name]?.animations?.length) {
        animations[name].animations[0].name = name
        clipsToSet.push(animations[name].animations[0])
      }
    })

    if (clips.length < clipsToSet.length) {
      setClips(clipsToSet)
    }
  }, [animations])

  const api = useMemo(() => {
    if (!mixer || !clips.length) {
      return {
        actions: {},
      }
    }
    const actions = {}
    clips.forEach((clip) =>
      Object.defineProperty(actions, clip.name, {
        enumerable: true,
        get() {
          if (actualRef.current) {
            lazyActions.current[clip.name] = mixer.clipAction(
              clip,
              actualRef.current
            )

            const clampers = ['jump', 'landing']
            if (clampers.includes(clip.name)) {
              lazyActions.current[clip.name].setLoop(2200) // 2200 = THREE.LoopOnce
              lazyActions.current[clip.name].clampWhenFinished = true
            }

            return lazyActions.current[clip.name]
          }

          return null
        },
      })
    )
    return {
      ref: actualRef,
      clips,
      actions,
      names: clips.map((c) => c.name),
      mixer,
    }
  }, [clips, characterObj.name, mixer])

  useEffect(() => {
    const currentRoot = actualRef.current
    return () => {
      // Clean up only when clips change, wipe out lazy actions and uncache clips
      lazyActions.current = {}
      Object.values(api.actions).forEach((action: any) => {
        if (currentRoot) {
          mixer.uncacheAction(action, currentRoot)
        }
      })
    }
  }, [clips])

  useFrame((_, delta) => {
    mixer.update(delta)
  })

  return api
}

export default useThirdPersonAnimations
