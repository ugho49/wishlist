import { z } from 'zod';

export const zodRequiredString = () => z.string().trim().min(1, 'Ce champ ne peut pas être vide');
