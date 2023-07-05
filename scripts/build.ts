import autoprefixer from 'autoprefixer'
import { build } from 'esbuild'
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin'
import fs from 'node:fs'
import path from 'node:path'

const clearOutputFolder = async (outputFolder: string) => {
  try {
    await fs.promises.rm(outputFolder, { recursive: true })
  } catch (e) {}

  return fs.promises.mkdir(outputFolder, { recursive: true })
}

const buildJsAndCss = async (outputFolder: string) => {
  return build({
    entryPoints: [path.resolve(`./src/index.tsx`)],
    bundle: true,
    minify: true,
    outdir: outputFolder,
    sourcemap: true,
    splitting: true,
    format: 'esm',
    external: ['*.png', '*.jpg', '*.webp'],
    plugins: [
      sassPlugin({
        transform: postcssModules(
          {
            generateScopedName: '[name]__[local]___[hash:base64:5]',
            globalModulePaths: [/\/\w+\.s?css/]
          },
          [autoprefixer]
        )
      })
    ]
  })
}

const OUTPUT_DIR = path.resolve('./public')

;(async () => {
  await clearOutputFolder(OUTPUT_DIR)
  await buildJsAndCss(OUTPUT_DIR)
})()
