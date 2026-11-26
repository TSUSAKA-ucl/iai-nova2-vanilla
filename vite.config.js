import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve(__dirname, 'localcerts/localhost-key.pem');
const certPath = path.resolve(__dirname, 'localcerts/localhost.pem');
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

export default defineConfig(({ command }) => {
  const isServe = command === 'serve';

  return {
    // 開発サーバー起動時、かつ自前の証明書がない場合のみ自己証明書を自動生成
    plugins: isServe && !hasCerts ? [basicSsl()] : [],
    build: {
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          // "use client" の警告だけをスルーする
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          defaultHandler(warning);
        },
      },
    },
    server: {
      host: '0.0.0.0',
      // 開発サーバー起動時、かつ自前の証明書がある場合のみそれを読み込む
      // （ない場合は basicSsl プラグインが自動で https 設定を注入します）
      https:
        isServe && hasCerts
          ? {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath),
            }
          : undefined,
    },
  };
});
