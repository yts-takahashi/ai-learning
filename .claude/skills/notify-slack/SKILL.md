---
name: notify-slack
description: 作業完了をSlackに通知するスキル。launch・ship・developの完了時に自動呼び出される。
---

## 役割

作業の完了をSlackに通知する。呼び出し元から受け取ったメッセージを送信する。

## 実行

```bash
source /Users/shotakahashi/git/ai-learning/.env.local 2>/dev/null || true
export $(grep -v '^#' /Users/shotakahashi/git/ai-learning/.env.local | xargs) 2>/dev/null || true
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$MESSAGE\"}"
```

`$MESSAGE` は呼び出し元が指定する。指定がない場合は以下をデフォルトとする：
- launch 完了: `✅ launch 完了 — 改善・記録まですべて終わりました`
- ship 完了: `✅ ship 完了 — 実装・改善・記録まですべて終わりました`
- develop 完了: `✅ develop 完了 — 実装・コミット・記録まですべて終わりました`
- improve 完了: `🔧 improve 完了 — バックログの改善をすべて実装しました`
