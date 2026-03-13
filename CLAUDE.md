# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

生成AIについてユーザーが学習するためのWebアプリケーション。AI機能自体は使用しない。

## 技術スタック

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**（`tailwind.config.js` 不要、`globals.css` に `@import "tailwindcss"` のみ）
- **Turbopack**（開発サーバー高速化）

## コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLintチェック
npx tsc --noEmit     # 型チェック
```

## ディレクトリ構成

```
src/
  app/               # ページ・レイアウト（ファイル = ルート）
  components/
    ui/              # 汎用コンポーネント
    layout/          # ヘッダー・ナビゲーション等
    features/        # 機能固有コンポーネント
  lib/               # 型定義・定数・ユーティリティ
docs/specs/          # 機能仕様書
```

## App Router の基本規約

- Server Components がデフォルト。インタラクション必要時のみ `"use client"` を付ける
- `page.tsx` = URL、`layout.tsx` = 共通ラッパー、`error.tsx` = エラーバウンダリ
