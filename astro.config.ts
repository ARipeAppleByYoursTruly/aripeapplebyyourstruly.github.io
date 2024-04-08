import { defineConfig } from 'astro/config'
import solidJs from "@astrojs/solid-js"
import USaC from "./USaC/plugin_astro.ts"



export default defineConfig({
  integrations: [
    solidJs(),
    USaC()
  ],
  site: "https://aripeapplebyyourstruly.github.io"
})
