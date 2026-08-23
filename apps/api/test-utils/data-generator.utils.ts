import { faker } from '@faker-js/faker';

export const generateEmail = (): string => faker.internet.exampleEmail().toLowerCase();
