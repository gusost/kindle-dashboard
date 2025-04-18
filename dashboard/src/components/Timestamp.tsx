import React from 'react';
import './Timestamp.css';

export const Timestamp: React.FC = () => (
  <div className="timestamp">{new Date().toLocaleTimeString('sv-SE')}</div>
)
