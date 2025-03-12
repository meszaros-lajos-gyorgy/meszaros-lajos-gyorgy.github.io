import React, { type ReactNode, type FC } from 'react'
import cn from 'classnames'
import s from './Button.module.scss'

type ButtonThemes = 'dark' | 'light'

type ButtonProps = {
  children: ReactNode
  onClick?: () => Promise<void> | void
  className?: string
  theme?: ButtonThemes
}

export const Button: FC<ButtonProps> = ({ children, onClick, className, theme = 'light' }) => {
  return (
    <button type="button" className={cn(s.Button, className)} onClick={onClick} data-theme={theme}>
      {children}
    </button>
  )
}
