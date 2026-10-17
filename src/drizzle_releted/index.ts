function schemaToColumns<T extends Record<string, unknown>>(schema: {
  properties: T;
}): Record<keyof T, true> {
  const columns = {} as Record<keyof T, true>;
  for (const key of Object.keys(schema.properties)) {
    columns[key as keyof T] = true;
  }
  return columns;
}

export const DrizzleExtensionImplementation = {
  schemaToColumns,
};

export type DrizzleExtension = typeof DrizzleExtensionImplementation;
