import React, { FC, useState } from 'react'
import cn from 'classnames'
import s from './ToggleSwitch.module.scss'

type ToggleSwitchProps = {
  isOn: boolean
  onClick: () => any
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
        [s.isActive]: (isOn && !isChanging) || (!isOn && isChanging)
      })}
    >
      {isChanging ? 'turning ' + (isOn ? 'off' : 'on') : '' + (isOn ? 'on' : 'off')}
    </button>
  )
}
