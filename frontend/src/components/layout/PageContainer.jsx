import React from 'react';
import Sidebar from './Sidebar';

export default function PageContainer({ children }) {
  return (
    <div className="flex">
      {/* /<Sidebar /> */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
