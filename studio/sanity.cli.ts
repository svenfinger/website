import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

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
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
