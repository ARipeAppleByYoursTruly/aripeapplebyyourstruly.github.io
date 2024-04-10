import fs from "node:fs"
import fg from "fast-glob"
import cssesc from "cssesc"
import {getIconData, getIconCSS} from "@iconify/utils"



class LayerList {
  #layers

  constructor(layers) {
    this.#layers = new Set(layers)
  }

  get(layer) {
    if (this.#layers.has(layer)) {
      return layer
    }
    else {
      throw new Error(
        "E-3\n\n" +
        `Layer "${layer}" is not defined in config\n`
      )
    }
  }

  getAll() {
    return this.#layers
  }
}

/*
Structure of blueprint object for reference:
{
  className: string,
  className_escaped: string,
  layer: string,
  variants: string,
  rule: string,
  css: {
    selector: string,
    body: string
  }
}
*/



/**
Configuration

@prop {string[]} filesToExtractFrom_globPatterns

Glob patterns for specifying which files to extract class names from, relative to the project root



@prop {string} outputFilepath

The filepath to write the generated styles to



@prop {LayerList} layers

A LayerList of defined layers. While it accepts an array of strings, it will return a Set of strings
when calling LayerList.getAll()

Use LayerList.get() when assigning a layer in shortcuts, rules, etc because it will throw an error
if the layer is not defined in this config object

Use LayerList.getAll() for operations involving layers, like sorting rules by layers, etc

You'll have to scroll to the bottom of the file to define what should be written to the output CSS
file on a layer level, like adding media queries



@prop {Map(){"shortcutName" => ["rule1", "shortcut1", ...]}} shortcuts

A Map of shortcut definitions. The key is a string for the name of the shortcut, and the value
is an array of rules and shortcuts it expands to



@prop {Function[]} rules

An array of functions that mutate the blueprint passed to it

Rules are what applies the CSS, it makes up the body of a CSS style



@prop {Function[]} variants

An array of functions that mutates the blueprint passed to it

Variants are used to make a rule to be applied conditionally, such as applying CSS' combinators
(`.a > div`, `.b:hover`, ...), etc
*/
const config = Object.freeze({
  filesToExtractFrom_globPatterns: [
    "src/**/*.astro",
    "src/**/*.tsx"
  ],
  outputFilepath: "src/styles/generated-by-USaC.css",
  layers: new LayerList([
    "icons",
    "shortcuts",
    "rules",
    "rules - 500px breakpoint - max-width",
    "rules - 500px breakpoint - min-width",
    "rules - 1000px breakpoint - max-width",
    "rules - 1000px breakpoint - min-width",
    "variants - :hover",
    "variants - :focus-visible",
    "variants - :active"
  ]),
  shortcuts: config_defineShortcuts(),
  rules: config_defineRules(),
  variants: config_defineVariants()
})



function config_defineShortcuts() {
  let map = new Map()

  /*
  Define your shortcuts here

  Shortcuts MUST NOT contain itself, because shortcuts must fully expand to rules only
  Otherwise it will EXPAND IFINITELY

  === Template ===
  map.set(
    "shortcut name",
    `
    rule1
    shortcut1
    ...
    `
  )
  */

  map.set(
    "debug-box",
    `
    background:rgba(255,0,0,.2)
    `
  )



  map.set(
    "apply-transition",
    `
    transition-timing-function:cubic-bezier(.7,1,.7,1)
    transition-duration:.2s
    `
  )

  map.set(
    "apply-keyboardFocusOutline",
    `
    outline:3px_solid_transparent
    :focus-visible?outline-color:var(--color-onBackground-interactive-hover)
    `
  )

  map.set(
    "apply-tooltipStyles",
    `
    >div:first-child?background:var(--color-background-interactive-hover)
    >div:first-child?color:var(--color-onBackground-base)

    >div:first-child?border-radius:100px
    >div:first-child?font-size:0.85rem
    >div:first-child?padding:5px_10px

    >div:first-child?apply-transition
    >div:first-child?transition-property:background-color,color,opacity
    `
  )

  map.set(
    "apply-interactive-color",
    `
    color:var(--color-onBackground-interactive)
    :hover?color:var(--color-onBackground-interactive-hover)
    :focus-visible?color:var(--color-onBackground-interactive-hover)
    :active?color:var(--color-onBackground-interactive-pressed)
    `
  )

  map.set(
    "apply-interactive-background",
    `
    :hover?background:var(--color-background-interactive-hover)
    :focus-visible?background:var(--color-background-interactive-hover)
    :active?background:var(--color-background-interactive-pressed)
    `
  )

  map.set(
    "apply-interactive-textDecoration",
    `
    text-decoration:none
    :hover?text-decoration:underline
    :focus-visible?text-decoration:underline
    `
  )



  map.set(
    "styleAs-interactive",
    `
    apply-interactive-color
    apply-keyboardFocusOutline

    apply-transition
    transition-property:background-color,color,outline-color

    cursor:pointer

    -webkit-tap-highlight-color:transparent
    `
  )

  /*
  Omitted `background` so that other shortcuts can change it, as not every button requires a
  prominent background
  */
  map.set(
    "styleAs-button-base",
    `
    styleAs-interactive

    apply-interactive-background

    border:none
    `
  )

  map.set(
    "styleAs-button-icon",
    `
    styleAs-button-base
    background:none

    border-radius:50%

    padding:5px



    apply-tooltipStyles

    >:nth-child(2)?display:block
    >:nth-child(2)?width:50px
    >:nth-child(2)?aspect-ratio:1/1
    `
  )

  map.set(
    "styleAs-button-text",
    `
    styleAs-button-base

    border-radius:1000px
    padding:5px
    font-size:1rem
    `
  )

  map.set(
    "styleAs-button-card",
    `
    styleAs-button-base
    styleAs-card

    apply-interactive-textDecoration
    `
  )

  map.set(
    "styleAs-link",
    `
    styleAs-interactive
    apply-interactive-textDecoration
    `
  )

  map.set(
    "styleAs-card",
    `
    background:var(--color-background-layer1)

    border-radius:10px
    padding:15px
    `
  )



  // Convert all values of `map` to an array of class names
  map = new Map(Array.from(map, ([shortcutName, rulesAndShortcuts]) => {
    if (rulesAndShortcuts.includes(shortcutName)) {
      throw new Error(
        "E-4\n\n" +
        `Shortcut "${shortcutName}" contains itself, which is not allowed\n` +
        `Please revise your "${shortcutName}" shortcut\n`
      )
    }

    return [
      shortcutName,
      rulesAndShortcuts.replaceAll(/\s+/g, " ").trim().split(" ")
    ]
  }))

  return map
}



function config_defineRules() {
  /*
  ruleHandler function must accept exactly 2 parameters, and return them whether they have been
  mutated or not

  === Template ===
    // Descirption of rule
    (isRuleHandled, blueprint) => {
      // Check whether this rule is applicable or not

      // If not applicable, return [isRuleHandled, blueprint] as is

      // If applicable, perform mutation on blueprint

      isRuleHandled = true

      return [isRuleHandled, blueprint]
    }
  */
  return [
    // Iconify icon
    (isRuleHandled, blueprint) => {
      let rule_match = blueprint.rule.match(/^icon_(.+)_(.+)$/)

      if (rule_match === null) {
        return [isRuleHandled, blueprint]
      }



      const icon_data = getIconData(
        JSON.parse(fs.readFileSync(`node_modules/@iconify/json/json/${rule_match[1]}.json`)),
        rule_match[2]
      )
      const icon_css = getIconCSS(icon_data)

      blueprint.css.body = icon_css.substring(
        icon_css.lastIndexOf("--svg"),
        icon_css.lastIndexOf(";")
      )

      if (blueprint.layer === "") {
        blueprint.layer = config.layers.get("icons")
      }



      isRuleHandled = true

      return [isRuleHandled, blueprint]
    },
    // 500px breakpoint - max-width
    (isRuleHandled, blueprint) => {
      let rule_match = blueprint.rule.match(/^@max:500px@(.+):(.+)$/)

      if (rule_match === null) {
        return [isRuleHandled, blueprint]
      }



      blueprint.css.body = `${rule_match[1]}: ${rule_match[2].replaceAll("_", " ")}`

      if (blueprint.layer === "") {
        blueprint.layer = config.layers.get("rules - 500px breakpoint - max-width")
      }



      isRuleHandled = true

      return [isRuleHandled, blueprint]
    },
    // 500px breakpoint - min-width
    (isRuleHandled, blueprint) => {
      let rule_match = blueprint.rule.match(/^@min:500px@(.+):(.+)$/)

      if (rule_match === null) {
        return [isRuleHandled, blueprint]
      }



      blueprint.css.body = `${rule_match[1]}: ${rule_match[2].replaceAll("_", " ")}`

      if (blueprint.layer === "") {
        blueprint.layer = config.layers.get("rules - 500px breakpoint - min-width")
      }



      isRuleHandled = true

      return [isRuleHandled, blueprint]
    },
    // 1000px breakpoint - max-width
    (isRuleHandled, blueprint) => {
      let rule_match = blueprint.rule.match(/^@max:1000px@(.+):(.+)$/)

      if (rule_match === null) {
        return [isRuleHandled, blueprint]
      }



      blueprint.css.body = `${rule_match[1]}: ${rule_match[2].replaceAll("_", " ")}`

      if (blueprint.layer === "") {
        blueprint.layer = config.layers.get("rules - 1000px breakpoint - max-width")
      }



      isRuleHandled = true

      return [isRuleHandled, blueprint]
    },
    // 1000px breakpoint - min-width
    (isRuleHandled, blueprint) => {
      let rule_match = blueprint.rule.match(/^@min:1000px@(.+):(.+)$/)

      if (rule_match === null) {
        return [isRuleHandled, blueprint]
      }



      blueprint.css.body = `${rule_match[1]}: ${rule_match[2].replaceAll("_", " ")}`

      if (blueprint.layer === "") {
        blueprint.layer = config.layers.get("rules - 1000px breakpoint - min-width")
      }



      isRuleHandled = true

      return [isRuleHandled, blueprint]
    },
    // CSS' property-value declaration
    (isRuleHandled, blueprint) => {
      let rule_match = blueprint.rule.match(/(.+):(.+)/)

      if (rule_match === null) {
        return [isRuleHandled, blueprint]
      }



      blueprint.css.body = `${rule_match[1]}: ${rule_match[2].replaceAll("_", " ")}`

      if (blueprint.layer === "") {
        blueprint.layer = config.layers.get("rules")
      }



      isRuleHandled = true

      return [isRuleHandled, blueprint]
    }
  ]
}



function config_defineVariants() {
  /*
  variantHandler function must accept exactly 2 parameters, and return them whether they have been
  mutated or not

  === Template ===
    // Description of variant
    (variants, blueprint) => {
      // Check variants whether this variant is applicable or not

      // If not applicable, return [variants, blueprint] as is

      // If applicable, perform mutation on blueprint

      // Remove the matched variant from variants

      return [variants, blueprints]
    }
  */
  return [
    // _asd - Descendent combinator
    (variants, blueprint) => {
      let variant_match = variants.match(/^_([^_>~+:]*)/)

      if (variant_match === null) {
        return [variants, blueprint]
      }



      blueprint.css.selector += ` ${variant_match[1]}`



      variants = variants.replace(variant_match[0], "")

      return [variants, blueprint]
    },
    // >asd - Children combinator
    (variants, blueprint) => {
      let variant_match = variants.match(/^>([^_>~+:]*)/)

      if (variant_match === null) {
        return [variants, blueprint]
      }



      blueprint.css.selector += ` > ${variant_match[1]}`



      variants = variants.replace(variant_match[0], "")

      return [variants, blueprint]
    },
    // ~asd - General sibling combinator
    (variants, blueprint) => {
      let variant_match = variants.match(/^~([^_>~+:]*)/)

      if (variant_match === null) {
        return [variants, blueprint]
      }



      blueprint.css.selector += ` ~ ${variant_match[1]}`



      variants = variants.replace(variant_match[0], "")

      return [variants, blueprint]
    },
    // +asd - Adjacent sibling combinator
    (variants, blueprint) => {
      let variant_match = variants.match(/^\+([^_>~+:]*)/)

      if (variant_match === null) {
        return [variants, blueprint]
      }



      blueprint.css.selector += ` + ${variant_match[1]}`



      variants = variants.replace(variant_match[0], "")

      return [variants, blueprint]
    },
    // ::asd - Pseudo-element combinator
    (variants, blueprint) => {
      let variant_match = variants.match(/^::([^_>~+:]*)/)

      if (variant_match === null) {
        return [variants, blueprint]
      }



      blueprint.css.selector += `::${variant_match[1]}`



      variants = variants.replace(variant_match[0], "")

      return [variants, blueprint]
    },
    // :asd - Pseudo-class combinator
    (variants, blueprint) => {
      let variant_match = variants.match(/^:([^_>~+:]*)/)

      if (variant_match === null) {
        return [variants, blueprint]
      }



      blueprint.css.selector += `:${variant_match[1]}`



      variants = variants.replace(variant_match[0], "")




      switch (variant_match[1]) {
        case "hover":
          blueprint.layer = config.layers.get("variants - :hover")
          break

        case "focus-visible":
          blueprint.layer = config.layers.get("variants - :focus-visible")
          break

        case "active":
          blueprint.layer = config.layers.get("variants - :active")
          break
      }



      return [variants, blueprint]
    }
  ]
}






// Determine CLI options used
const cli_flags = Object.freeze({
  logStages: process.argv.includes("logStages"),
  shortenClassNames: process.argv.includes("shortenClassNames")
})



function logStage(message) {
  if (cli_flags.logStages) {
    console.log(message)
  }
}



logStage("Extracting `class` attribute values...")



let filesToExtractFrom = fg.sync(config.filesToExtractFrom_globPatterns)

/*
Sort the filepaths using localeCompare()
This will affect the order of generated styles in the output CSS file

If your project uses this structure

- src
  - components
  - layouts
  - pages

The priorities of your styles should be fine most of the time
Biggest issue would be the styles of `src/components` getting messed up when imported in other
`src/components`
*/
filesToExtractFrom.sort((a, b) => a.localeCompare(b))

// Extracted `class` attribute's value will be added to this array
let classAttributeValues = []

filesToExtractFrom.forEach((file) => {
  let file_content = fs.readFileSync(file, "utf-8")

  while (true) {
    let classAttribute_match = file_content.match(/class\s*=\s*("|'|{)/)

    // There's no more `class` attributes in this file
    if (classAttribute_match === null) {
      break
    }

    // Skip to the start of `class` attribute value
    file_content = file_content.substring(
      classAttribute_match.index + classAttribute_match[0].length - 1
    )

    /*
    Check the character used to enclose `class` attribute value
    It can only be ", ' and {
    */
    // "..." or '...'
    if (classAttribute_match[1] !== "{") {
      // Determine the right regex to use
      let classAttributeValue_regex

      if (classAttribute_match[1] === "\"") {
        classAttributeValue_regex = /"[^"]*"/
      }
      else {
        classAttributeValue_regex = /'[^']*'/
      }

      // Extract `class` attribute value
      let classAttributeValue_match = file_content.match(classAttributeValue_regex)

      if (classAttributeValue_match !== null) {
        classAttributeValues.push(classAttributeValue_match[0])
      }
      else {
        throw new Error(
          "E-1\n\n" +
          `classAttributeValue_match failed to find the 2nd ${classAttribute_match[1]}\n\n` +
          "file:\n" +
          `${file}\n\n` +
          "file_content:\n" +
          `${classAttribute_match[0] + file_content.substring(1, 50)}` +
          `${file_content.length > 50 ? " ...\n" : "\n-EOF-\n"}`
        )
      }
    }
    // {...}
    else {
      let classAttributeValue = "{"
      let depth = ["{"]
      let character_index = 1

      function throwErrorE2() {
        throw new Error(
          "E-2\n\n" +
          "End of file reached while extracting `class` attribute value of {...} nature\n\n" +
          "file:\n" +
          `${file}\n\n` +
          "file_content:\n" +
          `${classAttribute_match[0] + file_content.substring(1, 50)}` +
          `${file_content.length > 50 ? " ...\n" : "\n-EOF-\n"}`
        )
      }



      while (true) {
        // Read the next character
        let character = file_content[character_index]

        if (character === undefined) {
          throwErrorE2()
        }

        classAttributeValue += character
        character_index++

        // Reading in {...} or ${...} context
        if (depth.at(-1) === "{" || depth.at(-1) === "${") {
          // " ' ` and { can add depth
          if (character.match(/"|'|`|{/) !== null) {
            depth.push(character)
          }
          else if (character === "}") {
            depth.pop()
          }
        }
        // Reading in `...` context
        else if (depth.at(-1) === "`") {
          // ${ can add depth
          if (character === "$") {
            // Read the next character
            character = file_content[character_index]

            if (character === undefined) {
              throwErrorE2()
            }

            classAttributeValue += character
            character_index++

            if (character === "{") {
              depth.push("${")
            }
          }
          else if (character === "`") {
            depth.pop()
          }
        }
        // Reading in "..." context
        else if (depth.at(-1) === "\"") {
          // No character can add depth

          if (character === "\"") {
            depth.pop()
          }
        }
        // Reading in '...' context
        else if (depth.at(-1) === "'") {
          // No character can add depth

          if (character === "'") {
            depth.pop()
          }
        }

        // The entire `class` attribute value has been read
        if (depth.length === 0) {
          break
        }
      }

      classAttributeValues.push(classAttributeValue)
    }
  }
})



logStage(
  "Done\n" +
  "Extracting class names..."
)



// Extracted class names will be added to this array
let classNames = []

classAttributeValues.forEach((classAttributeValue) => {
  // Normalize space characters to ` `
  classAttributeValue = classAttributeValue.replaceAll(/\s+/g, " ")

  // classAttributeValue can only start with ", ' or {
  // "..." and '...'
  if (classAttributeValue[0] !== "{") {
    classNames.push(
      ...classAttributeValue
        .substring(1, classAttributeValue.length - 1)
        .trim()
        .split(" ")
    )
  }
  // {...}
  else {
    let className = ""
    let character_index = 1
    let depth = ["{"]

    while (true) {
      // Read the next character
      let character = classAttributeValue[character_index]
      character_index++

      // Reading in {...} or ${...} context
      if (depth.at(-1) === "{" || depth.at(-1) === "${") {
        // Only " ' and ` can add depth
        if (character.match(/"|'|`/)) {
          depth.push(character)
        }
        else if (character === "}") {
          depth.pop()
        }
      }
      // Reading in `...` context
      else if (depth.at(-1) === "`") {
        // Only ${...} can add depth
        if (character === "$") {
          // Read the next character
          character = classAttributeValue[character_index]
          character_index++

          if (character === "{") {
            depth.push("${")
          }
          else {
            className += "$" + character
          }
        }
        else if (character === "`") {
          classNames.push(className)
          depth.pop()
        }
        // Class names are seperated by ` `
        else if (character === " ") {
          classNames.push(className)
          className = ""
        }
        else {
          className += character
        }
      }
      // Reading in "..." context
      else if (depth.at(-1) === "\"") {
        if (character === "\"") {
          // Note: This part could be problematic, might need to revise

          // This will make it
          // condition === "won't be extracted" ? "will be extracted" : "will be extracted"
          if (classAttributeValue[character_index + 1] !== "?") {
            classNames.push(className)
          }

          className = ""
          depth.pop()
        }
        // Class names are seperated by ` `
        else if (character === " ") {
          classNames.push(className)
          className = ""
        }
        else {
          className += character
        }
      }
      // Reading in '...' context
      else if (depth.at(-1) === "'") {
        if (character === "'") {
          // Note: This part could be problematic, might need to revise

          // This will make it
          // condition === 'won't be extracted' ? 'will be extracted' : 'will be extracted'
          if (classAttributeValue[character_index + 1] !== "?") {
            classNames.push(className)
          }

          className = ""
          depth.pop()
        }
        // Class names are seperated by ` `
        else if (character === " ") {
          classNames.push(className)
          className = ""
        }
        else {
          className += character
        }
      }

      // All characters in `class` attribute value have been read
      if (depth.length === 0) {
        break
      }
    }
  }
})

// Remove empty strings
classNames = classNames.filter((className) => className !== "")

// Remove duplicates
classNames = Array.from(new Set(classNames))



logStage(
  "Done\n" +
  "Expanding shortcuts to rules..."
)



// All of the rules expanded from shortcuts will be added to this array
let blueprints = []

classNames.forEach((className) => {
  let rulesAndShortcuts = [className]
  let variants_toInherit = ""
  let i = 0

  while (true) {
    // Shortcut has been fully expanded to just rules
    if (i >= rulesAndShortcuts.length) {
      break
    }

    // Variants are ignored when matching shortcuts
    if (rulesAndShortcuts[i].indexOf("?") !== -1) {
      [variants_toInherit, rulesAndShortcuts[i]] = rulesAndShortcuts[i].split("?", 2)
    }



    if (config.shortcuts.has(rulesAndShortcuts[i])) {
      // This is a shortcut, add it's rules and shortcut into the array for further checking
      rulesAndShortcuts.push(
        ...config.shortcuts
          .get(rulesAndShortcuts[i])
          .map((ruleOrShortcut) => {
            // Inherit variants
            if (ruleOrShortcut.indexOf("?") !== -1) {
              return `${variants_toInherit}${ruleOrShortcut}`
            }
            else {
              return `${variants_toInherit}?${ruleOrShortcut}`
            }
          })
      )
    }
    else {
      /*
      This is a rule, add this to blueprints
      If this rule is the first element of the array, then it is not using a shortcut
      */
      blueprints.push({
        className: className,
        className_escaped: cssesc(className, {isIdentifier: true}),
        layer: i !== 0 ? config.layers.get("shortcuts") : "",
        variants: variants_toInherit,
        rule: rulesAndShortcuts[i],
        css: {
          selector: `.${cssesc(className, {isIdentifier: true})}`,
          body: ""
        }
      })
    }

    i++
  }
})



logStage(
  "Done\n" +
  "Generating styles..."
)



// Handle rules
for (let i in blueprints) {
  let isRuleHandled = false

  for (let j in config.rules) {
    [isRuleHandled, blueprints[i]] = config.rules[j](isRuleHandled, blueprints[i])

    // Rule has been handled
    if (isRuleHandled) {
      break
    }
  }

  // This is not a rule, it will be removed
  if (isRuleHandled !== true) {
    blueprints[i] = null
  }
}

// Remove non-rules
blueprints = blueprints.filter((blueprint) => blueprint !== null)



// Handle variants
blueprints.forEach((blueprint) => {
  let variants = blueprint.variants

  while (true) {
    // All variants have been handled, or there is no variant to handle
    if (variants === "") {
      break
    }

    for (let i in config.variants) {
      [variants, blueprint] = config.variants[i](variants, blueprint)

      // All variants have been handled
      if (variants === "") {
        break
      }
    }
  }
})



logStage(
  "Done\n" +
  "Sorting styles..."
)



// Styles will be grouped by layers and CSS bodies in this Map
let scaffolding = new Map()

// Initialize scaffolding with layers
config.layers.getAll().forEach((layer) => {
  scaffolding.set(layer, new Map())
})

// Add blueprints to scaffolding
blueprints.forEach((blueprint) => {
  if (scaffolding.get(blueprint.layer).has(blueprint.css.body)) {
    // Add to initialized array
    scaffolding.get(blueprint.layer).get(blueprint.css.body).push(blueprint)
  }
  else {
    // Initialize array for this CSS body
    scaffolding.get(blueprint.layer).set(blueprint.css.body, [blueprint])
  }
})



logStage(
  "Done\n" +
  `Writing styles to "${config.outputFilepath}"...\n\n` +
  "If you got a \"no such file or directory\" error, " +
  "then you might have to create the directory first"
)



let outputFileStream = fs.createWriteStream(config.outputFilepath)

outputFileStream.write("/* Generated by USaC */\n")

scaffolding.forEach((scaffold_layer, layer) => {
  // Skip layer if there's no rules in the layer
  if (scaffold_layer.size <= 0) {
    return
  }



  let indentLevel = 0

  function indent() {
    return "  ".repeat(indentLevel)
  }



  // Layer header
  outputFileStream.write(`\n\n\n/* Layer: ${layer} */\n`)

  // Layer specific headers are defined here
  switch (layer) {
    case config.layers.get("icons"):
      const icon_data = getIconData(
        JSON.parse(fs.readFileSync("node_modules/@iconify/json/json/bi.json")),
        "123"
      )
      const icon_css = getIconCSS(icon_data)
      const icon_css_body = icon_css
        .substring(
          icon_css.indexOf("{"),
          icon_css.lastIndexOf("--svg")
        )
        .replace(/\s*width: 1em;\s*height: 1em;/, "")
        .trim()

      outputFileStream.write(
        ":where(\n" +
        "  .icon-base\n" +
        `) ${icon_css_body}\n` +
        "}\n\n"
      )
      break

    case config.layers.get("rules - 500px breakpoint - max-width"):
      outputFileStream.write("@media screen and (max-width: 500px) {\n")
      indentLevel++
      break

    case config.layers.get("rules - 500px breakpoint - min-width"):
      outputFileStream.write("@media screen and (min-width: 500px) {\n")
      indentLevel++
      break

    case config.layers.get("rules - 1000px breakpoint - max-width"):
      outputFileStream.write("@media screen and (max-width: 1000px) {\n")
      indentLevel++
      break

    case config.layers.get("rules - 1000px breakpoint - min-width"):
      outputFileStream.write("@media screen and (min-width: 1000px) {\n")
      indentLevel++
      break

    case config.layers.get("variants - :hover"):
      outputFileStream.write("@media (hover: hover) and (pointer: fine) {\n")
      indentLevel++
      break
  }



  // Generated styles
  let i = 0

  scaffold_layer.forEach((scaffold_cssBody, cssBody) => {
    // Selector
    outputFileStream.write(`${indent()}:where(\n`)
    indentLevel++

    scaffold_cssBody.forEach((blueprint, index) => {
      outputFileStream.write(`${indent()}${blueprint.css.selector}`)

      if (index !== scaffold_cssBody.length - 1) {
        outputFileStream.write(`,`)
      }

      outputFileStream.write("\n")
    })
    indentLevel--

    outputFileStream.write(`${indent()}) {\n`)
    indentLevel++

    // Body
    outputFileStream.write(`${indent()}${cssBody};\n`)
    indentLevel--

    // End of selector
    outputFileStream.write(`${indent()}}\n`)

    // To prevent writing an extra newline for the last style
    i++

    if (i !== scaffold_layer.size) {
      outputFileStream.write("\n")
    }
  })



  // Layer footer
  // Layer specfic footers are defined here
  switch (layer) {
    case config.layers.get("rules - 500px breakpoint - max-width"):
    case config.layers.get("rules - 500px breakpoint - min-width"):
    case config.layers.get("rules - 1000px breakpoint - max-width"):
    case config.layers.get("rules - 1000px breakpoint - min-width"):
    case config.layers.get("variants - :hover"):
      indentLevel--
      outputFileStream.write("}\n")
  }
})



if (cli_flags.shortenClassNames) {
  logStage(
    "Done\n" +
    "Mapping class names to IDs..."
  )



  let shortenClassNames_mapping = []

  const BASE_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const BASE_NUMBER = BASE_CHARACTERS.length
  let id = [0, 0, 0, 0, 0, 0]



  function id_increment() {
    id[id.length - 1]++

    // For easier looping, instead of looping backwards
    id.reverse()

    // Handle carry
    id.forEach((x, i, id) => {
      if (x >= BASE_NUMBER) {
        if (i >= id.length - 1) {
          throw new Error(
            "E-5\n\n" +
            "All possible IDs have been used\n\n" +
            `id: ${id.reverse()}\n` +
            `BASE_NUMBER: ${BASE_NUMBER}\n`
          )
        }

        id[i + 1] += Math.trunc(x / BASE_NUMBER)
        id[i] = x % BASE_NUMBER
      }
    })

    id.reverse()
  }

  function id_convertToBaseCharacters() {
    let id_string = ""

    id.forEach((x) => {
      id_string += BASE_CHARACTERS.charAt(x)
    })

    return id_string
  }



  scaffolding.forEach((scaffold_layer) => {
    scaffold_layer.forEach((scaffold_cssBody) => {
      scaffold_cssBody.forEach((blueprint) => {
        // Assign ID if class name has not been assigned one
        if (Object.hasOwn(shortenClassNames_mapping, blueprint.className_escaped) === false) {
          shortenClassNames_mapping.push({
            className: blueprint.className,
            className_escaped: blueprint.className_escaped,
            id: id_convertToBaseCharacters()
          })

          id_increment()
        }
      })
    })
  })



  // Output to console for plugins to use via NodeJS' `child_process.execSync()`
  // `node` will also escape "\", so you have to replace 4 "\" to 2 "\" to revert the behavior
  console.dir(
    JSON.stringify({shortenClassNames_mapping}),
    {depth: null, maxArrayLength: null, maxStringLength: null}
  )
}



logStage(
  "\nDone\n\n" +
  "Thank you for using USaC\n"
)
