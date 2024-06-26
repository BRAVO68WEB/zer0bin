import { defineConfig, loadEnv } from "vite"
import pugPlugin from "vite-plugin-pug"
import viteCompression from "vite-plugin-compression"
import { createRequire } from "module"

export default defineConfig(async ({ mode }) => {
	let config: any
	const env = loadEnv(mode, process.cwd(), "")

	try {
		// @ts-ignore

		// lazy hack so vite doesn't emit:
		// [rollup-plugin-dynamic-import-variables] Unexpected token (46:55)
		// file: zer0bin/frontend/src/index.ts:46:55
		// error during build:
		// SyntaxError: Unexpected token (46:55)

		const _config = await import("./config.json")
		config = {
			api_url: JSON.stringify(_config.api_url),
		}
	} catch (e) {
		config = {
			api_url: JSON.stringify(env.ZEROBIN_API_URL ?? env.API_URL),
		}
	}

	return {
		plugins: [pugPlugin(), viteCompression()],
		define: {
			API_URL: config.api_url,
		},
	}
})
