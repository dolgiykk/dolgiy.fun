import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', 'coverage', '.vite'],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ['**/*.{ts,tsx}'],

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },

        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'unused-imports': unusedImports,
        },

        rules: {
            ...reactHooks.configs.recommended.rules,

            'react-refresh/only-export-components': [
                'warn',
                {
                    allowConstantExport: true,
                },
            ],

            'unused-imports/no-unused-imports': 'error',

            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },

    prettier,
);
