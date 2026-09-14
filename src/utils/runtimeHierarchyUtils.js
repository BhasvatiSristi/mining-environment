import * as THREE from 'three'

export function getLocalTransform(entity, parentEntity) {
  if (!parentEntity) {
    return {
      position: entity.finalPosition,
      rotation: entity.rotation,
    }
  }

  const parentPosition = new THREE.Vector3(...parentEntity.finalPosition)
  const inverseParentRotation = new THREE.Quaternion(...parentEntity.rotation).invert()
  const localPosition = new THREE.Vector3(...entity.finalPosition)
    .sub(parentPosition)
    .applyQuaternion(inverseParentRotation)
  const localRotation = inverseParentRotation.clone().multiply(new THREE.Quaternion(...entity.rotation))

  return {
    position: localPosition.toArray(),
    rotation: localRotation.toArray(),
  }
}