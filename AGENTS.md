# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Redesign rules (Codex) — read before UI work

Full rules in Russian: CLAUDE.md → «Новый дизайн (1.1) — делает Codex». Short version:
- Base branch: `release/1.1` (push notifications, notifications screen, server moderation are there), not `main`. Start only after Apple approves 1.0 and after build 22 ships; redesign is a separate build.
- Palette "VMESTE Blue": accent `#2563EB`, light bg `#F5F7FB`, text `#14213D`; dark theme graphite + lighter blue. One accent only for now; themes system / light / dark.
- Bottom tabs (5): Лента · Работа · Обзор · AI · Профиль. Neutral headings, outline icons instead of emoji, compact header, dark text on light theme.
- Must keep / must not add: bell «Уведомления» with unread badge in the header; NO stories (new UGC type = App Store Guideline 1.2 risk) — use «Новые участники» strip; no «Для вас / Подписки» (no follow feature); initials avatar fallback; post «⋯» menu with Report and Block author; do not touch the content filter, AI consent dialog, Terms on the login screen.
- Verify: screenshots of every changed screen in light and dark (iPhone; modals also on iPad); `npx expo export --platform ios` passes.

