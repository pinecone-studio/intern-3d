'use client';

import { useEffect, useState } from 'react';

import type { TomFormOptions } from '@/lib/tom-types';

const emptyOptions: TomFormOptions = {
  teachers: [],
  allowedDays: [],
  gradeRanges: [],
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string } & T)
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}.`
    );
  }

  return data as T;
}

export function useTomOptions() {
  const [options, setOptions] = useState<TomFormOptions>(emptyOptions);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch('/api/options');
        const data = await readJson<{ options: TomFormOptions }>(response);

        if (!cancelled) {
          setOptions(data.options);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Form options ачаалж чадсангүй.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, isLoading, errorMessage };
}
