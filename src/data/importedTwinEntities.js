import { ENTITY_TYPES, SUPPORTED_ENTITY_TYPES } from './entityTypes'

const DEFAULT_STATUS = 'idle'
const TWINFORGE_SOURCE = 'twinforge'

function getEntityType(modelType) {
  return SUPPORTED_ENTITY_TYPES.includes(modelType) ? modelType : null
}

function addVectors(first, second) {
  return first.map((value, index) => value + (second[index] ?? 0))
}

function getTransform(model, runtimePlacement) {
  const authoredPosition = model.transform?.position ?? [0, 0, 0]
  const runtimePositionOffset = runtimePlacement?.positionOffset ?? [0, 0, 0]
  const authoredRotation = model.transform?.rotation ?? [0, 0, 0, 1]
  const authoredScale = model.transform?.scale ?? [1, 1, 1]

  return {
    authoredPosition,
    runtimePositionOffset,
    position: addVectors(authoredPosition, runtimePositionOffset),
    authoredRotation,
    authoredScale,
  }
}

function deriveHierarchy(models) {
  const modelIds = new Set(models.map((model) => model.id))
  const parentById = new Map()
  const childrenById = new Map()

  for (const model of models) {
    const hierarchy = model.hierarchy ?? {}
    const parentId = hierarchy.parentId ?? null
    const childIds = Array.isArray(hierarchy.childIds) ? hierarchy.childIds : []
    parentById.set(model.id, parentId)
    childrenById.set(model.id, childIds)

    if (parentId !== null && !modelIds.has(parentId)) {
      console.warn(`Imported model "${model.id}" references missing parent: ${parentId}`)
    }

    for (const childId of childIds) {
      if (!modelIds.has(childId)) {
        console.warn(`Imported model "${model.id}" references missing child: ${childId}`)
      }
    }
  }

  function visit(modelId, visiting, visited) {
    if (visiting.has(modelId)) return true
    if (visited.has(modelId)) return false

    visiting.add(modelId)
    for (const childId of childrenById.get(modelId) ?? []) {
      if (modelIds.has(childId) && visit(childId, visiting, visited)) return true
    }
    visiting.delete(modelId)
    visited.add(modelId)
    return false
  }

  const visited = new Set()
  for (const model of models) {
    if (visit(model.id, new Set(), visited)) {
      console.warn(`Circular hierarchy detected near imported model: ${model.id}`)
    }
  }

  return { parentById, childrenById }
}

export function deriveImportedTwinEntities(manifest, staticEntities = [], runtimePlacementByModelId = {}) {
  if (!manifest?.models) return []

  const hierarchy = deriveHierarchy(manifest.models)
  const staticIds = new Set(staticEntities.map((entity) => entity.id))
  const importedIds = new Set()
  const importedEntities = []

  for (const model of manifest.models) {
    if (staticIds.has(model.id)) {
      console.warn(`Skipping imported entity with existing static ID: ${model.id}`)
      continue
    }

    if (importedIds.has(model.id)) {
      console.warn(`Skipping duplicate imported entity ID: ${model.id}`)
      continue
    }

    const transform = getTransform(model, runtimePlacementByModelId[model.id])
    importedIds.add(model.id)
    importedEntities.push({
      id: model.id,
      name: model.name,
      type: getEntityType(model.type),
      position: transform.position,
      authoredPosition: transform.authoredPosition,
      runtimePositionOffset: transform.runtimePositionOffset,
      finalPosition: transform.position,
      rotation: transform.authoredRotation,
      authoredRotation: transform.authoredRotation,
      authoredScale: transform.authoredScale,
      status: model.status ?? DEFAULT_STATUS,
      source: TWINFORGE_SOURCE,
      sourceType: model.asset?.sourceType,
      assetPath: model.asset?.path,
      visibility: model.visibility !== false,
      parentId: hierarchy.parentById.get(model.id) ?? null,
      childIds: hierarchy.childrenById.get(model.id) ?? [],
      ...(model.parameters !== undefined ? { parameters: model.parameters } : {}),
      ...(model.motion !== undefined ? { motion: model.motion } : {}),
    })
  }

  return importedEntities
}

export { ENTITY_TYPES }
