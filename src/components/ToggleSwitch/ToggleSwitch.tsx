import React, { type FC } from 'react'
import cn from 'classnames'
import s from './ToggleSwitch.module.scss'

type ToggleSwitchProps = {
  isOn: boolean
  label: string
  onClick: () => any
}

export const ToggleSwitch: FC<ToggleSwitchProps> = ({ isOn, onClick, label }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(s.ToggleSwitch, {
        [s.isActive]: isOn
      })}
    >
      {label}
    </button>
  )
}
