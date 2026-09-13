import { ENTITY_TYPES, SUPPORTED_ENTITY_TYPES } from './entityTypes'

export function createEnvironmentEntity({ id, name, type, position = [0, 0, 0], rotation = [0, 0, 0], status = 'idle', ...additionalData }) {
  if (!SUPPORTED_ENTITY_TYPES.includes(type)) {
    throw new Error(`Unsupported environment entity type: ${type}`)
  }

  return {
    id,
    name,
    type,
    position,
    rotation,
    status,
    ...additionalData,
  }
}

export const environmentEntities = [
  createEnvironmentEntity({
    id: 'bwe-01',
    name: 'Bucket Wheel Excavator 01',
    type: ENTITY_TYPES.BWE,
    position: [-25, 22, -20],
    rotation: [0, 0.15, 0],
    status: 'idle',
  }),
  createEnvironmentEntity({
    id: 'truck-01',
    name: 'Haul Truck 01',
    type: ENTITY_TYPES.TRUCK,
    position: [43, 20.2, -24],
    rotation: [0, -0.2, 0],
    status: 'idle',
  }),
  createEnvironmentEntity({
    id: 'excavator-01',
    name: 'Excavator 01',
    type: ENTITY_TYPES.EXCAVATOR,
    position: [20, 14, 12],
    rotation: [0, -0.4, 0],
    status: 'idle',
  }),
  createEnvironmentEntity({
    id: 'dozer-01',
    name: 'Dozer 01',
    type: ENTITY_TYPES.DOZER,
    position: [-35, 26, 24],
    rotation: [0, 0.5, 0],
    status: 'idle',
  }),
  createEnvironmentEntity({
    id: 'worker-01',
    name: 'Worker 01',
    type: ENTITY_TYPES.WORKER,
    position: [10, 6, 8],
    rotation: [0, -0.25, 0],
    status: 'idle',
  }),
]

export { ENTITY_TYPES }
