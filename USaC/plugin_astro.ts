import type {AstroIntegration} from "astro"
// @ts-ignore
import child_process from "node:child_process"



type ClassNameMapping = {
  className: string,
  className_escaped: string,
  id: string
}



const USaC_GENERATOR_FILEPATH = "USaC/generator.js"
const USaC_OUTPUT_FILEPATH = "src/styles/generated-by-USaC.css"



function USaC_generateCSS() {
  child_process.execSync(`node ${USaC_GENERATOR_FILEPATH}`)
}

function USaC_generateCSS_getShortenedClassNames() {
  let output = child_process.execSync(
    `node ${USaC_GENERATOR_FILEPATH} shortenClassNames`,
    {encoding: "utf-8"}
  )

  // Get the JSON part only
  // Replace 4 "\" to 2 "\" as `node` also escapes "\", which is not desired
  output = output
    .substring(output.indexOf("{"), output.lastIndexOf("}") + 1)
    .replaceAll("\\\\", "\\")

  return JSON.parse(output)
}



export default function USaC(): AstroIntegration {
  return {
    name: "USaC:astro",
    hooks: {
      // This hook is for `npm run dev`
      "astro:server:setup": ({server}) => {
        USaC_generateCSS()

        server.watcher.on("change", (path) => {
          // I don't know why Vite/Chokidar doesn't change "\" to "/" on Windows' filepaths
          path = path.replaceAll("\\", "/")

          // Ignore the output CSS file to prevent infinite loop
          if (path.endsWith(USaC_OUTPUT_FILEPATH)) {
            return
          }

          // Only run `generator.js` if specific files are changed
          if (
            path.endsWith(USaC_GENERATOR_FILEPATH) ||
            path.endsWith(".astro") ||
            path.endsWith(".tsx")
          ) {
            USaC_generateCSS()
          }
        })
      },

      // This hook is for `npm run build`
      "astro:build:setup": ({vite}) => {
        let {shortenClassNames_mapping}: {
          shortenClassNames_mapping: Array<ClassNameMapping>
        } = USaC_generateCSS_getShortenedClassNames()

        vite.plugins!.push({
          name: "USaC:astro:vite",
          transform: (code, id) => {
            // Replace the escaped class names in CSS files to their IDs
            if (id.endsWith(".css")) {
              shortenClassNames_mapping.forEach((className_mapping) => {
                code = code.replaceAll(
                  className_mapping.className_escaped,
                  className_mapping.id
                )
              })
            }
            // Replace the class names in specific files to their IDs
            else if (
              id.endsWith(".astro") ||
              id.endsWith(".tsx")
            ) {
              shortenClassNames_mapping.forEach((className_mapping) => {
                code = code.replaceAll(
                  className_mapping.className,
                  className_mapping.id
                )
              })
            }

            return {
              code: code,
              map: null
            }
          }
        })
      }
    }
  }
}
