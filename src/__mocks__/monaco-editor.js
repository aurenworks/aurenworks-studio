// Mock for Monaco Editor in tests
export const editor = {
  create: () => ({
    onDidChangeModelContent: () => {},
    getValue: () => '',
    setValue: () => {},
    updateOptions: () => {},
    dispose: () => {},
  }),
};

export const languages = {
  yaml: {
    yamlDefaults: {
      setDiagnosticsOptions: () => {},
    },
  },
};

export default {
  editor,
  languages,
};
