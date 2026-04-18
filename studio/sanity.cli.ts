import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const appId = process.env.SANITY_STUDIO_APP_ID

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity env vars. Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET.'
  )
}

export default defineCliConfig({
  api: {
    projectId,
    dataset
  },
  typegen: {
    path: "../frontend/src/**/*.{ts,tsx}",
    generates: "../frontend/sanity.types.ts",
    overloadClientMethods: true,
  },
  deployment: {
    autoUpdates: true,
    appId: appId,
  }
})
