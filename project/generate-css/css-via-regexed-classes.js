import fg from "fast-glob"
import fs from "node:fs"
import cssesc from "cssesc"
import { getIconData, getIconCSS } from "@iconify/utils"



// Extract class names from codebase
// ===
console.log("Extracting class names ...")



// Files to extract class names from
const files = fg.sync([
  "src/**/*.astro",
  "src/**/*.tsx"
])



// Part 1 - Extract class values
// ===
let classValues = []

files.forEach((file) => {
  const fileContent = fs.readFileSync(file, "utf-8")
  const htmlTags = fileContent.match(/<(?!\/)[^<]+(?:>|\/>)/g)

  if (htmlTags === null) {
    return
  }



  htmlTags.forEach((htmlTag) => {
    const normalizedHtmlTag = htmlTag.replaceAll(/\s+/g, " ")



    let classMatch = normalizedHtmlTag.match(/class\s*=\s*((?:'|"|{).+)/)

    if (classMatch !== null) {
      classMatch = classMatch[1]

      if (classMatch.startsWith("{")) {
        let classValue = ""
        let depth = 0

        for (let i = 0; i < classMatch.length; i++) {
          let char = classMatch[i]

          classValue += char

          if (char === "{") {
            depth++
            continue
          }
          else if (char === "}") {
            depth--

            if (depth === 0) {
              break
            }
          }
        }

        classValues.push(classValue)
      }



      else if (classMatch.startsWith("'") || classMatch.startsWith("\"")) {
        let classValue = ""
        let startChar = classMatch[0]

        for (let i = 0; i < classMatch.length; i++) {
          let char = classMatch[i]

          classValue += char

          if (char === startChar && i !== 0) {
            break
          }
        }

        classValues.push(classValue)
      }
    }
  })
})



// Part 2 - Extract class names
// ===
let classNames = []

classValues.forEach((classValue) => {
  while (true) {
    // {...}
    if (classValue.startsWith("{")) {
      classValue = classValue.substring(1, classValue.length - 1).trim()



      // Check for `...`
      let toBeCheckedAgain = classValue.match(/`[^`]+`/g)

      if (toBeCheckedAgain !== null) {
        toBeCheckedAgain.forEach((result, i) => {
          classValue = classValue.replace(result, "")

          toBeCheckedAgain[i] = result.substring(1, result.length - 1).trim()
        })
      }



      // Extract '...' and "..."
      // But not the ones used in comparison
      // { asd === "won't-be-matched" ? "will-be-matched" : "will-be-matched" }
      let toBeAdded = classValue.match(/'(?!\s\?\s)[^']+'(?!\s\?)|"(?!\s\?\s)[^"]+"(?!\s\?)/g)

      if (toBeAdded !== null) {
        toBeAdded.forEach(result => {
          classNames.push(...result.substring(1, result.length - 1).trim().split(" "))
        })
      }



      // Continue the loop if there's any `...`
      if (toBeCheckedAgain !== null) {
        classValue = "`"

        toBeCheckedAgain.forEach(result => {
          classValue += `${result} `
        })

        classValue = `${classValue.trim()}\``
      }
    }



    // `...`
    else if (classValue.startsWith("`")) {
      classValue = classValue.substring(1, classValue.length - 1).trim()



      // Check for ${...}
      let toBeCheckedAgain = classValue.match(/\${[^$]+}/g)

      if (toBeCheckedAgain !== null) {
        toBeCheckedAgain.forEach((result, i) => {
          classValue = classValue.replace(result, "")

          toBeCheckedAgain[i] = result.substring(2, result.length - 1).trim()
        })
      }



      // Extract
      let toBeAdded = classValue.trim().split(" ")

      if (toBeAdded !== null) {
        classNames.push(...toBeAdded)
      }



      // Continue the loop if there's any ${...}
      if (toBeCheckedAgain !== null) {
        classValue = "{"

        toBeCheckedAgain.forEach(result => {
          classValue += `${result} `
        })

        classValue = `${classValue.trim()}}`
      }
    }



    // '...' or "..."
    else if (classValue.startsWith("'") || classValue.startsWith("\"")) {
      classValue = classValue.substring(1, classValue.length - 1).trim()


      // Extract
      let toBeAdded = classValue.trim().split(" ")

      if (toBeAdded !== null) {
        classNames.push(...toBeAdded)
      }
    }



    else {
      // console.log("=============================")
      // console.log("Infinite Loop Exit Checkpoint")
      // console.log("=============================")
      // console.log("htmlTag")
      // console.log(htmlTag)
      // console.log()
      // console.log("classNames")
      // console.log(classNames)
      // console.log("=============================\n")

      return
    }
  }
})



// Remove duplicates
classNames = Array.from(new Set(classNames))



console.log("Done")
// Generate styles based on the extracted class names
// ===
console.log("Generating styles ...")



// Part 1 - Replace all shortcuts with their rules
// ===
let blueprints = classNames.map((className) => {
  let blueprint = {
    className: className,
    styles: [{
      rule: className,
      layer: ""
    }],
    generatedStyles: []
  }



  let usesShortcuts

  while (true) {
    usesShortcuts = false



    blueprint.styles = blueprint.styles.flatMap(({ rule, layer }) => {
      // Ignore variants
      let variants = rule.match(/^([^?]*)\?/)

      if (variants !== null) {
        rule = rule.replace(variants[0], "")
        variants = variants[1]
      }



      function convertToArray(rulesAndShortcuts) {
        return rulesAndShortcuts.replaceAll(/\s+/g, " ").trim().split(" ")
      }

      function inheritVariants(ruleOrShortcut) {
        if (variants === null) {
          return ruleOrShortcut
        }

        if (ruleOrShortcut.indexOf("?") >= 0) {
          return `${variants}${ruleOrShortcut}`
        }
        else {
          return `${variants}?${ruleOrShortcut}`
        }
      }

      function checkForRecursion(ruleOrShortcut, shortcutMatch) {
        if (ruleOrShortcut === shortcutMatch[0]) {
          throw new Error(
            "A shortcut MUST NOT contain itself! " +
            "Beacuse it will cause infinite recursion!"
          )
        }
      }

      let shortcutMatch



      // Template
      /*
      shortcutMatch = rule.match(/^your-regex-here$/)

      if (shortcutMatch !== null) {
        // Comment this out if this shortcut doesn't use other shortcuts
        usesShortcuts = true

        // Optional logic here

        // The shortcut MUST NOT contain iteself
        let rulesAndShortcuts = `
          your rules and shortcuts here
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          // Optional logic here
          // You could use this to assign a different layer to a specific rule or shortcut

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "your layer here"
          }
        })
      }
      */



      shortcutMatch = rule.match(/^real-hover!(.+)$/)

      if (shortcutMatch !== null) {
        // usesShortcuts = true

        let rulesAndShortcuts

        if (shortcutMatch[1].indexOf("?") >= 0) {
          rulesAndShortcuts = `:hover${shortcutMatch[1]}`
        }
        else {
          rulesAndShortcuts = `:hover?${shortcutMatch[1]}`
        }

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "real hover"
          }
        })
      }



      shortcutMatch = rule.match(/^apply-transition$/)

      if (shortcutMatch !== null) {
        // usesShortcuts = true

        let rulesAndShortcuts = `
          transition-timing-function:cubic-bezier(.7,1,.7,1)
          transition-duration:.2s
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "shortcuts"
          }
        })
      }



      shortcutMatch = rule.match(/^modify-outline$/)

      if (shortcutMatch !== null) {
        // usesShortcuts = true

        let rulesAndShortcuts = `
          :focus-visible?outline:3px_solid_var(--accentOnHover)
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "real hover"
          }
        })
      }



      shortcutMatch = rule.match(/^button-icon$/)

      if (shortcutMatch !== null) {
        usesShortcuts = true

        let rulesAndShortcuts = `
          background:none
          real-hover!background-color:var(--backgroundOnHover)
          :focus-visible?background-color:var(--backgroundOnHover)
          :active?background-color:var(--backgroundOnClick)

          color:var(--accent)
          real-hover!color:var(--accentOnHover)
          :focus-visible?color:var(--accentOnHover)
          :active?color:var(--accentOnClick)

          modify-outline

          border:none
          border-radius:50%
          padding:10px
          cursor:pointer

          apply-transition
          transition-property:color,background-color



          _div:first-child?display:block
          _div:first-child?width:50px
          _div:first-child?height:50px

          _div:nth-child(2)?background:var(--container)
          _div:nth-child(2)?color:var(--onBackground)
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "shortcuts"
          }
        })
      }



      shortcutMatch = rule.match(/^link-text$/)

      if (shortcutMatch !== null) {
        usesShortcuts = true

        let rulesAndShortcuts = `
          color:var(--accent)
          real-hover!color:var(--accentOnHover)
          :focus-visible?color:var(--accentOnHover)
          :active?color:var(--accentOnClick)

          text-decoration:none
          real-hover!text-decoration:revert
          :focus-visible?text-decoration:revert

          modify-outline
          outline-offset:8px
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "shortcuts"
          }
        })
      }



      shortcutMatch = rule.match(/^devonly-bg$/)

      if (shortcutMatch !== null) {
        // usesShortcuts = true

        let rulesAndShortcuts = `
          background-color:rgba(255,0,0,0.1)
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "shortcuts"
          }
        })
      }



      shortcutMatch = rule.match(/^devonly-bg-on-all$/)

      if (shortcutMatch !== null) {
        // usesShortcuts = true

        let rulesAndShortcuts = `
          background-color:rgba(255,0,0,0.1)
          _*?background-color:rgba(255,0,0,0.1)
        `

        return convertToArray(rulesAndShortcuts).map((ruleOrShortcut) => {
          checkForRecursion(ruleOrShortcut, shortcutMatch)

          return {
            rule: inheritVariants(ruleOrShortcut),
            layer: "shortcuts"
          }
        })
      }



      // Not a shortcut
      return {
        rule: inheritVariants(rule),
        layer: layer
      }
    })



    if (!usesShortcuts) {
      break
    }
  }



  return blueprint
})



// Part 2 - Handle variants and build the selector of each style
// ===
blueprints.forEach((blueprint) => {
  blueprint.generatedStyles = blueprint.styles.map(({ rule, layer }) => {
    let generatedStyle = {
      selector: `.${cssesc(blueprint.className, { isIdentifier: true })}`,
      body: "",
      layer: layer
    }



    let variants = rule.match(/^(.+)\?/)

    if (variants === null) {
      return generatedStyle
    }

    variants = variants[1]



    let variantRegex
    let variantTransformation

    while (true) {
      // Descendent combinator
      if (variants.startsWith("_")) {
        variantRegex = /^_([^_>~+:]*)/
        variantTransformation = " "
      }
      // Child combinator
      else if (variants.startsWith(">")) {
        variantRegex = /^>([^_>~+:]*)/
        variantTransformation = " > "
      }
      // General sibling combinator
      else if (variants.startsWith("~")) {
        variantRegex = /^~([^_>~+:]*)/
        variantTransformation = " ~ "
      }
      // Adjacent sibling combinator
      else if (variants.startsWith("+")) {
        variantRegex = /^\+([^_>~+:]*)/
        variantTransformation = " + "
      }
      // Pseudo-element selector
      else if (variants.startsWith("::")) {
        variantRegex = /^::([^_>~+:]*)/
        variantTransformation = "::"
      }
      // Pseudo-class selector
      else if (variants.startsWith(":")) {
        variantRegex = /^:([^_>~+:]*)/
        variantTransformation = ":"
      }
      else {
        // console.log("=============================")
        // console.log("Infinite Loop Exit Checkpoint")
        // console.log("=============================")
        // console.log("rule")
        // console.log(rule)
        // console.log()
        // console.log("generatedStyle.selector")
        // console.log(generatedStyle.selector)
        // console.log("=============================\n")

        break
      }



      const variantMatch = variants.match(variantRegex)

      if (variantMatch !== null) {
        generatedStyle.selector += `${variantTransformation}${variantMatch[1]}`

        variants = variants.replace(variantMatch[0], "")
      }
    }



    return generatedStyle
  })
})



// Part 3 - Build the body of each rule
// ===
blueprints.forEach((blueprint) => {
  blueprint.styles.forEach(({ rule }, i) => {
    // Remove variants as they've been handled
    if (rule.indexOf("?") >= 0) {
      rule = rule.substring(rule.indexOf("?") + 1)
    }



    let ruleMatch



    // Template
    /*
    ruleMatch = rule.match(/^your regex here$/)

    if (ruleMatch !== null) {
      // your logic here



      blueprint.generatedStyles[i].body = `your rule body here`

      if (blueprint.generatedStyles[i].layer === "") {
        blueprint.generatedStyles[i].layer = "your layer here"
      }

      return
    }
    */



    ruleMatch = rule.match(/^icon_(.+)_(.+)$/)

    if (ruleMatch !== null) {
      const iconifyData = getIconData(
        JSON.parse(fs.readFileSync(`node_modules/@iconify/json/json/${ruleMatch[1]}.json`)),
        ruleMatch[2]
      )

      const iconifyCSS = getIconCSS(iconifyData)

      const iconifyCSSBody = iconifyCSS.substring(
        iconifyCSS.indexOf("{") + 1,
        iconifyCSS.indexOf("}")
      )



      blueprint.generatedStyles[i].body = iconifyCSSBody.trim()

      if (blueprint.generatedStyles[i].layer === "") {
        blueprint.generatedStyles[i].layer = "icons"
      }

      return
    }



    ruleMatch = rule.match(/^@mobile@(.+):(.+)$/)

    if (ruleMatch !== null) {
      const cssValue = ruleMatch[2].replaceAll("_", " ")



      blueprint.generatedStyles[i].body = `${ruleMatch[1]}: ${cssValue};`

      if (blueprint.generatedStyles[i].layer === "") {
        blueprint.generatedStyles[i].layer = "mobile atomics"
      }

      return
    }



    ruleMatch = rule.match(/^@non-mobile@(.+):(.+)$/)

    if (ruleMatch !== null) {
      const cssValue = ruleMatch[2].replaceAll("_", " ")



      blueprint.generatedStyles[i].body = `${ruleMatch[1]}: ${cssValue};`

      if (blueprint.generatedStyles[i].layer === "") {
        blueprint.generatedStyles[i].layer = "non-mobile atomics"
      }

      return
    }



    ruleMatch = rule.match(/^(.+):(.+)$/)

    if (ruleMatch !== null) {
      const cssValue = ruleMatch[2].replaceAll("_", " ")



      blueprint.generatedStyles[i].body = `${ruleMatch[1]}: ${cssValue};`

      if (blueprint.generatedStyles[i].layer === "") {
        blueprint.generatedStyles[i].layer = "atomics"
      }

      return
    }
  })
})



console.log("Done")
// Sort the generated styles
// ===
console.log("Sorting styles ...")



const layers = [
  "icons",
  "real hover",
  "shortcuts",
  "atomics",
  "mobile atomics",
  "non-mobile atomics"
]



// Initialize arrays
let scaffolds = {}

layers.forEach((layer) => {
  scaffolds[layer] = []
})



// Sort by layer
blueprints.forEach((blueprint) => {
  blueprint.generatedStyles.forEach((generatedStyle) => {
    if (Object.hasOwn(scaffolds, generatedStyle.layer)) {
      scaffolds[generatedStyle.layer].push({
        selector: generatedStyle.selector,
        body: generatedStyle.body
      })
    }
  })
})



// Sort by selector
for (const layer in scaffolds) {
  scaffolds[layer].sort((a, b) => {
    return a.selector.localeCompare(b.selector)
  })
}



// Handle special sort cases
for (const layer in scaffolds) {
  scaffolds[layer].forEach((style, i) => {
    // Place :focus-visible before :active
    if (
      style.selector.endsWith(":active") &&
      style.selector[-8] !== "\\" &&
      scaffolds[layer].length > i + 1 &&
      scaffolds[layer][i + 1].selector.endsWith(":focus-visible") &&
      scaffolds[layer][i + 1].selector[-15] !== "\\"
    ) {
      let temp = scaffolds[layer][i]

      scaffolds[layer][i] = scaffolds[layer][i + 1]
      scaffolds[layer][i + 1] = temp
    }



    // Place :hover before :active
    if (
      style.selector.endsWith(":active") &&
      style.selector[-8] !== "\\" &&
      scaffolds[layer].length > i + 1 &&
      scaffolds[layer][i + 1].selector.endsWith(":hover") &&
      scaffolds[layer][i + 1].selector[-7] !== "\\"
    ) {
      let temp = scaffolds[layer][i]

      scaffolds[layer][i] = scaffolds[layer][i + 1]
      scaffolds[layer][i + 1] = temp
    }
  })
}



console.log("Done")
// Write sorted styles to file
// ===
const outputFilePath = "src/styles/generated-via-regexed-classes.css"
const outputFileStream = fs.createWriteStream(outputFilePath)

console.log(`Writing sorted styles to ${outputFilePath} ...`)



outputFileStream.write("/* Generated by generate-css-test.js */\n")

for (const layer in scaffolds) {
  if (scaffolds[layer].length <= 0) {
    continue
  }



  outputFileStream.write(`\n\n\n/* Layer: ${layer} */`)
  outputFileStream.write("\n/* === */")



  // Template
  /*
  else if (layer === "your layer here") {
    // your logic here
    // Media queries are handled here
  }
  */



  if (layer === "real hover") {
    outputFileStream.write("\n@media (hover: hover) and (pointer: fine) {")

    scaffolds[layer].forEach((style) => {
      outputFileStream.write(`\n  ${style.selector} {\n    ${style.body}\n  }\n`)
    })

    outputFileStream.write("}\n")
  }



  else if (layer === "mobile atomics") {
    outputFileStream.write("\n@media screen and (max-width: 499px) {")

    scaffolds[layer].forEach((style) => {
      outputFileStream.write(`\n  ${style.selector} {\n    ${style.body}\n  }\n`)
    })

    outputFileStream.write("}\n")
  }



  else if (layer === "non-mobile atomics") {
    outputFileStream.write("\n@media screen and (min-width: 500px) {")

    scaffolds[layer].forEach((style) => {
      outputFileStream.write(`\n  ${style.selector} {\n    ${style.body}\n  }\n`)
    })

    outputFileStream.write("}\n")
  }



  // Fallback
  else {
    scaffolds[layer].forEach((style) => {
      outputFileStream.write(`\n${style.selector} {\n  ${style.body}\n}\n`)
    })
  }
}



console.log(
  "Done\n\n\n\n" +

  "Please note that the styles are sorted by their selectors\n\n" +

  "If the result looks weird, please check the generated file\n" +
  "If the order is not what you expected,\n" +
  "consider placing the style in a new layer\n\n" +

  "Thank you for using css-via-regexed-classes.js\n\n\n"
)
