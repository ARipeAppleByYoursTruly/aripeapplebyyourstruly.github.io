import {type ParentProps} from "solid-js"



function onPointerEnter(
  event: PointerEvent,
  args_toReturn: {
    tooltip: HTMLDivElement,
    timer: number
  }
) {
  // Touch again after long hold to hide tooltip
  if (
    event.pointerType === "touch" &&
    args_toReturn.tooltip.style.opacity !== "0"
  ) {
    args_toReturn.tooltip.style.opacity = "0"

    return args_toReturn
  }

  // Show tooltip after long hold or hover
  args_toReturn.timer = setTimeout(() => {
    args_toReturn.tooltip.style.opacity = "100%"
  }, 600)

  return args_toReturn
}

function onPointerLeave(
  event: PointerEvent,
  args_toReturn: {
    tooltip: HTMLDivElement,
    timer: number,
    isFocused: boolean
  }
) {
  clearTimeout(args_toReturn.timer)

  // Prevent hiding tooltip from mouse when tabbed into focus
  if (args_toReturn.isFocused) {
    return args_toReturn
  }

  // Tooltip stays visible after long hold
  if (event.pointerType !== "touch") {
    args_toReturn.tooltip.style.opacity = "0"
  }

  return args_toReturn
}

function onPointerUp(
  event: PointerEvent,
  args_toReturn: {
    tooltip: HTMLDivElement,
    timer: number
  }
) {
  // Show tooltip again after clicking
  if (event.pointerType === "mouse") {
    args_toReturn.tooltip.style.opacity = "0"

    clearTimeout(args_toReturn.timer)

    args_toReturn.timer = setTimeout(() => {
      args_toReturn.tooltip.style.opacity = "100%"
    }, 1500)
  }

  return args_toReturn
}

function onFocus(
  event: FocusEvent & {target: Element},
  args_toReturn: {
    tooltip: HTMLDivElement,
    isFocused: boolean
  }
) {
  // Show tooltip when tabbed into focus
  if (event.target.matches(":focus-visible")) {
    args_toReturn.tooltip.style.opacity = "100%"
    args_toReturn.isFocused = true
  }

  return args_toReturn
}

function onBlur(args_toReturn: {
  tooltip: HTMLDivElement,
  isFocused: boolean
}) {
  // Hide tooltip when tabbed out of focus
  args_toReturn.tooltip.style.opacity = "0"
  args_toReturn.isFocused = false

  return args_toReturn
}



interface Props_Base extends ParentProps {
  ref?: Element,

  tooltip: {
    text: string,
    position?: "top" | "bottom" | "left" | "right"
  },
  untabbable?: boolean,

  class?: string,

  onClick?: (event?: MouseEvent) => void
}

export function Button_WithTooltip(props: Props_Base) {
  let tooltip: HTMLDivElement
  let timer: number

  let isFocused = false



  return (
    <button
      ref={props.ref as HTMLButtonElement}

      // For text-to-speech accessibility
      aria-label={props.tooltip.text}
      {...(props.untabbable ? {tabIndex: "-1"} : {})}

      class={`
        position:relative
        ${props.class ? props.class : ""}
      `}

      onPointerEnter={(event) => {
        ({tooltip, timer} = onPointerEnter(event, {tooltip, timer}))
      }}
      onPointerLeave={(event) => {
        ({tooltip, timer, isFocused} = onPointerLeave(event, {tooltip, timer, isFocused}))
      }}
      onPointerUp={(event) => {
        ({tooltip, timer} = onPointerUp(event, {tooltip, timer}))
      }}
      onFocus={(event) => {
        ({tooltip, isFocused} = onFocus(event, {tooltip, isFocused}))
      }}
      onBlur={() => {
        ({tooltip, isFocused} = onBlur({tooltip, isFocused}))
      }}

      onClick={() => {
        if (props.onClick !== undefined) {
          props.onClick()
        }
      }}
    >
      <Tooltip
        ref={tooltip!}
        tooltip={{
          text: props.tooltip.text,
          position: props.tooltip.position
        }}
      />

      {props.children}
    </button>
  )
}



interface Props_Anchor extends Props_Base {
  href: string
}

export function Anchor_WithTooltip(props: Props_Anchor) {
  let tooltip: HTMLDivElement
  let timer: number

  let isFocused = false



  return (
    <a
      ref={props.ref as HTMLAnchorElement}

      href={props.href}
      // For text-to-speech accessibility
      aria-label={props.tooltip.text}
      {...(props.untabbable ? {tabIndex: "-1"} : {})}

      class={`
        position:relative
        ${props.class ? props.class : ""}
      `}

      onPointerEnter={(event) => {
        ({tooltip, timer} = onPointerEnter(event, {tooltip, timer}))
      }}
      onPointerLeave={(event) => {
        ({tooltip, timer, isFocused} = onPointerLeave(event, {tooltip, timer, isFocused}))
      }}
      onPointerUp={(event) => {
        ({tooltip, timer} = onPointerUp(event, {tooltip, timer}))
      }}
      onFocus={(event) => {
        ({tooltip, isFocused} = onFocus(event, {tooltip, isFocused}))
      }}
      onBlur={() => {
        ({tooltip, isFocused} = onBlur({tooltip, isFocused}))
      }}

      onClick={() => {
        if (props.onClick !== undefined) {
          props.onClick()
        }
      }}
    >
      <Tooltip
        ref={tooltip!}
        tooltip={{
          text: props.tooltip.text,
          position: props.tooltip.position
        }}
      />

      {props.children}
    </a>
  )
}






function tooltip_getPositionClassNames(position: string = "top") {
  /* class="
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
  " */



  switch (position) {
    case "top":
      return `
        bottom:100%
        left:50%
        transform:translate(-50%,-5px)
      `

    case "bottom":
      return `
        top:100%
        left:50%
        transform:translate(-50%,5px)
      `

    case "left":
      return `
        right:100%
        top:50%
        transform:translate(-5px,-50%)
      `

    case "right":
      return `
        left:100%
        top:50%
        transform:translate(5px,-50%)
      `
  }
}



function Tooltip(props: {
  ref: HTMLDivElement,
  tooltip: {
    text: string,
    position?: string
  }
}) {
  return (
    <div
      ref={props.ref}
      inert
      class={`
        position:absolute
        ${tooltip_getPositionClassNames(props.tooltip.position)}
        z-index:9999

        opacity:0
      `}
    >
      {props.tooltip.text}
    </div>
  )
}
