import * as THREE from 'three'

export function getAngularVelocity(motion) {
  const value = Number(motion?.speed?.value)
  if (!Number.isFinite(value)) return 0

  switch (motion?.speed?.unit) {
    case 'rpm':
      return (value * 2 * Math.PI) / 60
    case 'rps':
      return value * 2 * Math.PI
    case 'deg/s':
      return (value * Math.PI) / 180
    case 'rad/s':
      return value
    default:
      return 0
  }
}

export function getRotationAxis(axis) {
  if (axis === 'y') return new THREE.Vector3(0, 1, 0)
  if (axis === 'z') return new THREE.Vector3(0, 0, 1)
  if (axis === 'x') return new THREE.Vector3(1, 0, 0)
  return null
}

export function getDirectionSign(direction) {
  // In this local-axis Three.js view, positive rotation is visually clockwise.
  // Invert authored direction signs so visual motion matches TwinForge.
  if (direction === 'negative' || direction === 'clockwise') return 1
  if (direction === 'positive' || direction === 'anticlockwise') return -1
  return 0
}