// src/types/next-intl.d.ts
import { Pathnames as NextIntlPathnames } from 'next-intl/navigation';
import { pathnames } from '../navigation'; // Importa o objeto pathnames do seu navigation.ts

// Estende o módulo 'next-intl' para incluir seus pathnames
declare module 'next-intl' {
  interface Pathnames extends NextIntlPathnames<typeof pathnames> {}
}