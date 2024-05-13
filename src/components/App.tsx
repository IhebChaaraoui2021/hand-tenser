import React from 'react';
import HandsCapture from './hands-capture/index';
import { BrowserRouter as Router, Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HandsCapture />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
