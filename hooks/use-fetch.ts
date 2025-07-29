"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner";

export const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = useCallback(async (...args) => {
    setError(null);
    setLoading(true);

    try {
      const response = await cb(...args);
      setData(response);
      return response; // allow chaining

    } catch (error) {
      setError(error);
      toast.error(error.message || "Something went wrong.");
      return null;

    } finally {
      setLoading(false);
    }
  }, [cb]);

  return { data, loading, error,  fn };
};
