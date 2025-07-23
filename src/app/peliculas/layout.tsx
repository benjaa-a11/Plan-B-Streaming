import React from 'react';

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full bg-background">{children}</div>;
}
