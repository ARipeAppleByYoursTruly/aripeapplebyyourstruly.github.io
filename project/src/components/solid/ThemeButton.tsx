import {createSignal} from "solid-js"
import IconButton from "./IconButton"



export default function ThemeButton() {
  const [isDarkTheme, set_isDarkTheme] = createSignal((() => {
    if (localStorage !== undefined && localStorage.getItem("theme")) {
      return (localStorage.getItem("theme")! === "dark")
    }
    else {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
  })())

  /*
  <class="
    icon_material-symbols_dark-mode-outline-rounded
    icon_material-symbols_light-mode-outline
  ">
  */



  return (
    <IconButton
      tooltipText={isDarkTheme() ?
        "Switch to light mode" :
        "Switch to dark mode"
      }
      tooltipPosition="left"
      iconClassName={isDarkTheme() ?
        "icon_material-symbols_dark-mode-outline-rounded" :
        "icon_material-symbols_light-mode-outline"
      }
      class="
        button-icon

        margin-left:10px
        transition:none
      "
      onClick={() => {
        set_isDarkTheme(!isDarkTheme())

        if (isDarkTheme()) {
          document.querySelector("body")?.classList.add("dark")
        }
        else {
          document.querySelector("body")?.classList.remove("dark")
        }

        window.localStorage.setItem("theme", isDarkTheme() ? "dark" : "light")
      }}
    />
  )
}
