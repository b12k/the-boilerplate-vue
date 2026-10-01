function deserialize(serializedJson: string) {
  const value: unknown = JSON.parse(serializedJson);
  return value;
}

export { deserialize };
