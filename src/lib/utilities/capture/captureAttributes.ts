const CAPTURE_ATTRIBUTES = {
  exclude: 'data-capture-exclude',
  expand: 'data-capture-expand',
} as const;

const CAPTURE_EXCLUDE_PROPS = { [CAPTURE_ATTRIBUTES.exclude]: '' } as const;
const CAPTURE_EXPAND_PROPS = { [CAPTURE_ATTRIBUTES.expand]: '' } as const;

export { CAPTURE_ATTRIBUTES, CAPTURE_EXCLUDE_PROPS, CAPTURE_EXPAND_PROPS };
