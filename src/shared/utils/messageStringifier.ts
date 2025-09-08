interface errorMessage {
  name: string;
  reason: string;
}

export const errorMessageStringifier = (message: errorMessage[]): string =>
  message.reduce(
    (accum, item, count) => `[${count}] ${item.reason}\n${accum}`,
    ''
  );
