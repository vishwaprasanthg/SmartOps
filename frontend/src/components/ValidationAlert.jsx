import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ValidationAlert({ error }) {
  if (!error) return null;

  return (
    <div className="alert-banner alert-danger" role="alert">
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong>Validation Error: </strong>
        <span>{error}</span>
      </div>
    </div>
  );
}
