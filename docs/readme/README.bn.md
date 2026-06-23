> এই অনুবাদটি AI দিয়ে তৈরি। কোনো ভুল দেখলে অনুগ্রহ করে একটি PR খুলুন।

<div align="center">

# Bin AI

**AI-এর জন্য তৈরি ভিডিও এডিটর।**

<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/BinAI.dmg">
  <img src="../../assets/macos-badge.png" alt="macOS-এর জন্য Bin AI ডাউনলোড করুন" width="180" />
</a>
<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/Bin-AI-Setup.exe">
  <img src="../../assets/windows-badge.png" alt="Download Bin AI for Windows" width="180" />
</a>

<sub><i>Apple Silicon-এ macOS 26 (Tahoe) প্রয়োজন / Windows 10/11</i></sub>


<p>
  <a href="../../README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.hi.md">हिन्दी</a> ·
  <strong>বাংলা</strong> ·
  <a href="README.ar.md">العربية</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ru.md">Русский</a>
</p>

</div>

<img src="../../assets/bin-ui.png" alt="Bin AI UI" width="900" />

---

Bin AI Mac-এর জন্য একটি open source ভিডিও এডিটর। আপনি এবং আপনার agent timeline-এর ভিতরে একসঙ্গে ভিডিও generate ও edit করতে পারেন।

### Swift-native ভিডিও এডিটর

আমরা Swift দিয়ে Bin AI একদম শুরু থেকে তৈরি করেছি। আমাদের উত্তর তারা Premiere Pro, তবে workflow-তে AI যুক্ত করার নিজস্ব পদ্ধতি নিয়ে।

### Built-in Generative AI

Timeline editor-এর ভিতর Seedance, Kling, Nano Banana Pro-এর মতো SOTA models দিয়ে ভিডিও এবং ছবি generate করুন।

### আপনার agents-এর সঙ্গে integration

MCP-এর মাধ্যমে Claude, Codex বা Cursor connect করুন, অথবা একই project-এ একসঙ্গে কাজ করতে in-app agent ব্যবহার করুন।

## MCP server

App খোলা থাকলে, এটি HTTP-এর মাধ্যমে `http://127.0.0.1:19789/mcp`-এ একটি MCP server expose করে। Connect করতে:

**Claude Code**
```bash
claude mcp add --transport http bin-ai http://127.0.0.1:19789/mcp
```

**Codex**
```bash
codex mcp add bin-ai --url http://127.0.0.1:19789/mcp
```

**Cursor**

সবচেয়ে সহজ উপায় হলো app-এর ভিতরে `Help` -> `MCP Instructions` -> `Install in Cursor`-এ যাওয়া। Manual install করতে `~/.cursor/mcp.json`-এ এটি যোগ করুন:

```
{
  "mcpServers": {
    "bin-ai": {
      "type": "http",
      "url": "http://127.0.0.1:19789/mcp"
    }
  }
}
```

**Claude Desktop**

App-এর সঙ্গে আমরা একটি [mcpb](https://github.com/modelcontextprotocol/mcpb) bundle করি, যা Claude Desktop-এ Desktop Extension এক click-এ install করতে দেয়। `Help` -> `MCP Instructions` -> `Install in Claude Desktop` খুলুন।

## FAQ

**Bin AI কি পুরোপুরি open source?**

Generative AI features ছাড়া ভিডিও এডিটরটি পুরোপুরি open source। MCP server এবং agent chat-ও open source। শুধু generative AI processing closed source।

**এটি কি free?**

Editor free। Login ছাড়াই আপনি এটি download করতে পারেন এবং CapCut বা Adobe Premiere-এর মতো ভিডিও এডিটর হিসেবে ব্যবহার করতে পারেন। MCP server-ও free, এবং Claude Code, Claude Desktop বা Cursor দিয়ে timeline editor-এর সঙ্গে experiment শুরু করতে পারেন।

Generative AI features-এর জন্য login এবং subscription প্রয়োজন।

**কোন platforms support করে?**

শুধু Apple Silicon-এ macOS 26 (Tahoe)।

আরও জানতে [FAQ.md](../../FAQ.md) দেখুন।

## Development

[CONTRIBUTING.md](../../CONTRIBUTING.md) দেখুন।

## Community এবং support

- **Feedback এবং support:** একটি [GitHub Issue](https://github.com/martian7777/Bin-AI/issues)

## Star History

<a href="https://www.star-history.com/?type=date&repos=martian7777%2FBin-AI">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
 </picture>
</a>

## License

Copyright (C) 2026 Bin AI

Bin AI [GPLv3](../../LICENSE)-এর অধীনে open source।
