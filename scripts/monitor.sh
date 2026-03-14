#!/bin/bash
# 自律開発の進捗をリアルタイムで監視するスクリプト

SESSION="ai-learning"

# 既存セッションがあればそのままアタッチ
if tmux has-session -t $SESSION 2>/dev/null; then
  tmux attach-session -t $SESSION
  exit 0
fi

# 新規セッション作成
tmux new-session -d -s $SESSION

# レイアウト:
# ┌──────────────────────┬──────────────────────┐
# │                      │  最新コミット(develop)│
# │  Claude Code         ├──────────────────────┤
# │  (メイン)            │  改善バックログ       │
# │                      ├──────────────────────┤
# │                      │  ファイル数           │
# ├──────────────────────┴──────────────────────┤
# │  サブエージェントログ（垂れ流し）              │
# └─────────────────────────────────────────────┘

# 右側ペインを作成
tmux split-window -h -t $SESSION
tmux select-pane -t $SESSION:0.1

# 右側を縦に3分割
tmux split-window -v -t $SESSION:0.1
tmux split-window -v -t $SESSION:0.2

# 下部にサブエージェントログペインを追加（全幅）
tmux select-pane -t $SESSION:0.0
tmux split-window -v -t $SESSION:0.0 -p 30

# サイズ調整
tmux resize-pane -t $SESSION:0.0 -x 55

# 右上: 最新コミット・develop（5秒ごと更新）
tmux send-keys -t $SESSION:0.2 \
  "while true; do clear; echo '=== 最新コミット [develop] ==='; git -C ~/git/ai-learning log develop --oneline -10 2>/dev/null; sleep 5; done" \
  Enter

# 右中: 改善バックログ（5秒ごと更新）
tmux send-keys -t $SESSION:0.3 \
  "while true; do clear; echo '=== 改善バックログ ==='; BACKLOG=~/git/ai-learning/docs/improve-backlog.md; TODO=\$(grep -c '^- \[ \]' \"\$BACKLOG\" 2>/dev/null || echo 0); DONE=\$(grep -c '^- \[x\]' \"\$BACKLOG\" 2>/dev/null || echo 0); echo \"未実装: \${TODO}件  実装済み: \${DONE}件\"; echo ''; echo '-- 未実装 --'; grep '^- \[ \]' \"\$BACKLOG\" 2>/dev/null | sed 's/^- \[ \] \*\*\([^*]*\)\*\*.*/  \1/' | head -10; sleep 5; done" \
  Enter

# 右下: ファイル数（5秒ごと更新）
tmux send-keys -t $SESSION:0.4 \
  "while true; do clear; echo '=== 作成ファイル数 ==='; echo \"src/ : \$(find ~/git/ai-learning/src -name '*.tsx' -o -name '*.ts' 2>/dev/null | wc -l | tr -d ' ') ファイル\"; echo \"content/: \$(find ~/git/ai-learning/content -name '*.md' 2>/dev/null | wc -l | tr -d ' ') レッスン\"; echo \"journal : \$(find ~/git/ai-learning/docs/journal -name '*.md' 2>/dev/null | wc -l | tr -d ' ') エントリー\"; sleep 5; done" \
  Enter

# 下部: サブエージェントログ（垂れ流し）
tmux send-keys -t $SESSION:0.1 \
  "bash ~/git/ai-learning/scripts/watch-agents.sh" \
  Enter

# メインペインでClaude起動
tmux select-pane -t $SESSION:0.0
tmux send-keys -t $SESSION:0.0 "cd ~/git/ai-learning && claude" Enter

# セッションにアタッチ
tmux attach-session -t $SESSION
