---
title: "CLAUDE.mdの設計"
chapter: 10
chapterTitle: "ハーネスエンジニアリングと自律開発"
lessonNumber: 2
slug: "claude-md-design"
duration: 20
difficulty: "intermediate"
hasHandsOn: true
hasQuiz: true
---

## 概要

CLAUDE.mdはプロジェクトのAI開発ガイドラインを定義するファイルです。技術スタック・コーディング規約・コマンド・禁止事項を適切に記述することで、AIがプロジェクトに沿った自律的な作業を行えるようになります。

## 本文

### CLAUDE.mdの読み込まれ方

Claude Codeは起動時にプロジェクトルートの`CLAUDE.md`を自動的に読み込みます。また、サブディレクトリにも配置でき、そのディレクトリを作業する際に追加で読み込まれます。

```
project/
  CLAUDE.md                    # プロジェクト全体のガイドライン
  src/
    CLAUDE.md                  # srcディレクトリ固有のルール
  docs/
    CLAUDE.md                  # ドキュメント作業のルール
```

### 効果的なCLAUDE.mdの構成

```markdown
# CLAUDE.md テンプレート

## プロジェクト概要（2〜3文）
何を作っているか、主要なユーザーは誰か、コアバリューは何か。

## 技術スタック
主要なフレームワーク・言語・ツールをリストアップ。
バージョンも記載（例: Next.js 15、Python 3.12）。

## コマンド
```bash
npm run dev      # 開発サーバー
npm run build    # ビルド
npm run test     # テスト実行
```

## ディレクトリ構成
主要なディレクトリとその役割を説明。

## コーディング規約
- 言語固有の規約（TypeScriptのstrictモードなど）
- 命名規則
- インポート順序

## 禁止事項（重要）
AIが絶対にやってはいけないことを明記。
例: 本番DBへの直接アクセス、secretsをコードに埋め込む
```

### 実際のCLAUDE.md例

```markdown
# CLAUDE.md

このファイルはClaude Code (claude.ai/code)へのガイダンスを提供します。

## プロジェクト概要

生成AIについてユーザーが学習するWebアプリケーション。
Next.js 15 + TypeScript + Tailwind CSS v4で構築。
AI機能自体は使用しない（教材コンテンツのみ）。

## コマンド

```bash
npm run dev        # 開発サーバー起動（Turbopack）
npm run build      # プロダクションビルド
npm run lint       # ESLintチェック
npx tsc --noEmit   # 型チェック
```

## ディレクトリ構成

```
src/
  app/          # ページ・レイアウト（App Router）
  components/
    ui/          # 汎用コンポーネント
    layout/      # ヘッダー・ナビゲーション
    features/    # 機能固有コンポーネント
  lib/           # 型定義・定数・ユーティリティ
docs/specs/      # 機能仕様書
```

## 技術規約

- Server Components がデフォルト。インタラクション時のみ "use client"
- Tailwind CSS v4: tailwind.config.jsは不要、globals.cssに@import "tailwindcss"のみ
- コンポーネントファイルはPascalCase
- ユーティリティ関数はcamelCase

## 禁止事項

- .envファイルをコミットしない
- console.log をコードに残さない
- any型を使わない（unknown推奨）
- コメントアウトされたコードを残さない
```

### セクションの優先度と書き方のコツ

**高優先度（必ず書く）:**
- プロジェクト概要（AIが何を作っているか把握するため）
- コマンド（AIが正しいコマンドを実行するため）
- 禁止事項（絶対やってはいけないことを明確に）

**中優先度（書いた方が良い）:**
- ディレクトリ構成（ファイル配置の判断に使う）
- 技術スタックのバージョン（互換性の問題を防ぐ）

**低優先度（長すぎると読まれなくなる）:**
- すべての規約の詳細説明
- 背景・経緯の長い説明

```markdown
# 良い書き方の例

## 禁止事項（AIはこれらを絶対に行わないこと）
- 本番データベースへの破壊的操作（DROP TABLE、DELETE without WHERE）
- APIキー・パスワードのソースコードへの埋め込み
- ユーザーの確認なしの大量ファイル削除

# 悪い書き方の例（長すぎる）
## セキュリティについて
セキュリティはとても重要です。多くのセキュリティリスクがあり、特にAPIキーの管理は...
（長い背景説明が続く）
```

## ハンズオン

自分のプロジェクト用のCLAUDE.mdを設計してみましょう。

### ステップ1：CLAUDE.mdの構成チェックリスト

```python
def evaluate_claude_md(content: str) -> dict:
    """CLAUDE.mdの内容を評価"""

    checks = {
        "has_overview": "## プロジェクト概要" in content or "## Project Overview" in content,
        "has_commands": "```bash" in content or "## コマンド" in content,
        "has_directory": "## ディレクトリ" in content or "## Directory" in content,
        "has_forbidden": "禁止" in content or "## Forbidden" in content or "NEVER" in content,
        "has_tech_stack": "技術スタック" in content or "## Tech" in content,
        "not_too_long": len(content) < 5000,  # 長すぎると読まれなくなる
    }

    score = sum(checks.values()) / len(checks)

    recommendations = []
    if not checks["has_overview"]:
        recommendations.append("プロジェクト概要セクションを追加してください")
    if not checks["has_commands"]:
        recommendations.append("よく使うコマンドを```bashブロックで記載してください")
    if not checks["has_forbidden"]:
        recommendations.append("AIが絶対にやってはいけないことを「禁止事項」に明記してください")
    if not checks["not_too_long"]:
        recommendations.append("CLAUDE.mdが長すぎます（5000文字以内を推奨）")

    return {
        "score": score,
        "checks": checks,
        "recommendations": recommendations,
        "grade": "A" if score >= 0.8 else "B" if score >= 0.6 else "C",
    }


# テスト
sample_claude_md = """
# CLAUDE.md

## プロジェクト概要
ToDoアプリのバックエンドAPI

## コマンド
```bash
npm run dev
npm test
```

## ディレクトリ構成
src/routes/ - APIルート
src/models/ - データモデル

## 禁止事項
- 本番DBへの直接操作
"""

result = evaluate_claude_md(sample_claude_md)
print(f"評価グレード: {result['grade']} (スコア: {result['score']:.0%})")
print(f"チェック結果:")
for check, passed in result['checks'].items():
    print(f"  {'✓' if passed else '✗'} {check}")
if result['recommendations']:
    print(f"\n推奨改善点:")
    for rec in result['recommendations']:
        print(f"  - {rec}")
```

## クイズ

<!-- QUIZ:START -->
**Q1. CLAUDE.mdで「禁止事項」を明記する理由はどれですか？**

- A) ファイルサイズを小さくするため
- B) AIが絶対やってはいけない操作（本番DBの直接変更・secretsの埋め込みなど）を事前に制約し、取り返しのつかないミスを防ぐため
- C) 他の開発者への説明のため
- D) テストを効率化するため

**正解: B**
**解説:** AIエージェントが自律的に作業する際、本番データベースの削除や環境変数のコードへの埋め込みなどの取り返しのつかない操作をする可能性があります。「禁止事項」を明記しておくことで、AIが「これはすべきでない」と判断できます。

**Q2. CLAUDE.mdのコマンドセクションにbashブロックで実際のコマンドを書く理由はどれですか？**

- A) ドキュメントをきれいにするため
- B) AIが正確なコマンドを実行できるようにするため（npm run devかyarn devかなどの混乱を防ぐ）
- C) コマンドを自動実行するため
- D) セキュリティを向上させるため

**正解: B**
**解説:** AIがテストを実行しようとする際、`npm test`か`npm run test`か`pytest`かは設定によって異なります。CLAUDE.mdに正確なコマンドを書いておくことで、AIが誤ったコマンドを試行錯誤する時間を省き、確実に正しいコマンドを使えます。

**Q3. CLAUDE.mdが長すぎる（5000文字以上）問題はどれですか？**

- A) ファイルが重くなる
- B) AIがすべての内容を把握するのにトークンを消費しすぎ、本来の作業に使えるコンテキスト長が減少する
- C) 他の開発者が読みにくくなる
- D) Gitの管理が難しくなる

**正解: B**
**解説:** CLAUDE.mdはAIが毎回コンテキストとして読み込みます。長すぎると読み込みに多くのトークンを使い、会話のコンテキスト長（Claude Codeは200Kトークン）を圧迫します。また重要な内容が埋もれて見落とされるリスクもあります。必要最小限の情報に絞ることが重要です。
<!-- QUIZ:END -->

## まとめ

- CLAUDE.mdはプロジェクト概要・コマンド・ディレクトリ構成・禁止事項を含める
- 禁止事項は特に重要で、取り返しのつかない操作を事前に制約する
- 長すぎるとAIのコンテキストを圧迫するため5000文字以内を目安にする
- サブディレクトリにも配置してそのディレクトリ固有のルールを定義できる

## 次のレッスン

次のレッスンでは、再利用可能なワークフローを定義するスキル・コマンド・フックの実装を学びます。
