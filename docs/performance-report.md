# パフォーマンスレポート
計測日時: 2026-03-15

## バンドルサイズ

### ビルド結果

ビルドコマンド `npm run build` を実行した結果、**ビルドエラーが発生**したためバンドルサイズの詳細な取得は不可能でした。

**コンパイル**: 2.0分で成功（Turbopack）

**ビルドエラー内容**:
```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/login".
Error occurred prerendering page "/login". Read more: https://nextjs.org/docs/messages/prerender-error
Export encountered an error on /login/page: /login, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
```

原因: `/src/components/features/AuthForm.tsx` 内の `useSearchParams()` フックが、Next.js 15 の静的ページ生成（SSG）時に Suspense バウンダリ問題でクラッシュしています。`/login/page.tsx` と `/register/page.tsx` は `<Suspense>` でラップされているものの、Next.js 15 のビルド時静的エクスポートでは不十分と判断されています。

**ESLint 警告** (ビルド時):
```
./src/components/features/LessonKeyboardNav.tsx
54:6 Warning: React Hook useEffect has missing dependencies: 'slug' and 'toggle'.
```

### 推定構成（コードベース分析から）

| ページ | タイプ | 推定サイズ |
|--------|--------|-----------|
| `/` | Server Component（HomeProgressBanner のみ Client） | 小〜中 |
| `/lessons` | Server Component | 中 |
| `/lessons/[slug]` | Server Component（122レッスン分動的） | 中 |
| `/dashboard` | Client Component | 中 |
| `/login` | Client Component（AuthForm） | 小 |
| `/register` | Client Component（AuthForm） | 小 |

総レッスン数: 112レッスン（10チャプター構成）

## Lighthouseスコア

ビルドエラーにより本番ビルドは生成されていません。開発サーバー（http://localhost:3001）もInternal Server Errorが発生しているため、Lighthouse計測は実施できませんでした。

## ページ応答速度

Playwright ブラウザを使用して http://localhost:3001 および http://localhost:3001/lessons へアクセスを試みましたが、**すべてのページで Internal Server Error (500)** が返されました。

- `http://localhost:3001` → Internal Server Error
- `http://localhost:3001/lessons` → `/login?from=%2Flessons` へリダイレクト → Internal Server Error
- `http://localhost:3001/login` → Internal Server Error

開発サーバーの障害原因は、ビルドエラーと同一の可能性が高い（`useSearchParams()` の Suspense 問題）。ただし開発モード（`npm run dev`）では通常この問題はビルド時にのみ表面化するため、別の原因（設定ファイルの問題、依存関係の不整合等）も考えられます。

## 改善提案

### 緊急対応が必要

1. **`useSearchParams()` の Suspense ラッパー修正（ビルド失敗の直接原因）**
   - `/src/components/features/AuthForm.tsx` の `useSearchParams()` が Next.js 15 のビルド時静的生成で問題を起こしている
   - 対策: `AuthForm` をさらに内側で `<Suspense fallback={null}>` でラップするか、`useSearchParams()` を使う部分を別コンポーネントに切り出す
   - 参考: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

2. **開発サーバーの Internal Server Error 調査**
   - `npm run dev` 実行中に全ページが 500 エラーになっている
   - サーバーコンソールログの確認が必要

### 品質改善

3. **useEffect 依存配列の警告修正**
   - `/src/components/features/LessonKeyboardNav.tsx` の 54行目
   - `slug` と `toggle` を依存配列に追加するか、意図的に省く場合は `// eslint-disable-next-line` でコメントアウト

### パフォーマンス最適化（ビルド修正後に実施）

4. **Lighthouse 計測の実施**
   - ビルド修正後に `npx lighthouse http://localhost:3001 --output json` で計測
   - Core Web Vitals（LCP / CLS / FID）の確認

5. **バンドルサイズ分析**
   - `npm run build` 成功後に `@next/bundle-analyzer` を導入してバンドル内訳を可視化
   - Server Components の活用状況確認（Client Component の不要な `'use client'` がないか）

6. **画像最適化**
   - SVG アイコン（`slack-icon.svg` 等）は `next/image` か inline SVG で最適化

7. **レッスンページ（122ページ）の静的生成確認**
   - `/lessons/[slug]` が `generateStaticParams` を使って事前生成されているか確認
   - 大量の静的ページ生成はビルド時間に影響する（現在2分超）
