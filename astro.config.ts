import {defineConfig} from 'astro/config'
import {type PluginOption} from "vite"
import solidJs from "@astrojs/solid-js"
import USaC from "./USaC/plugin_astro.ts"



export default defineConfig({
  site: "https://aripeapplebyyourstruly.github.io",
  integrations: [
    solidJs(),
    USaC()
  ],
  vite: {
    plugins: [{
      handleHotUpdate: ({file, server}) => {
        // Use full reload instead of HMR for `.tsx` files, because HMR breaks exported ref signals
        if (file.endsWith(".tsx")) {
          server.hot.send({type: "full-reload"})
          return []
        }
      }
    } as PluginOption]
  }
})
