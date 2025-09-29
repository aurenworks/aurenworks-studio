import React, { useState } from 'react';
import { YamlEditor } from '../../components/YamlEditor';

// Sample schema for demonstration
const sampleSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Component name',
    },
    version: {
      type: 'string',
      description: 'Component version',
    },
    description: {
      type: 'string',
      description: 'Component description',
    },
    properties: {
      type: 'object',
      description: 'Component properties',
      additionalProperties: true,
    },
    required: {
      type: 'array',
      items: {
        type: 'string',
      },
      description: 'Required properties',
    },
  },
  required: ['name', 'version'],
};

const sampleYaml = `name: my-component
version: "1.0.0"
description: A sample component
properties:
  type: string
  required: true
required:
  - name
  - version`;

export const YamlPlayground: React.FC = () => {
  const [yamlContent, setYamlContent] = useState(sampleYaml);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const handleYamlChange = (value: string) => {
    setYamlContent(value);

    // Basic YAML validation
    try {
      // Simple validation - in a real app, you'd use a proper YAML parser
      if (value.trim() === '') {
        setValidationErrors([]);
        setIsValid(true);
        return;
      }

      // Check for basic YAML structure
      const lines = value.split('\n');
      const errors: string[] = [];

      lines.forEach((line, index) => {
        // Check for common YAML issues
        if (line.includes('\t')) {
          errors.push(
            `Line ${index + 1}: Tabs are not allowed in YAML, use spaces instead`
          );
        }

        // Check for unclosed quotes
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        if (singleQuotes % 2 !== 0) {
          errors.push(`Line ${index + 1}: Unclosed single quotes`);
        }
        if (doubleQuotes % 2 !== 0) {
          errors.push(`Line ${index + 1}: Unclosed double quotes`);
        }
      });

      setValidationErrors(errors);
      setIsValid(errors.length === 0);
    } catch (err) {
      setValidationErrors([`Validation error: ${err}`]);
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    // Basic formatting - in a real app, you'd use a proper YAML formatter
    const formatted = yamlContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    setYamlContent(formatted);
  };

  const handleReset = () => {
    setYamlContent(sampleYaml);
    setValidationErrors([]);
    setIsValid(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            YAML Editor Playground
          </h1>
          <p className="text-gray-600 mt-2">
            Edit YAML content with schema validation, syntax highlighting, and
            formatting.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  YAML Editor
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleFormat}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Format
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <YamlEditor
                value={yamlContent}
                onChange={handleYamlChange}
                schema={sampleSchema}
                height="400px"
                className="border border-gray-300 rounded-md"
              />
            </div>

            {/* Validation Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Validation
              </h2>

              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div
                    className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span
                    className={`font-medium ${isValid ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {isValid ? 'Valid YAML' : 'Invalid YAML'}
                  </span>
                </div>

                {validationErrors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-red-700">
                      Errors:
                    </h3>
                    <ul className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <li
                          key={index}
                          className="text-sm text-red-600 bg-red-50 p-2 rounded"
                        >
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Schema Info */}
              <div className="bg-blue-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-700 mb-2">
                  Schema Information
                </h3>
                <div className="text-sm text-blue-600 space-y-1">
                  <p>• Component schema validation enabled</p>
                  <p>• Required fields: name, version</p>
                  <p>• Hover for field descriptions</p>
                  <p>• Auto-completion available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Demo */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Features</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">
                Syntax Highlighting
              </h3>
              <p className="text-sm text-green-600">
                YAML syntax highlighting with proper color coding
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">
                Schema Validation
              </h3>
              <p className="text-sm text-blue-600">
                Real-time validation against JSON schema
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <h3 className="font-medium text-purple-800 mb-2">
                Auto-completion
              </h3>
              <p className="text-sm text-purple-600">
                Intelligent code completion and suggestions
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="font-medium text-yellow-800 mb-2">
                Error Highlighting
              </h3>
              <p className="text-sm text-yellow-600">
                Inline error markers and diagnostics
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="font-medium text-indigo-800 mb-2">Formatting</h3>
              <p className="text-sm text-indigo-600">
                Auto-format YAML content on paste and type
              </p>
            </div>
            <div className="bg-pink-50 p-4 rounded-md">
              <h3 className="font-medium text-pink-800 mb-2">Accessibility</h3>
              <p className="text-sm text-pink-600">
                Keyboard navigation and screen reader support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlPlayground;
