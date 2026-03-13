#!/bin/bash
# サブエージェントのログをリアルタイムで監視・表示するスクリプト

CLAUDE_DIR="$HOME/.claude"
SEEN_FILES=""

echo "=== サブエージェント監視中 ==="
echo "新しいエージェントが起動すると自動で追跡します..."
echo ""

# 既存のjsonlファイルを検出してtailする関数
tail_new_files() {
  # ~/.claude 配下の全jsonlファイルを探す
  while IFS= read -r file; do
    if [[ ! " $SEEN_FILES " =~ " $file " ]]; then
      SEEN_FILES="$SEEN_FILES $file"
      # ファイル名からエージェント名を抽出
      agent_name=$(basename "$file" .jsonl)

      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "🤖 新しいエージェント: $agent_name"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      # バックグラウンドでtail -fしてjsonlを整形表示
      (
        tail -f "$file" 2>/dev/null | while IFS= read -r line; do
          # JSONからtextフィールドを抽出（jqがあれば使う）
          if command -v jq &>/dev/null; then
            # typeとcontentを抽出
            type=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)
            role=$(echo "$line" | jq -r '.role // empty' 2>/dev/null)
            text=$(echo "$line" | jq -r '.content // .text // empty' 2>/dev/null | head -c 200)

            if [[ -n "$text" && "$text" != "null" ]]; then
              timestamp=$(date '+%H:%M:%S')
              prefix="[$timestamp][$agent_name]"

              case "$role" in
                "assistant") echo "$prefix 💬 $text" ;;
                "tool")      echo "$prefix 🔧 $text" ;;
                "user")      echo "$prefix 👤 $text" ;;
                *)
                  case "$type" in
                    "tool_use")    echo "$prefix 🔧 tool: $(echo "$line" | jq -r '.name // empty' 2>/dev/null)" ;;
                    "tool_result") echo "$prefix ✅ done" ;;
                    *)             [[ -n "$text" ]] && echo "$prefix $text" ;;
                  esac
                  ;;
              esac
            fi
          else
            # jqなしの場合は生ログを表示
            echo "[$(date '+%H:%M:%S')][$agent_name] $line" | head -c 300
            echo ""
          fi
        done
      ) &
    fi
  done < <(find "$CLAUDE_DIR" -name "*.jsonl" -newer /tmp/.monitor_start 2>/dev/null)
}

# 起点となるタイムスタンプファイルを作成
touch /tmp/.monitor_start

# メインループ: 2秒ごとに新ファイルを確認
while true; do
  tail_new_files
  sleep 2
done
