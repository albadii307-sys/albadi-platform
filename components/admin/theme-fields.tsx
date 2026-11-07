'use client';

import { useState } from 'react';

export function ThemeColorInput({
  id,
  name,
  label,
  defaultValue,
  help,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  help?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="a-field">
      <label htmlFor={id}>{label}</label>
      <div className="theme-color">
        <input id={id} name={name} type="color" value={value} onChange={(event) => setValue(event.target.value)} />
        <code dir="ltr">{value}</code>
      </div>
      {help ? <span className="a-help">{help}</span> : null}
    </div>
  );
}

export function ThemeRangeInput({
  id,
  name,
  label,
  defaultValue,
  help,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: number;
  help?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="a-field">
      <label htmlFor={id}>{label}</label>
      <div className="theme-range">
        <input
          id={id}
          name={name}
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
        <output htmlFor={id}>{value}%</output>
      </div>
      {help ? <span className="a-help">{help}</span> : null}
    </div>
  );
}
