import React, { FC, useState } from 'react'
import cn from 'classnames'
import s from './ToggleSwitch.module.scss'

type ToggleSwitchProps = {
  isOn: boolean
  onClick: () => Promise<void>
}

export const ToggleSwitch: FC<ToggleSwitchProps> = ({ isOn, onClick }) => {
  const [isChanging, setIsChanging] = useState(false)

  const handleOnClick = async () => {
    if (isChanging) {
      return
    }

    setIsChanging(true)
    await onClick()
    setIsChanging(false)
  }

  return (
    <button
      onClick={handleOnClick}
      className={cn(s.ToggleSwitch, {
        [s.on]: isOn,
        [s.off]: !isOn,
        [s.changing]: isChanging
      })}
    >
      {isChanging ? 'turning ' + (isOn ? 'off' : 'on') : '' + (isOn ? 'on' : 'off')}
    </button>
  )
}
