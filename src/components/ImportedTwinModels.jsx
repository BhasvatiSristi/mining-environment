import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { getRuntimeModelScale } from '../data/runtimeScalePolicy'
import { getLocalTransform } from '../utils/runtimeHierarchyUtils'
import { getAngularVelocity, getDirectionSign, getRotationAxis } from '../utils/runtimeMotionUtils'

function getTransform(model) {
  return {
    position: model.transform?.position ?? [0, 0, 0],
    rotation: model.transform?.rotation ?? [0, 0, 0, 1],
    scale: model.transform?.scale ?? [1, 1, 1],
  }
}

function loadModel(loader, model, blob, objectUrls) {
  const objectUrl = URL.createObjectURL(blob)
  objectUrls.push(objectUrl)

  return new Promise((resolve, reject) => {
    loader.load(objectUrl, (gltf) => resolve({ model, scene: gltf.scene }), undefined, reject)
  })
}

function ImportedTwinModel({ model, scene, entity, parentEntity, children, selected, onSelect, runtimeDisplayScale, runtimePositionOffset }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef(null)

  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  const handlePointerOver = (event) => {
    event.stopPropagation()
    setHovered(true)
  }

  const handlePointerOut = (event) => {
    event.stopPropagation()
    setHovered(false)
  }

  const handleClick = (event) => {
    event.stopPropagation()
    onSelect(entity)
  }

  const transform = getTransform(model)
  const localTransform = getLocalTransform(entity, parentEntity)
  const emphasis = selected ? 1.06 : hovered ? 1.03 : 1
  const visualScale = getRuntimeModelScale(transform.scale).map((value) => value * emphasis)
  const motion = entity?.motion
  const rotationAxis = getRotationAxis(motion?.axis)
  const angularVelocity = getAngularVelocity(motion) * getDirectionSign(motion?.direction)
  const position = localTransform.position ?? transform.position
  const rootPosition = parentEntity
    ? position
    : position.map((value, index) => value + (runtimePositionOffset[index] ?? 0))

  useFrame((_, delta) => {
    if (motion?.type !== 'rotation' || !groupRef.current || !rotationAxis) return
    groupRef.current.rotateOnAxis(rotationAxis, angularVelocity * delta)
  })

  return (
    <group
      ref={groupRef}
      position={rootPosition}
      quaternion={localTransform.rotation ?? transform.rotation}
      scale={parentEntity ? 1 : runtimeDisplayScale}
      visible={entity?.visibility ?? model.visibility !== false}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <group scale={visualScale}>
        <primitive object={scene} />
      </group>
      {children}
    </group>
  )
}

export default function ImportedTwinModels({ importedTwin, runtimeEntities, selectedEntity, onEntitySelect, onStatus, runtimeDisplayScaleByModelId, runtimePositionOffsetByModelId }) {
  const [loadedState, setLoadedState] = useState({ twin: null, models: [] })

  useEffect(() => {
    let disposed = false
    const objectUrls = []

    if (!importedTwin) {
      onStatus(null)
      return () => {}
    }

    const models = importedTwin.manifest.models
    const loader = new GLTFLoader()
    onStatus({ state: 'loading', loaded: 0, total: models.length, errors: 0 })

    async function loadModels() {
      const results = await Promise.all(models.map(async (model) => {
        const blob = importedTwin.assets[model.asset.path]

        if (!blob) {
          console.error(`Imported model asset is missing: ${model.asset.path}`)
          return { error: true }
        }

        try {
          const result = await loadModel(loader, model, blob, objectUrls)
          return result
        } catch (error) {
          console.error(`Failed to load imported model "${model.id}"`, error)
          return { error: true }
        }
      }))

      if (disposed) return

      const successfulModels = results.filter((result) => !result.error)
      const errorCount = results.length - successfulModels.length
      setLoadedState({ twin: importedTwin, models: successfulModels })
      onStatus({ state: 'loaded', loaded: successfulModels.length, total: models.length, errors: errorCount })
    }

    loadModels()

    return () => {
      disposed = true
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
    }
  }, [importedTwin, onStatus])

  return (
    <>
      {loadedState.twin === importedTwin && (() => {
        const loadedModelsById = new Map(loadedState.models.map(({ model, scene }) => [model.id, { model, scene }]))
        const importedEntitiesById = new Map(
          runtimeEntities
            .filter((entity) => entity.source === 'twinforge')
            .map((entity) => [entity.id, entity]),
        )

        const renderedModelIds = new Set()

        function renderModel(modelId, parentEntity = null, visiting = new Set(), rootModelId = modelId) {
          if (visiting.has(modelId) || renderedModelIds.has(modelId)) return null

          const loadedModel = loadedModelsById.get(modelId)
          const entity = importedEntitiesById.get(modelId)
          if (!loadedModel || !entity) return null

          renderedModelIds.add(modelId)
          const nextVisiting = new Set(visiting).add(modelId)
          const children = entity.childIds.map((childId) => renderModel(childId, entity, nextVisiting, rootModelId))

          return (
            <ImportedTwinModel
              key={modelId}
              model={loadedModel.model}
              scene={loadedModel.scene}
              entity={entity}
              parentEntity={parentEntity}
              selected={selectedEntity?.id === entity.id}
              onSelect={onEntitySelect}
              runtimeDisplayScale={runtimeDisplayScaleByModelId[rootModelId] ?? 1}
              runtimePositionOffset={runtimePositionOffsetByModelId[rootModelId] ?? [0, 0, 0]}
            >
              {children}
            </ImportedTwinModel>
          )
        }

        return importedEntitiesById.size > 0
          ? [...importedEntitiesById.values()]
            .filter((entity) => entity.parentId === null || !importedEntitiesById.has(entity.parentId))
            .map((entity) => renderModel(entity.id))
          : null
      })()}
    </>
  )
}
