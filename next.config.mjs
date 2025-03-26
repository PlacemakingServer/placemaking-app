import { dirname } from 'path'
import { fileURLToPath } from 'url'

const ___dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias['@'] = `${___dirname}/src`
    return config
  }
}

export default nextConfig
