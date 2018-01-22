import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  input: 'src/factorio-renderer.ts',
  output: [
    { file: pkg.main, format: 'umd', name: 'FactorioRenderer' },
    { file: pkg.module, format: 'es' }
  ],
  sourcemap: true,
  watch: {
    include: 'src/**'
  },
  plugins: [
    typescript(),
    commonjs(),
    resolve(),
    sourceMaps()
  ]
}
