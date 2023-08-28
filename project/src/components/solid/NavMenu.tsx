import {createSignal} from "solid-js"
import IconButton from "./IconButton"



export default function NavMenu() {
  let [isOpened, set_isOpened] = createSignal(false)

  let button: HTMLButtonElement
  let div: HTMLDivElement

  /*
  <class="
    icon_material-symbols_expand-more-rounded
    height:136px
    transform:rotate(180deg)
  ">
  */



  return (
    <>
      {/* Mobile */}
      <IconButton
        ref={button!}
        tooltipText={isOpened() ?
          "Close navigation menu" :
          "Open navigation menu"
        }
        tooltipPosition="bottom"
        iconClassName="icon_material-symbols_expand-more-rounded"
        class="
          button-icon
          @non-mobile@display:none

          _div:first-child?apply-transition
          _div:first-child?transition-property:transform
          _div:first-child?transform-style:preserve-3d
        "
        onClick={() => {
          set_isOpened(!isOpened())

          // console.log(div.scrollHeight)
          div.classList.toggle("height:136px")
          button.querySelector("div:first-child")?.classList.toggle("transform:rotate(180deg)")
        }}
      />
      <div
        ref={div!}
        class="
          width:100%
          height:0
          overflow:hidden

          order:1
          display:flex
          flex-wrap:wrap

          apply-transition
          transition-property:height

          @non-mobile@display:none



          >a?link-text
          >a?outline-offset:-3px

          >a?width:100%
          >a?padding:1rem
          >a?border-top:1px_solid_var(--onBackground)
          >a?text-align:center

          >a?apply-transition
          >a?transition-property:color
        "
      >
        <a href="/">My Stuff</a>
        <a href="/about">About Me</a>
      </div>



      {/* Non-mobile */}
      <div
        class="
          flex-grow:1
          display:flex
          column-gap:20px

          margin:20px
          font-size:1.2rem

          @mobile@display:none



          >a?link-text

          >a?apply-transition
          >a?transition-property:color
        "
      >
        <a href="/">My Stuff</a>
        <a href="/about">About Me</a>
      </div>
    </>
  )
}
