'use client';

import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

export const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.localStorage !== 'undefined' &&
  typeof window.sessionStorage !== 'undefined';

const storageEngine = isBrowser
  ? createWebStorage('local')
  : createNoopStorage();

export default storageEngine;
