"use client";

import { useEffect } from 'react';

export function useSocket() {
  useEffect(() => {
    // Initialize socket.io server for App Router
    fetch('/api/socket').catch(console.error);
  }, []);
}
