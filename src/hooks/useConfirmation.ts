'use client';

import { useState, useCallback } from 'react';
import type { ConfirmationModalConfig } from '@/lib/types';

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmationModalConfig | null>(null);

  const confirm = useCallback((cfg: ConfirmationModalConfig) => {
    setConfig(cfg);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // delay clearing config so exit animation can play
    setTimeout(() => setConfig(null), 200);
  }, []);

  return { isOpen, config, confirm, close };
}
