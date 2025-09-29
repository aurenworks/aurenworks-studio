import React, { useEffect, useRef, useState } from 'react';

export interface YamlEditorProps {
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  schema?: string | object; // URL or inline schema object
  readOnly?: boolean;
  height?: string | number;
  className?: string;
}

export const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onChange,
  schema,
  readOnly = false,
  height = '400px',
  className = '',
}) => {
  // eslint-disable-next-line no-undef
  const editorRef = useRef<HTMLDivElement | null>(null);
  const monacoEditorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeEditor = async () => {
      try {
        // Dynamic import of Monaco Editor to avoid SSR issues
        const monaco = await import('monaco-editor');

        // Configure Monaco environment for web workers
        if (typeof window !== 'undefined') {
          // Set up web worker for Monaco
          (window as unknown as Record<string, unknown>).MonacoEnvironment = {
            getWorkerUrl: function (moduleId: string, label: string) {
              if (label === 'json') {
                return '/node_modules/monaco-editor/esm/vs/language/json/json.worker.js';
              }
              if (label === 'css' || label === 'scss' || label === 'less') {
                return '/node_modules/monaco-editor/esm/vs/language/css/css.worker.js';
              }
              if (
                label === 'html' ||
                label === 'handlebars' ||
                label === 'razor'
              ) {
                return '/node_modules/monaco-editor/esm/vs/language/html/html.worker.js';
              }
              if (label === 'typescript' || label === 'javascript') {
                return '/node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js';
              }
              return '/node_modules/monaco-editor/esm/vs/editor/editor.worker.js';
            },
          };
        }

        if (!editorRef.current || !isMounted) return;

        // Create the editor
        const editor = monaco.editor.create(editorRef.current, {
          value,
          language: 'yaml',
          theme: 'vs-dark',
          readOnly,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          renderWhitespace: 'selection',
          formatOnPaste: true,
          formatOnType: true,
        });

        monacoEditorRef.current = editor;

        // Set up change listener
        editor.onDidChangeModelContent(() => {
          if (isMounted) {
            const newValue = editor.getValue();
            onChange(newValue);
          }
        });

        // Configure YAML language features
        try {
          if ((monaco.languages as any).yaml && (monaco.languages as any).yaml.yamlDefaults) {
            (monaco.languages as any).yaml.yamlDefaults.setDiagnosticsOptions({
              enableSchemaRequest: true,
              hover: true,
              completion: true,
              validate: true,
              format: true,
              isKubernetes: false,
            });
          } else {
            // eslint-disable-next-line no-console
            console.warn(
              'YAML language support not available in Monaco Editor'
            );
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('Failed to configure YAML language features:', err);
        }

        // Set up schema validation if provided
        if (schema) {
          try {
            let schemaUri: string;
            let schemaContent: unknown;

            if (typeof schema === 'string') {
              // URL schema
              schemaUri = schema;
              schemaContent = await globalThis
                .fetch(schema)
                .then(res => res.json());
            } else {
              // Inline schema
              schemaUri = 'http://localhost/schema.json';
              schemaContent = schema;
            }

            // Register the schema
            if ((monaco.languages as any).yaml && (monaco.languages as any).yaml.yamlDefaults) {
              (monaco.languages as any).yaml.yamlDefaults.setDiagnosticsOptions({
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                validate: true,
                format: true,
                isKubernetes: false,
                schemas: [
                  {
                    uri: schemaUri,
                    fileMatch: ['*'],
                    schema: schemaContent,
                  },
                ],
              });
            } else {
              // eslint-disable-next-line no-console
              console.warn(
                'Schema validation not available - YAML language support not loaded'
              );
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed to load schema:', err);
            setError('Failed to load schema for validation');
          }
        }

        setIsLoading(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Monaco editor:', err);
        setError('Failed to initialize editor');
        setIsLoading(false);
      }
    };

    initializeEditor();

    return () => {
      isMounted = false;
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (
      monacoEditorRef.current &&
      (monacoEditorRef.current as { getValue: () => string }).getValue() !==
        value
    ) {
      monacoEditorRef.current.setValue(value);
    }
  }, [value]);

  // Update read-only state
  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  if (error) {
    return (
      <div
        className={`border border-red-300 rounded-md p-4 bg-red-50 ${className}`}
      >
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md z-10">
          <div className="text-gray-600">Loading editor...</div>
        </div>
      )}
      <div
        ref={editorRef}
        style={{ height }}
        className="border border-gray-300 rounded-md"
        aria-label="YAML Editor"
        role="textbox"
        tabIndex={0}
      />
    </div>
  );
};

export default YamlEditor;
