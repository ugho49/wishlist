/// <reference types="vite-plugin-svgr/client" />
import FacebookIconSvg from '../../assets/icons/facebook.svg?react'
import GoogleIconSvg from '../../assets/icons/google.svg?react'

const icons = {
  facebook: FacebookIconSvg,
  google: GoogleIconSvg,
}

export type CustomIconProps = {
  name: keyof typeof icons
  style?: React.CSSProperties
}

export const CustomIcon = ({ name, style }: CustomIconProps) => {
  if (!icons[name]) {
    return null
  }

  const Icon = icons[name]

  return <Icon style={style} />
}
