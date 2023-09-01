import {defineConfig} from "astro/config"
import solidJs from "@astrojs/solid-js"
import generateCSS from "./generate-css/astro-plugin"



export default defineConfig({
  integrations: [
    solidJs(),
    generateCSS()
  ]
});
