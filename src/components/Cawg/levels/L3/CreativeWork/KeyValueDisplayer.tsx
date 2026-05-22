import React from 'react';

export interface KeyValueDisplayerProps {
  label: string;
  value: React.ReactNode;
}

export default function KeyValueDisplayer({ label, value }: KeyValueDisplayerProps) {
  if (!value) return null;

  // If value is an array, we might want to join it or map it, 
  // but for now let's handle basic string/node display.
  
  return (
    <div className="cawg-key-value">
      <div className="cawg-key-value-label">{label}</div>
      <div className="cawg-key-value-value">{value}</div>
    </div>
  );
}
