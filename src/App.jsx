import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import ImportedTwinModels from './components/ImportedTwinModels'
import { environmentEntities } from './data/environmentEntities'
import { deriveImportedTwinEntities } from './data/importedTwinEntities'
import { runtimePlacementByModelId } from './data/runtimePlacementByModelId'
import { importDigitalTwin } from './services/DigitalTwinImporter'
import './App.css'

const benchData = [
  { id: 'bench-01', name: 'Mining Bench 01', elevation: 26, height: 4, width: 108, depth: 88 },
  { id: 'bench-02', name: 'Mining Bench 02', elevation: 22, height: 4, width: 94, depth: 76 },
  { id: 'bench-03', name: 'Mining Bench 03', elevation: 18, height: 4, width: 80, depth: 64 },
  { id: 'bench-04', name: 'Mining Bench 04', elevation: 14, height: 4, width: 66, depth: 52 },
  { id: 'bench-05', name: 'Mining Bench 05', elevation: 10, height: 4, width: 52, depth: 40 },
  { id: 'bench-06', name: 'Mining Bench 06', elevation: 6, height: 4, width: 38, depth: 30 },
  { id: 'bench-07', name: 'Mining Bench 07', elevation: 2, height: 4, width: 24, depth: 20 },
]

const placeholderRaycast = () => null

function BWEPlaceholder() {
  return (
    <group>
      <mesh raycast={placeholderRaycast} position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[5.2, 0.8, 2.4]} />
        <meshStandardMaterial color="#d49a42" roughness={0.8} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[2.3, 1.1, 1.8]} />
        <meshStandardMaterial color="#6d5540" roughness={0.8} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 1.25, 1.65]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[0.45, 3.5, 0.45]} />
        <meshStandardMaterial color="#bd7e32" roughness={0.75} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 2.75, 3.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.55, 16]} />
        <meshStandardMaterial color="#e0ae55" roughness={0.7} />
      </mesh>
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} raycast={placeholderRaycast} position={[x, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 1.8, 12]} />
          <meshStandardMaterial color="#343536" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function TruckPlaceholder() {
  return (
    <group>
      <mesh raycast={placeholderRaycast} position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[3.4, 0.75, 1.7]} />
        <meshStandardMaterial color="#c47e35" roughness={0.85} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0.9, 1.55, 0]} castShadow>
        <boxGeometry args={[1.15, 0.95, 1.55]} />
        <meshStandardMaterial color="#e0ac5c" roughness={0.75} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[-0.75, 1.45, 0]} rotation={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[1.7, 1.05, 1.55]} />
        <meshStandardMaterial color="#a8642f" roughness={0.9} />
      </mesh>
      {[-1.15, 1.15].flatMap((x) => [-0.8, 0.8].map((z) => (
        <mesh key={`${x}-${z}`} raycast={placeholderRaycast} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.35, 12]} />
          <meshStandardMaterial color="#292b2b" roughness={1} />
        </mesh>
      )))}
    </group>
  )
}

function ExcavatorPlaceholder() {
  return (
    <group>
      <mesh raycast={placeholderRaycast} position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[1.45, 1.45, 0.65, 12]} />
        <meshStandardMaterial color="#d69b3e" roughness={0.8} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[1.25, 1, 1.15]} />
        <meshStandardMaterial color="#6d5540" roughness={0.8} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 1.65, -1.25]} rotation={[0.65, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 2.9, 0.42]} />
        <meshStandardMaterial color="#bd7e32" roughness={0.75} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 0.75, -2.35]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.15, 0.35, 0.9]} />
        <meshStandardMaterial color="#b96f2f" roughness={0.9} />
      </mesh>
    </group>
  )
}

function DozerPlaceholder() {
  return (
    <group>
      <mesh raycast={placeholderRaycast} position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[3, 0.8, 1.6]} />
        <meshStandardMaterial color="#d29a3f" roughness={0.85} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0.55, 1.3, 0]} castShadow>
        <boxGeometry args={[1.15, 1, 1.25]} />
        <meshStandardMaterial color="#6d5540" roughness={0.8} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[1.85, 0.55, 0]} rotation={[0, 0, -0.18]} castShadow>
        <boxGeometry args={[0.35, 1.8, 2.5]} />
        <meshStandardMaterial color="#e0ae55" roughness={0.75} />
      </mesh>
      {[-1, 1].map((z) => (
        <mesh key={z} raycast={placeholderRaycast} position={[-0.55, 0.35, z * 0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.5, 12]} />
          <meshStandardMaterial color="#343536" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function WorkerPlaceholder() {
  return (
    <group>
      <mesh raycast={placeholderRaycast} position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 8]} />
        <meshStandardMaterial color="#d9a26a" roughness={0.9} />
      </mesh>
      <mesh raycast={placeholderRaycast} position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.48, 1.05, 0.3]} />
        <meshStandardMaterial color="#d47d31" roughness={0.9} />
      </mesh>
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} raycast={placeholderRaycast} position={[x, 0.25, 0]} castShadow>
          <boxGeometry args={[0.14, 0.65, 0.14]} />
          <meshStandardMaterial color="#29383a" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

const entityTypeLabels = {
  bwe: 'BWE',
  truck: 'Haul Truck',
  excavator: 'Excavator',
  dozer: 'Dozer',
  worker: 'Worker',
}

function EnvironmentEntity({ entity, selected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const isHighlighted = selected || hovered
  const placeholderByType = {
    bwe: BWEPlaceholder,
    truck: TruckPlaceholder,
    excavator: ExcavatorPlaceholder,
    dozer: DozerPlaceholder,
    worker: WorkerPlaceholder,
  }
  const Placeholder = placeholderByType[entity.type]

  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  if (!Placeholder) return null

  return (
    <group position={entity.position} rotation={entity.rotation} scale={selected ? 1.08 : hovered ? 1.04 : 1}>
      <mesh
        position={[0, 2, 0]}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          setHovered(false)
        }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(entity)
        }}
      >
        <boxGeometry args={[6, 5, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Placeholder />
      {isHighlighted && (
        <mesh raycast={placeholderRaycast} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[2.2, 2.45, 32]} />
          <meshBasicMaterial color={selected ? '#e8ba75' : '#d0a15f'} transparent opacity={selected ? 0.75 : 0.45} />
        </mesh>
      )}
    </group>
  )
}

function MiningBench({ bench, selected, onSelect, nextElevation = 0 }) {
  const { elevation, height, width, depth } = bench
  const [hovered, setHovered] = useState(false)
  const bermWidth = 6
  const innerWidth = width - bermWidth * 2
  const innerDepth = depth - bermWidth * 2
  const faceHeight = Math.min(height, elevation - nextElevation)
  const faceY = elevation - faceHeight / 2
  const floorMaterial = new THREE.MeshStandardMaterial({ color: '#a86f45', roughness: 1 })
  const faceMaterial = new THREE.MeshStandardMaterial({ color: '#75482f', roughness: 1 })
  const floorColor = selected ? '#d2a05f' : hovered ? '#bd8550' : '#a86f45'
  const faceColor = selected ? '#a96c3f' : hovered ? '#8e5635' : '#75482f'
  floorMaterial.color.set(floorColor)
  faceMaterial.color.set(faceColor)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  const interactionProps = {
    onPointerOver: (event) => {
      event.stopPropagation()
      setHovered(true)
    },
    onPointerOut: (event) => {
      event.stopPropagation()
      setHovered(false)
    },
    onClick: (event) => {
      event.stopPropagation()
      onSelect(bench)
    },
  }

  return (
    <group>
      <mesh {...interactionProps} position={[0, elevation - 0.25, -(depth - bermWidth) / 2]} material={floorMaterial} castShadow receiveShadow>
        <boxGeometry args={[width, 0.5, bermWidth]} />
      </mesh>
      <mesh {...interactionProps} position={[0, elevation - 0.25, (depth - bermWidth) / 2]} material={floorMaterial} castShadow receiveShadow>
        <boxGeometry args={[width, 0.5, bermWidth]} />
      </mesh>
      <mesh {...interactionProps} position={[-(width - bermWidth) / 2, elevation - 0.25, 0]} material={floorMaterial} castShadow receiveShadow>
        <boxGeometry args={[bermWidth, 0.5, innerDepth]} />
      </mesh>
      <mesh {...interactionProps} position={[(width - bermWidth) / 2, elevation - 0.25, 0]} material={floorMaterial} castShadow receiveShadow>
        <boxGeometry args={[bermWidth, 0.5, innerDepth]} />
      </mesh>
      <mesh {...interactionProps} position={[0, faceY, -innerDepth / 2]} material={faceMaterial} castShadow receiveShadow>
        <boxGeometry args={[innerWidth, faceHeight, 0.5]} />
      </mesh>
      <mesh {...interactionProps} position={[0, faceY, innerDepth / 2]} material={faceMaterial} castShadow receiveShadow>
        <boxGeometry args={[innerWidth, faceHeight, 0.5]} />
      </mesh>
      <mesh {...interactionProps} position={[-innerWidth / 2, faceY, 0]} material={faceMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.5, faceHeight, innerDepth]} />
      </mesh>
      <mesh {...interactionProps} position={[innerWidth / 2, faceY, 0]} material={faceMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.5, faceHeight, innerDepth]} />
      </mesh>
    </group>
  )
}

function HaulRoad({ start, end, width = 7 }) {
  const midpoint = start.map((value, index) => (value + end[index]) / 2)
  const deltaX = end[0] - start[0]
  const deltaY = end[1] - start[1]
  const deltaZ = end[2] - start[2]
  const horizontalLength = Math.hypot(deltaX, deltaZ)
  const length = Math.hypot(horizontalLength, deltaY)
  const yaw = Math.atan2(-deltaZ, deltaX)
  const pitch = Math.atan2(deltaY, horizontalLength)

  return (
    <mesh position={midpoint} rotation={[0, yaw, pitch]} castShadow receiveShadow>
      <boxGeometry args={[length, 0.65, width]} />
      <meshStandardMaterial color="#c08b58" roughness={0.96} />
    </mesh>
  )
}

function Ground() {
  const rimElevation = 30
  const pitOpeningWidth = benchData[0].width - 4
  const pitOpeningDepth = benchData[0].depth - 4
  const outerWidth = 170
  const outerDepth = 150
  const slabHeight = 4
  const terrainBottom = -10
  const terrainHeight = rimElevation - terrainBottom
  const terrainCenterY = (rimElevation + terrainBottom) / 2
  const sideWallMaterial = <meshStandardMaterial color="#4c4a3a" roughness={1} />

  return (
    <group>
      <mesh position={[0, terrainCenterY, -(outerDepth + pitOpeningDepth) / 4]} receiveShadow>
        <boxGeometry args={[outerWidth, terrainHeight, (outerDepth - pitOpeningDepth) / 2]} />
        {sideWallMaterial}
      </mesh>
      <mesh position={[0, terrainCenterY, (outerDepth + pitOpeningDepth) / 4]} receiveShadow>
        <boxGeometry args={[outerWidth, terrainHeight, (outerDepth - pitOpeningDepth) / 2]} />
        {sideWallMaterial}
      </mesh>
      <mesh position={[-(outerWidth + pitOpeningWidth) / 4, terrainCenterY, 0]} receiveShadow>
        <boxGeometry args={[(outerWidth - pitOpeningWidth) / 2, terrainHeight, pitOpeningDepth]} />
        {sideWallMaterial}
      </mesh>
      <mesh position={[(outerWidth + pitOpeningWidth) / 4, terrainCenterY, 0]} receiveShadow>
        <boxGeometry args={[(outerWidth - pitOpeningWidth) / 2, terrainHeight, pitOpeningDepth]} />
        {sideWallMaterial}
      </mesh>
      <mesh position={[0, rimElevation - slabHeight / 2, -(outerDepth + pitOpeningDepth) / 4]} receiveShadow>
        <boxGeometry args={[outerWidth, slabHeight, (outerDepth - pitOpeningDepth) / 2]} />
        <meshStandardMaterial color="#4c4a3a" roughness={1} />
      </mesh>
      <mesh position={[0, rimElevation - slabHeight / 2, (outerDepth + pitOpeningDepth) / 4]} receiveShadow>
        <boxGeometry args={[outerWidth, slabHeight, (outerDepth - pitOpeningDepth) / 2]} />
        <meshStandardMaterial color="#4c4a3a" roughness={1} />
      </mesh>
      <mesh position={[-(outerWidth + pitOpeningWidth) / 4, rimElevation - slabHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[(outerWidth - pitOpeningWidth) / 2, slabHeight, pitOpeningDepth]} />
        <meshStandardMaterial color="#4c4a3a" roughness={1} />
      </mesh>
      <mesh position={[(outerWidth + pitOpeningWidth) / 4, rimElevation - slabHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[(outerWidth - pitOpeningWidth) / 2, slabHeight, pitOpeningDepth]} />
        <meshStandardMaterial color="#656247" roughness={1} />
      </mesh>
    </group>
  )
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.8} color="#d5d4c4" />
      <directionalLight
        castShadow
        position={[-45, 75, 35]}
        intensity={2.5}
        color="#ffe1b5"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
      />
      <hemisphereLight intensity={0.6} color="#bcd8e5" groundColor="#4b3b2a" />
    </>
  )
}

function MiningEnvironment({ selectedBench, selectedEntity, onBenchSelect, onEntitySelect }) {
  return (
    <>
      <Sky distance={450000} sunPosition={[-80, 55, -100]} turbidity={8} rayleigh={2.2} mieCoefficient={0.006} />
      <SceneLighting />
      <Ground />
      {benchData.map((bench, index) => (
        <MiningBench
          key={bench.id}
          bench={bench}
          selected={selectedBench?.id === bench.id}
          onSelect={(bench) => onBenchSelect(bench)}
          nextElevation={benchData[index + 1]?.elevation ?? 0}
        />
      ))}
      {environmentEntities.map((entity) => (
        <EnvironmentEntity
          key={entity.id}
          entity={entity}
          selected={selectedEntity?.id === entity.id}
          onSelect={onEntitySelect}
        />
      ))}
      <mesh position={[0, 1.8, 0]} receiveShadow>
        <boxGeometry args={[benchData.at(-1).width - 2, 0.4, benchData.at(-1).depth - 2]} />
        <meshStandardMaterial color="#60402d" roughness={1} />
      </mesh>
      <HaulRoad start={[-61, 26, -35]} end={[-49, 22, -30]} />
      <HaulRoad start={[48, 22, -27]} end={[38, 18, -22]} />
      <HaulRoad start={[-40, 18, 23]} end={[-31, 14, 18]} />
      <HaulRoad start={[30, 14, 17]} end={[21, 10, 12]} />
      <HaulRoad start={[-22, 10, -13]} end={[-13, 6, -8]} />
      <HaulRoad start={[13, 6, 7]} end={[6, 2, 4]} />
    </>
  )
}

function CameraControls() {
  return <OrbitControls makeDefault minDistance={45} maxDistance={190} maxPolarAngle={Math.PI / 2.05} target={[0, 10, 0]} />
}

function BenchInfoPanel({ bench, onClose }) {
  return (
    <aside className="bench-panel" aria-labelledby="bench-panel-title">
      <div className="bench-panel-heading">
        <div>
          <p className="bench-panel-kicker">Selected entity</p>
          <h2 id="bench-panel-title">{bench.name}</h2>
        </div>
        <button type="button" className="bench-panel-close" onClick={onClose} aria-label="Close bench information">
          ×
        </button>
      </div>
      <dl className="bench-details">
        <div><dt>ID</dt><dd>{bench.id}</dd></div>
        <div><dt>Elevation</dt><dd>{bench.elevation} m</dd></div>
        <div><dt>Height</dt><dd>{bench.height} m</dd></div>
        <div><dt>Width</dt><dd>{bench.width} m</dd></div>
        <div><dt>Depth</dt><dd>{bench.depth} m</dd></div>
      </dl>
    </aside>
  )
}

function EntityInfoPanel({
  entity,
  onClose,
  runtimeDisplayScale,
  onRuntimeDisplayScaleChange,
  runtimePosition,
  onRuntimePositionChange,
  onRuntimePositionReset,
}) {
  const [positionDraft, setPositionDraft] = useState(() => runtimePosition?.map((value) => String(value)) ?? [])
  const isImportedEntity = entity.source === 'twinforge'
  const typeLabel = entityTypeLabels[entity.type] ?? (isImportedEntity ? 'Imported Model' : entity.type)
  const parameterSummary = entity.parameters?.length
    ? entity.parameters.map((parameter) => `${parameter.name}: ${parameter.value}${parameter.unit ? ` ${parameter.unit}` : ''}`).join(', ')
    : null

  const commitPosition = (axis) => {
    const value = Number(positionDraft[axis])
    if (Number.isFinite(value)) {
      onRuntimePositionChange(axis, value)
      return
    }

    setPositionDraft((current) => current.map((draft, index) => index === axis ? String(runtimePosition[axis]) : draft))
  }

  return (
    <aside className="bench-panel" aria-labelledby="entity-panel-title">
      <div className="bench-panel-heading">
        <div>
          <p className="bench-panel-kicker">Selected entity</p>
          <h2 id="entity-panel-title">{entity.name}</h2>
        </div>
        <button type="button" className="bench-panel-close" onClick={onClose} aria-label="Close entity information">
          ×
        </button>
      </div>
      <dl className="bench-details">
        <div><dt>Name</dt><dd>{entity.name}</dd></div>
        <div><dt>ID</dt><dd>{entity.id}</dd></div>
        <div><dt>Type</dt><dd>{typeLabel}</dd></div>
        <div><dt>Status</dt><dd>{entity.status}</dd></div>
        {isImportedEntity && <div><dt>Source</dt><dd>{entity.source}</dd></div>}
        {isImportedEntity && entity.sourceType && <div><dt>Source type</dt><dd>{entity.sourceType.toUpperCase()}</dd></div>}
        {isImportedEntity && <div><dt>Parent</dt><dd>{entity.parentId ?? 'None'}</dd></div>}
        {isImportedEntity && <div><dt>Children</dt><dd>{entity.childIds?.length ?? 0}</dd></div>}
        {parameterSummary && <div><dt>Parameters</dt><dd>{parameterSummary}</dd></div>}
      </dl>
      {isImportedEntity && (
        <>
          <label className="runtime-scale-control">
            <span>Runtime Scale</span>
            <input
              type="number"
              min="0.1"
              max="2"
              step="0.1"
              value={runtimeDisplayScale.toFixed(2)}
              onChange={(event) => onRuntimeDisplayScaleChange(Number(event.target.value))}
            />
          </label>
          <fieldset className="runtime-position-control">
            <legend>Position</legend>
            {['x', 'y', 'z'].map((axis, index) => (
              <label key={axis}>
                <span>{axis.toUpperCase()}</span>
                <input
                  type="number"
                  step="1"
                  value={positionDraft[index]}
                  onChange={(event) => setPositionDraft((current) => current.map((draft, draftIndex) => draftIndex === index ? event.target.value : draft))}
                  onBlur={() => commitPosition(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      event.currentTarget.blur()
                    }
                  }}
                />
              </label>
            ))}
            <button type="button" onClick={onRuntimePositionReset}>Reset Position</button>
          </fieldset>
        </>
      )}
    </aside>
  )
}

function getHierarchyRootId(entity, entitiesById) {
  let currentEntity = entity
  const visitedIds = new Set()

  while (currentEntity?.parentId && entitiesById.has(currentEntity.parentId) && !visitedIds.has(currentEntity.id)) {
    visitedIds.add(currentEntity.id)
    currentEntity = entitiesById.get(currentEntity.parentId)
  }

  return currentEntity?.id ?? entity.id
}

function App() {
  const [selectedBench, setSelectedBench] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [importedTwin, setImportedTwin] = useState(null)
  const [importStatus, setImportStatus] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [modelLoadStatus, setModelLoadStatus] = useState(null)
  const [runtimeDisplayScaleByModelId, setRuntimeDisplayScaleByModelId] = useState({})
  const [runtimePositionOffsetByModelId, setRuntimePositionOffsetByModelId] = useState({})
  const fileInputRef = useRef(null)
  const importedTwinEntities = useMemo(
    () => (importedTwin
      ? deriveImportedTwinEntities(importedTwin.manifest, environmentEntities, runtimePlacementByModelId)
      : []),
    [importedTwin],
  )
  const runtimeEntities = useMemo(
    () => [...environmentEntities, ...importedTwinEntities],
    [importedTwinEntities],
  )
  const importedEntitiesById = useMemo(
    () => new Map(importedTwinEntities.map((entity) => [entity.id, entity])),
    [importedTwinEntities],
  )

  const handleBenchSelect = (bench) => {
    setSelectedBench(bench)
    setSelectedEntity(null)
  }

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity)
    setSelectedBench(null)
  }

  const clearSelections = () => {
    setSelectedBench(null)
    setSelectedEntity(null)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleTwinFileChange = async (event) => {
    const [file] = event.target.files
    event.target.value = ''

    if (!file) return

    setIsImporting(true)
    setImportStatus(null)
    clearSelections()

    try {
      const result = await importDigitalTwin(file)
      setImportedTwin(result)
      setRuntimeDisplayScaleByModelId({})
      setRuntimePositionOffsetByModelId({})
      setModelLoadStatus(null)
      setImportStatus({
        type: 'success',
        message: `Digital twin imported: ${result.manifest.twin?.name ?? file.name}`,
      })
    } catch (error) {
      console.error('Digital twin import failed', error)
      setImportStatus({ type: 'error', message: error.message })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <main className="mine-app">
      <Canvas
        shadows
        camera={{ position: [112, 86, 118], fov: 42 }}
        onPointerMissed={clearSelections}
      >
        <MiningEnvironment
          selectedBench={selectedBench}
          selectedEntity={selectedEntity}
          onBenchSelect={handleBenchSelect}
          onEntitySelect={handleEntitySelect}
        />
        <ImportedTwinModels
          importedTwin={importedTwin}
          runtimeEntities={runtimeEntities}
          runtimeDisplayScaleByModelId={runtimeDisplayScaleByModelId}
          runtimePositionOffsetByModelId={runtimePositionOffsetByModelId}
          selectedEntity={selectedEntity}
          onEntitySelect={handleEntitySelect}
          onStatus={setModelLoadStatus}
        />
        <CameraControls />
      </Canvas>
      <header className="scene-header">
        <p className="eyebrow">PHASE 01 / TERRAIN STUDY</p>
        <h1>Mining Environment</h1>
        <p className="scene-status"><span className="status-dot" />Open-pit survey view</p>
      </header>
      <div className="scene-scale" aria-hidden="true">
        <span>North rim</span>
        <span className="scale-line" />
        <span>100 m</span>
      </div>
      <section className="import-control" aria-label="Digital twin import">
        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          accept=".twinforge"
          onChange={handleTwinFileChange}
        />
        <button type="button" className="import-button" onClick={handleImportClick} disabled={isImporting}>
          {isImporting ? 'Importing...' : 'Import Digital Twin'}
        </button>
        {importStatus && <p className={`import-status ${importStatus.type}`}>{importStatus.message}</p>}
        {importedTwin && (
          <dl className="import-summary">
            <div><dt>Digital twin</dt><dd>{importedTwin.manifest.twin?.name ?? 'Unnamed twin'}</dd></div>
            <div><dt>Models</dt><dd>{importedTwin.manifest.models.length}</dd></div>
            <div><dt>Package</dt><dd>Imported successfully</dd></div>
            {modelLoadStatus?.state === 'loading' && (
              <div><dt>Models</dt><dd>Loading {modelLoadStatus.total}...</dd></div>
            )}
            {modelLoadStatus?.state === 'loaded' && (
              <div><dt>Runtime</dt><dd>{modelLoadStatus.loaded} loaded{modelLoadStatus.errors ? `, ${modelLoadStatus.errors} failed` : ''}</dd></div>
            )}
          </dl>
        )}
      </section>
      {selectedBench && <BenchInfoPanel bench={selectedBench} onClose={() => setSelectedBench(null)} />}
      {selectedEntity && (
        <EntityInfoPanel
          key={selectedEntity.id}
          entity={importedEntitiesById.get(selectedEntity.id) ?? selectedEntity}
          onClose={() => setSelectedEntity(null)}
          runtimeDisplayScale={selectedEntity.source === 'twinforge'
            ? runtimeDisplayScaleByModelId[getHierarchyRootId(importedEntitiesById.get(selectedEntity.id) ?? selectedEntity, importedEntitiesById)] ?? 1
            : null}
          runtimePosition={selectedEntity.source === 'twinforge'
            ? (() => {
              const currentEntity = importedEntitiesById.get(selectedEntity.id) ?? selectedEntity
              const rootId = getHierarchyRootId(currentEntity, importedEntitiesById)
              const rootEntity = importedEntitiesById.get(rootId) ?? currentEntity
              const delta = runtimePositionOffsetByModelId[rootId] ?? [0, 0, 0]
              return rootEntity.finalPosition.map((value, index) => value + delta[index])
            })()
            : null}
          onRuntimePositionChange={(axis, value) => {
            if (selectedEntity.source !== 'twinforge') return
            if (!Number.isFinite(value)) return
            const currentEntity = importedEntitiesById.get(selectedEntity.id) ?? selectedEntity
            const rootId = getHierarchyRootId(currentEntity, importedEntitiesById)
            const originalRootEntity = importedEntitiesById.get(rootId) ?? currentEntity
            const nextDelta = [...(runtimePositionOffsetByModelId[rootId] ?? [0, 0, 0])]
            nextDelta[axis] = value - originalRootEntity.finalPosition[axis]
            setRuntimePositionOffsetByModelId((current) => ({ ...current, [rootId]: nextDelta }))
          }}
          onRuntimePositionReset={() => {
            if (selectedEntity.source !== 'twinforge') return
            const currentEntity = importedEntitiesById.get(selectedEntity.id) ?? selectedEntity
            const rootId = getHierarchyRootId(currentEntity, importedEntitiesById)
            setRuntimePositionOffsetByModelId((current) => {
              const next = { ...current }
              delete next[rootId]
              return next
            })
          }}
          onRuntimeDisplayScaleChange={(value) => {
            if (selectedEntity.source !== 'twinforge') return
            if (!Number.isFinite(value)) return
            const rootId = getHierarchyRootId(selectedEntity, importedEntitiesById)
            const clampedValue = Math.min(2, Math.max(0.1, value))
            setRuntimeDisplayScaleByModelId((current) => ({ ...current, [rootId]: clampedValue }))
          }}
        />
      )}
    </main>
  )
}

export default App
