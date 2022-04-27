import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import ts from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import path from 'path';

const babelConfig = {
  babelHelpers: 'bundled',
  // plugins: [
  //   '@babel/plugin-transform-runtime',
  // ],
  presets: [
    [
      '@babel/env',
      {
        'modules': false,
        'targets': {
          'browsers': [
            '> 1%',
            'last 2 versions',
            'not ie <= 8'
          ]
        }
      }
    ]
  ]
};

const basePlugins = [
  resolve({
    rootDir: path.resolve(__dirname, './')
  }),
  ts({
    check: true,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache')
  }),
  commonjs(),
  babel(babelConfig)
];

export default [
  {
    input: path.join(__dirname, 'src', 'index.ts'),
    context: 'null',
    moduleContext: 'null',
    output: {
      exports: 'named',
      file: 'dist/index.js',
      format: 'es',
      plugins: [
        getBabelOutputPlugin({
          plugins: babelConfig.plugins,
          presets: babelConfig.presets
        })
      ]
    },
    plugins: basePlugins
  },
  {
    input: path.join(__dirname, 'src', 'index.ts'),
    context: 'null',
    moduleContext: 'null',
    output: {
      name: 'MegviiVideoPlayer',
      exports: 'named',
      file: 'dist/index.umd.js',
      format: 'umd',
    },
    plugins: basePlugins.concat(terser())
  }
];
