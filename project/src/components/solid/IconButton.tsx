export default function IconButton(props: {
  ref?: HTMLButtonElement,
  tooltipText: string,
  tooltipPosition?: string,
  iconClassName: string,
  class?: string,
  onClick?: Function
}) {
  let tooltip: HTMLDivElement
  let timer: number

  let isFocused = false



  return (
    <button
      ref={props.ref}
      class={`
        position:relative
        -webkit-tap-highlight-color:transparent

        ${props.class ? props.class : ""}
      `}
      onPointerEnter={(event) => {
        // Touch again after long hold to hide tooltip
        if (event.pointerType === "touch" && !tooltip.classList.contains("opacity:0")) {
          tooltip.classList.add("opacity:0")
          return
        }

        // Show tooltip after long hold or hover
        timer = setTimeout(() => {
          tooltip.classList.remove("opacity:0")
        }, 600)
      }}
      onPointerLeave={(event) => {
        clearTimeout(timer)

        // Prevent hiding tooltip from mouse when tabbed into focus
        if (isFocused) {
          return
        }

        // Tooltip stays visible after long hold
        if (event.pointerType !== "touch") {
          tooltip.classList.add("opacity:0")
        }
      }}
      onFocus={(event) => {
        // Show tooltip when tabbed into focus
        if (event.target.matches(":focus-visible")) {
          tooltip.classList.remove("opacity:0")
          isFocused = true
        }
      }}
      onBlur={() => {
        // Hide tooltip when tabbed out of focus
        tooltip.classList.add("opacity:0")
        isFocused = false
      }}
      onClick={() => {
        props.onClick ? props.onClick() : ""
      }}
    >
      <div class={props.iconClassName} inert></div>
      <div
        ref={tooltip!}
        inert
        class={`
          width:max-content
          max-width:300%
          padding:10px
          border-radius:100px
          font-size:0.8rem

          position:absolute
          ${getTooltipPositionClassNames(props.tooltipPosition)}

          opacity:0

          apply-transition
          transition-property:opacity
        `}
      >{props.tooltipText}</div>
    </button>
  )
}



function getTooltipPositionClassNames(tooltipPosition?: string) {
  /*
  <class="
    bottom:100%
    left:50%
    transform:translate(-50%,-5px)

    top:100%
    transform:translate(-50%,5px)

    right:100%
    top:50%
    transform:translate(-5px,-50%)

    left:100%
    transform:translate(5px,-50%)
  ">
  */



  if (tooltipPosition === undefined) {
    tooltipPosition = "top"
  }

  switch (tooltipPosition) {
    case ("top"):
      return `
        bottom:100%
        left:50%
        transform:translate(-50%,-5px)
      `

    case ("bottom"):
      return `
        top:100%
        left:50%
        transform:translate(-50%,5px)
      `

    case ("left"):
      return `
        right:100%
        top:50%
        transform:translate(-5px,-50%)
      `

    case ("right"):
      return `
        left:100%
        top:50%
        transform:translate(5px,-50%)
      `
  }
}
