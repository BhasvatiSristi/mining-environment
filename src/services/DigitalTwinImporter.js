import { strFromU8, unzipSync } from 'fflate'

const TWINFORGE_FORMAT = 'twinforge'
const TWINFORGE_VERSION = '1.0'
const GLB_FORMAT = 'glb'

function createImportError(message) {
  return new Error(`Invalid TwinForge package: ${message}`)
}

function assertPackageFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw createImportError('expected a File or Blob-like object')
  }

  if (typeof file.name === 'string' && file.name.length > 0 && !file.name.toLowerCase().endsWith('.twinforge')) {
    throw createImportError('file name must end with .twinforge')
  }
}

function readManifest(entries) {
  const manifestEntry = entries['manifest.json']

  if (!manifestEntry) {
    throw createImportError('manifest.json is missing')
  }

  try {
    return JSON.parse(strFromU8(manifestEntry))
  } catch {
    throw createImportError('manifest.json contains invalid JSON')
  }
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw createImportError('manifest must be a JSON object')
  }

  if (manifest.format !== TWINFORGE_FORMAT) {
    throw createImportError(`unsupported format "${manifest.format ?? ''}"`)
  }

  if (manifest.version !== TWINFORGE_VERSION) {
    throw createImportError(`unsupported version "${manifest.version ?? ''}"`)
  }

  if (!Array.isArray(manifest.models)) {
    throw createImportError('models must be an array')
  }
}

function validateAssetPath(assetPath, modelId) {
  if (typeof assetPath !== 'string' || assetPath.length === 0) {
    throw createImportError(`model "${modelId}" is missing asset.path`)
  }

  if (
    assetPath.startsWith('/') ||
    assetPath.includes('\\') ||
    assetPath.includes('..') ||
    /^(?:[a-z]+:)?\/\//i.test(assetPath) ||
    !assetPath.startsWith('assets/') ||
    !assetPath.toLowerCase().endsWith('.glb')
  ) {
    throw createImportError(`model "${modelId}" has an unsafe asset path "${assetPath}"`)
  }
}

function validateModels(manifest, entries) {
  const modelIds = new Set()

  for (const [index, model] of manifest.models.entries()) {
    if (!model || typeof model !== 'object' || Array.isArray(model)) {
      throw createImportError(`model at index ${index} must be an object`)
    }

    if (typeof model.id !== 'string' || model.id.length === 0) {
      throw createImportError(`model at index ${index} is missing id`)
    }

    if (typeof model.name !== 'string' || model.name.length === 0) {
      throw createImportError(`model "${model.id}" is missing name`)
    }

    if (modelIds.has(model.id)) {
      throw createImportError(`duplicate model id "${model.id}"`)
    }
    modelIds.add(model.id)

    const asset = model.asset
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      throw createImportError(`model "${model.id}" is missing asset.path`)
    }

    validateAssetPath(asset.path, model.id)

    if (asset.format !== GLB_FORMAT) {
      throw createImportError(`model "${model.id}" must use asset.format "glb"`)
    }

    if (!entries[asset.path]) {
      throw createImportError(`model "${model.id}" references missing asset "${asset.path}"`)
    }

  }
}

function createAssetBlobs(entries, manifest) {
  const assets = {}

  for (const model of manifest.models) {
    assets[model.asset.path] = new Blob([entries[model.asset.path]], { type: 'model/gltf-binary' })
  }

  return assets
}

export async function importDigitalTwin(file) {
  assertPackageFile(file)

  let entries
  try {
    entries = unzipSync(new Uint8Array(await file.arrayBuffer()))
  } catch {
    throw createImportError('could not read ZIP archive')
  }

  const manifest = readManifest(entries)
  validateManifest(manifest)
  validateModels(manifest, entries)

  return {
    manifest,
    assets: createAssetBlobs(entries, manifest),
  }
}