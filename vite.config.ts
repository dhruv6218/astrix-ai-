import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { NodePath } from '@babel/core';
import type { types as BabelTypes } from '@babel/core';

export default defineConfig({
  plugins: [react({ babel: { plugins: [
function __dualiteSourceLoc({ types: t }: { types: typeof BabelTypes }) {
  return { visitor: { JSXOpeningElement(path: NodePath<BabelTypes.JSXOpeningElement>, state: { filename?: string }) {
    const fn = state.filename || '';
    if (!fn || fn.includes('node_modules')) return;
    const name = path.node.name;
    const reactSpecials = ['Fragment', 'StrictMode', 'Suspense', 'Profiler'];
    const isReactSpecial = (name.type === 'JSXIdentifier' && reactSpecials.indexOf(name.name) !== -1) ||
      (name.type === 'JSXMemberExpression' && name.object &&
        (name.object as BabelTypes.JSXIdentifier).name === 'React' && name.property &&
        reactSpecials.indexOf((name.property as BabelTypes.JSXIdentifier).name) !== -1) ||
      (name.type === 'JSXMemberExpression' && name.property &&
        ((name.property as BabelTypes.JSXIdentifier).name === 'Provider' ||
          (name.property as BabelTypes.JSXIdentifier).name === 'Consumer'));
    if (isReactSpecial) return;
    const attrs = path.node.attributes;
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i].type === 'JSXAttribute' && (attrs[i] as BabelTypes.JSXAttribute).name &&
          ((attrs[i] as BabelTypes.JSXAttribute).name as BabelTypes.JSXIdentifier).name === 'data-ds') return;
    }
    const loc = path.node.loc;
    if (!loc) return;
    const wd = '/home/project/';
    const rel = fn.startsWith(wd) ? fn.slice(wd.length) : fn;
    attrs.push(t.jsxAttribute(t.jsxIdentifier('data-ds'), t.stringLiteral(rel + ':' + loc.start.line + ':' + loc.start.column)));
  } } };
}
] } })],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
