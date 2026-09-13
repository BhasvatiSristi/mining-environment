import { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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

function ImportedTwinModel({ model, scene, entity, selected, onSelect }) {
  const [hovered, setHovered] = useState(false)

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
  const emphasis = selected ? 1.06 : hovered ? 1.03 : 1
  const visualScale = transform.scale.map((value) => value * emphasis)

  return (
    <group
      position={entity?.finalPosition ?? entity?.position ?? transform.position}
      quaternion={entity?.rotation ?? transform.rotation}
      scale={visualScale}
      visible={entity?.visibility ?? model.visibility !== false}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={scene} />
    </group>
  )
}

export default function ImportedTwinModels({ importedTwin, runtimeEntities, selectedEntity, onEntitySelect, onStatus }) {
  const [loadedState, setLoadedState] = useState({ twin: null, models: [] })

  useEffect(() => {
    let disposed = false
    const objectUrls = []

    if (!importedTwin) {
      onStatus(null)
      return () => {}
    }

    const models = importedTwin.manifest.models
    const importedEntitiesById = new Map(
      runtimeEntities
        .filter((entity) => entity.source === 'twinforge')
        .map((entity) => [entity.id, entity]),
    )
    const loader = new GLTFLoader()
    onStatus({ state: 'loading', loaded: 0, total: models.length, errors: 0 })

    async function loadModels() {
      const results = await Promise.all(models.map(async (model) => {
        if (!importedEntitiesById.has(model.id)) {
          console.error(`No imported runtime entity found for model: ${model.id}`)
          return { error: true }
        }

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
  }, [importedTwin, onStatus, runtimeEntities])

  return (
    <>
      {(loadedState.twin === importedTwin ? loadedState.models : []).map(({ model, scene }) => {
        const entity = runtimeEntities.find((candidate) => candidate.id === model.id && candidate.source === 'twinforge')
        if (!entity) return null
        return (
          <ImportedTwinModel
            key={model.id}
            model={model}
            scene={scene}
            entity={entity}
            selected={selectedEntity?.id === entity.id}
            onSelect={onEntitySelect}
          />
        )
      })}
    </>
  )
}
