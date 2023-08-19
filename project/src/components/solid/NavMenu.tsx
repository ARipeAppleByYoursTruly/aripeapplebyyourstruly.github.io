let button: HTMLButtonElement
let div: HTMLDivElement

/*
<class="
  height:136px
  transform:rotate(180deg)
">
*/



export default function NavMenu() {
  return (
    <>
      {/* Mobile */}
      <button
        ref={ button }
        class="
          button-icon

          @non-mobile@display:none
        "
        onClick={() => {
          // console.log(div.scrollHeight)
          div.classList.toggle("height:136px")
          button.classList.toggle("transform:rotate(180deg)")
        }}
      >
        <div class="icon_material-symbols_expand-more-rounded"></div>
      </button>
      <div
        ref={ div }
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
