export const escapeRegex = (input: string) => input?.replace(/[.+?^*${}()|[\]\\]/g, '\\$&');
