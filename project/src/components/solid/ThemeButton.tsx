import {createSignal} from "solid-js"



const [isDarkTheme, set_isDarkTheme] = createSignal(checkTheme())



export default function ThemeButton() {
  return (
    <button
      class="
        button-icon

        margin-left:20px
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
    >
      <div
        class={isDarkTheme() ?
          "icon_material-symbols_dark-mode-outline-rounded" :
          "icon_material-symbols_light-mode-outline"
        }
      ></div>
    </button>
  )
}



function checkTheme(): boolean {
  if (localStorage !== undefined && localStorage.getItem("theme")) {
    return (localStorage.getItem("theme")! === "dark")
  }
  else {
    return window.matchMedia("(prefers-color-theme: dark)").matches
  }
}
