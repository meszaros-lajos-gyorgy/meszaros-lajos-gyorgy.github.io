import React, { type ReactNode, type FC } from 'react'
import cn from 'classnames'
import { Button } from '@components/Button/Button'
import s from './ToggleSwitch.module.scss'

type ToggleSwitchProps = {
  isOn: boolean
  onClick: () => Promise<void> | void
  children: ReactNode
  smooth?: boolean
}

export const ToggleSwitch: FC<ToggleSwitchProps> = ({ isOn, onClick, children, smooth = false }) => {
  return (
    <Button onClick={onClick} className={cn(s.ToggleSwitch, { [s.smooth]: smooth })} theme={isOn ? 'light' : 'dark'}>
      {children}
    </Button>
  )
}
