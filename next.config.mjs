import fs from 'fs'

/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

// Optional user config loading
let userConfig = {}
const userConfigPath = './v0-user-next.config.js'
if (fs.existsSync(userConfigPath)) {
  userConfig = await import(userConfigPath).then((mod) => mod.default || mod)
}

const finalConfig = mergeConfig(baseConfig, userConfig)

function mergeConfig(base, override) {
  const merged = { ...base }

  for (const key in override) {
    if (
      typeof base[key] === 'object' &&
      !Array.isArray(base[key]) &&
      typeof override[key] === 'object'
    ) {
      merged[key] = {
        ...base[key],
        ...override[key],
      }
    } else {
      merged[key] = override[key]
    }
  }

  return merged
}

export default finalConfig