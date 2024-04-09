import {createSignal, onMount} from "solid-js"

import {Anchor_WithTooltip, Button_WithTooltip} from "@components/solid/Components_WithTooltip.tsx"



function NavLinks() {
  return (
    <>
      <a href="/100-percent-guides">100% Guides</a>
      <a href="/other-stuff">Other Stuff</a>
      <a href="/about-me">About Me</a>
    </>
  )
}



export default function Header() {
  const [mobile_navMenu_isOpened, mobile_navMenu_isOpened_set] = createSignal(false)
  const [themeButton_isDarkTheme, themeButton_isDarkTheme_set] = createSignal(true)

  let mobile_navMenu!: HTMLElement
  let mobile_navMenu_button!: HTMLButtonElement
  let mobile_navMenu_button_icon!: HTMLDivElement



  onMount(() => {
    themeButton_isDarkTheme_set((() => {
      const theme_localStorage = localStorage.getItem("theme")

      if (localStorage.getItem("theme") !== null) {
        if (theme_localStorage === "dark") {
          return true
        }
        else {
          return false
        }
      }
      else {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
      }
    })())
  })



  return (
    <header class="@min:500px@border-bottom:1px_solid_var(--color-onBackground-base)">
      {/* Visible Header */}
      <div
        class="
          display:flex
          align-items:center
          column-gap:10px

          height:80px
        "
      >
        {/* Logo */}
        <Anchor_WithTooltip
          href="/"
          tooltip={{
            text: "Home",
            position: "bottom"
          }}
          class="
            styleAs-button-base

            border-radius:10px
            height:90%
            aspect-ratio:1/1

            apply-tooltipStyles
          "
        >
          <img
            src="/images/RipeApple/Logo.webp"
            alt="RipeApple's logo"
            decoding="async"
            inert
            class="height:100%"
          />
        </Anchor_WithTooltip>

        {/* Mobile - Expand nav menu button */}
        <Button_WithTooltip
          ref={mobile_navMenu_button}
          tooltip={{
            text: mobile_navMenu_isOpened() ? "Close navigation menu" : "Open navigation menu",
            position: "bottom"
          }}
          class="
            styleAs-button-icon
            margin-right:auto

            @min:500px@display:none



            >div:first-child?width:max-content

            >div:nth-child(2)?apply-transition
            >div:nth-child(2)?transition-property:transform
          "
          onClick={() => {
            if (mobile_navMenu_isOpened()) {
              mobile_navMenu.style.height = "0"
              mobile_navMenu_button_icon.style.transform = ""
            }
            else {
              mobile_navMenu.style.height = `${mobile_navMenu.scrollHeight}px`
              mobile_navMenu_button_icon.style.transform = "rotate(180deg)"
            }

            mobile_navMenu_isOpened_set(!mobile_navMenu_isOpened())
          }}
        >
          <div
            ref={mobile_navMenu_button_icon}
            inert
            class="
              icon-base
              icon_material-symbols_expand-more-rounded
            "
          ></div>
        </Button_WithTooltip>

        {/* Non-mobile - Nav links */}
        <nav
          class="
            display:flex
            column-gap:15px

            @max:500px@display:none

            >a?styleAs-link
            >a?text-align:center
            >a?flex-basis:fit-content
            flex-basis:min-content
            flex-grow:1
          "
        >
          <NavLinks/>
        </nav>

        {/* Ko-fi button */}
        <Anchor_WithTooltip
          href="https://ko-fi.com/Q5Q8T6PCK"
          tooltip={{
            text: "Support me on Ko-fi",
            position: "bottom"
          }}
          class="
            styleAs-button-icon

            >div:first-child?width:max-content
          "
        >
          <img
            src="/images/Ko-fi logo.webp"
            alt="Ko-fi's logo"
            decoding="async"
            inert
            class="padding:2.5px"
          />
        </Anchor_WithTooltip>

        {/* Theme button */}
        <Button_WithTooltip
          tooltip={{
            text: themeButton_isDarkTheme() ? "Switch to light theme" : "Switch to dark theme",
            position: "bottom"
          }}
          class="
            styleAs-button-icon

            >div:first-child?width:max-content
            >div:first-child?left:-35px
          "
          onClick={() => {
            let body = document.querySelector("body")!

            themeButton_isDarkTheme_set(!themeButton_isDarkTheme())

            // Disable transitions when switching themes
            body.classList.add("disable-transitions")

            setTimeout(() => {
              body.classList.remove("disable-transitions")
            }, 200)

            // Switch themes
            if (themeButton_isDarkTheme()) {
              body.classList.remove("light-theme")
            }
            else {
              body.classList.add("light-theme")
            }

            localStorage.setItem("theme", themeButton_isDarkTheme() ? "dark" : "light")
          }}
        >
          <div
            inert
            class={`
              icon-base
              ${themeButton_isDarkTheme() ?
                "icon_material-symbols_dark-mode-outline-rounded" :
                "icon_material-symbols_light-mode-outline-rounded"
              }
            `}
          ></div>
        </Button_WithTooltip>
      </div>



      {/* Mobile - Nav menu */}
      <nav
        ref={mobile_navMenu}
        class="
          border-bottom:1px_solid_var(--color-onBackground-base)

          display:flex
          flex-wrap:wrap
          align-items:center

          height:0
          overflow:hidden

          apply-transition
          transition-property:height

          @min:500px@display:none



          >a?styleAs-button-base
          >a?apply-interactive-textDecoration

          >a?border-top:1px_solid_var(--color-onBackground-base)
          >a?outline-offset:-3px

          >a?width:100%
          >a?padding:15px_0

          >a?text-align:center
        "
      >
        <NavLinks/>
      </nav>
    </header>
  )
}
