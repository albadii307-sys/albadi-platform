'use client';

import { useState } from 'react';
import { SERVICE_ICONS } from '@/components/service-icon';

export default function IconPicker({
  name,
  label,
  defaultValue,
  help,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  help?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? '');

  return (
    <div className="a-field full">
      <label>{label}</label>
      <input type="hidden" name={name} value={value} />
      <div className="icon-picker" role="group" aria-label={label}>
        <button
          type="button"
          className={`icon-choice auto${value ? '' : ' is-active'}`}
          onClick={() => setValue('')}
          aria-pressed={!value}
        >
          تلقائي حسب القطاع
        </button>
        {SERVICE_ICONS.map(({ key, label: iconLabel, Icon }) => (
          <button
            key={key}
            type="button"
            className={`icon-choice${value === key ? ' is-active' : ''}`}
            onClick={() => setValue(key)}
            aria-pressed={value === key}
            aria-label={iconLabel}
            title={iconLabel}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      {help ? <span className="a-help">{help}</span> : null}
    </div>
  );
}
