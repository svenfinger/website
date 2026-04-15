import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'tpji8vqv',
    dataset: 'production'
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
