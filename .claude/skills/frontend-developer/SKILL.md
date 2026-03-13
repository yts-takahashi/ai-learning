---
name: frontend-developer
description: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 によるフロントエンド開発の専門家スキル。「ページを作って」「コンポーネントを作って」「UIを実装して」「フロントエンドを実装して」など、UI・ページ・コンポーネント開発の依頼があれば使う。page スキルと component スキルの役割を統合している。developスキルのサブエージェントとして並列で呼び出されることもある。
---

## 役割

`develop` から渡されたAPI仕様とUI要件、またはユーザーの依頼をもとに、Next.js 15 + TypeScript + Tailwind CSS v4 でフロントエンドを実装する。

## 受け取る情報

呼び出し時に以下が渡される（`develop` 経由の場合）：
- API仕様書（エンドポイント・リクエスト/レスポンス型）
- 実装すべきページ・コンポーネントの要件

単独で呼ばれた場合は、ユーザーの依頼と `docs/specs/` の仕様書から自分で要件を読み取る。

---

## プロジェクト規約

### 技術スタック
- **Next.js 15** App Router（ファイルベースルーティング）
- **TypeScript**（`any` 型禁止）
- **Tailwind CSS v4**（`tailwind.config.js` 不要・`@import "tailwindcss"` のみ）

### ディレクトリ構成
```
src/
  app/
    <route>/
      page.tsx       # URLに対応するページ（Server Component）
      layout.tsx     # 共通レイアウト
      error.tsx      # エラーバウンダリ
  components/
    ui/              # 汎用コンポーネント（Button, Badge, ProgressBar 等）
    layout/          # ヘッダー・ナビゲーション等
    features/        # 機能固有コンポーネント
  lib/
    types/           # TypeScript 型定義
    api/             # APIクライアント関数
    hooks/           # カスタムフック
```

---

## 実行フロー

### STEP 1: 現状把握

- `src/app/` のページ構成を確認する
- `src/components/` の既存コンポーネントを確認する（再利用できるものを探す）
- `src/lib/types/` の既存型定義を確認する
- `docs/specs/` に仕様書があれば参照する

### STEP 2: 型定義

APIレスポンス型やコンポーネントのprops型を `src/lib/types/` に定義する。

```typescript
// src/lib/types/progress.ts の例
export interface ProgressResponse {
  completedSlugs: string[];
  lastUpdated: string;
}

export interface ApiError {
  error: string;
}
```

### STEP 3: APIクライアント実装

バックエンドAPIを呼び出す関数を `src/lib/api/` に作成する。

```typescript
// src/lib/api/progress.ts の例
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function fetchProgress(token: string): Promise<ProgressResponse> {
  const res = await fetch(`${API_BASE}/api/progress`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

export async function markComplete(slug: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/progress/${slug}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to mark complete');
}
```

### STEP 4: コンポーネント実装

#### Server Component（デフォルト）
```typescript
// src/components/features/ProgressSummary.tsx の例
import type { ProgressResponse } from '@/lib/types/progress';

interface Props {
  progress: ProgressResponse;
  totalLessons: number;
}

export function ProgressSummary({ progress, totalLessons }: Props) {
  const completed = progress.completedSlugs.length;
  return (
    <div className="...">
      <p>{completed} / {totalLessons} レッスン完了</p>
    </div>
  );
}
```

#### Client Component（インタラクション必要時のみ）
```typescript
'use client';

import { useState } from 'react';

interface Props { ... }

export function InteractiveComponent({ ... }: Props) {
  const [state, setState] = useState(...);
  return <div>...</div>;
}
```

### STEP 5: ページ実装

```typescript
// src/app/dashboard/page.tsx の例
import { DashboardClient } from '@/components/features/DashboardClient';

export default async function DashboardPage() {
  // Server Component でのデータ取得（認証が必要な場合はcookiesを使う）
  return <DashboardClient />;
}
```

### STEP 6: 環境変数の確認

`.env.local.example` または `CLAUDE.md` に記載があれば確認する。
バックエンドURLは `NEXT_PUBLIC_API_URL` 環境変数で管理する。

### STEP 7: 検証

```bash
npm run lint
npx tsc --noEmit
```

エラーがあれば修正してから次のステップへ進む。

### STEP 8: 実装完了報告

以下を報告する：
- 実装したページ・コンポーネント一覧
- 作成・変更したファイル一覧
- バックエンド接続に必要な環境変数（あれば）

---

## コンポーネント設計の判断基準

| 状況 | 判断 |
|------|------|
| Server か Client か迷う | Server を選ぶ |
| 配置場所に迷う | `features/` に置く |
| 型が複雑で迷う | シンプルな型に分解する |
| ファイル名の命名 | PascalCase（コンポーネント）/ kebab-case（ルート） |
| データ取得の方法 | Server Component で fetch → Client に props で渡す |
| APIエラー処理 | `error.tsx` でエラーバウンダリを実装 |
| 認証状態の管理 | Context または cookie ベースで統一 |
