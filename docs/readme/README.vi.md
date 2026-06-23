> Bản dịch này được tạo bằng AI. Nếu phát hiện lỗi, hãy mở PR.

<div align="center">

# Bin AI

**Trình biên tập video được xây dựng cho AI.**

<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/BinAI.dmg">
  <img src="../../assets/macos-badge.png" alt="Tải Bin AI cho macOS" width="180" />
</a>

<sub><i>Yêu cầu macOS 26 (Tahoe) trên Apple Silicon</i></sub>


<p>
  <a href="../../README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <strong>Tiếng Việt</strong> ·
  <a href="README.hi.md">हिन्दी</a> ·
  <a href="README.bn.md">বাংলা</a> ·
  <a href="README.ar.md">العربية</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ru.md">Русский</a>
</p>

</div>

<img src="../../assets/bin-ui.png" alt="Giao diện Bin AI" width="900" />

---

Bin AI là trình biên tập video mã nguồn mở cho Mac. Bạn và agent của bạn có thể cùng tạo và chỉnh sửa video ngay trong timeline.

### Trình biên tập video thuần Swift

Chúng tôi xây dựng Bin AI từ đầu bằng Swift. Mốc tham chiếu là Premiere Pro, với cách riêng của chúng tôi để tích hợp AI vào quy trình làm việc.

### AI tạo sinh tích hợp sẵn

Tạo video và hình ảnh bằng các mô hình tiên tiến như Seedance, Kling và Nano Banana Pro ngay trong trình biên tập timeline.

### Tích hợp với agent của bạn

Kết nối Claude, Codex hoặc Cursor qua MCP, hoặc dùng agent trong app để cùng làm việc trên một dự án.

## MCP server

Khi app đang mở, Bin AI cung cấp MCP server tại `http://127.0.0.1:19789/mcp` qua HTTP. Cách kết nối:

**Claude Code**
```bash
claude mcp add --transport http bin-ai http://127.0.0.1:19789/mcp
```

**Codex**
```bash
codex mcp add bin-ai --url http://127.0.0.1:19789/mcp
```

**Cursor**

Cách dễ nhất là mở `Help` -> `MCP Instructions` -> `Install in Cursor` trong app, hoặc cài thủ công bằng cách thêm phần sau vào `~/.cursor/mcp.json`:

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

Chúng tôi đóng gói một [mcpb](https://github.com/modelcontextprotocol/mcpb) cùng app để cài Desktop Extension trên Claude Desktop bằng một cú nhấp. Mở `Help` -> `MCP Instructions` -> `Install in Claude Desktop`.

## FAQ

**Bin AI có hoàn toàn mã nguồn mở không?**

Trình biên tập video, không bao gồm các tính năng AI tạo sinh, hoàn toàn là mã nguồn mở. MCP server và agent chat cũng là mã nguồn mở. Phần duy nhất đóng nguồn là xử lý AI tạo sinh.

**Có miễn phí không?**

Trình biên tập miễn phí. Bạn có thể tải xuống mà không cần đăng nhập và dùng như một trình biên tập video, tương tự CapCut hoặc Adobe Premiere. Bạn cũng có thể dùng MCP server miễn phí và bắt đầu thử nghiệm với Claude Code, Claude Desktop hoặc Cursor để tương tác với trình biên tập timeline.

Các tính năng AI tạo sinh yêu cầu đăng nhập và gói đăng ký.

**Hỗ trợ nền tảng nào?**

Chỉ hỗ trợ macOS 26 (Tahoe) trên Apple Silicon.

Xem thêm tại [FAQ.md](../../FAQ.md).

## Phát triển

Xem [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Cộng đồng và hỗ trợ

- **Phản hồi và hỗ trợ:** Tạo [GitHub Issue](https://github.com/martian7777/Bin-AI/issues)

## Star History

<a href="https://www.star-history.com/?type=date&repos=martian7777%2FBin-AI">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
   <img alt="Biểu đồ Star History" src="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
 </picture>
</a>

## Giấy phép

Copyright (C) 2026 Bin AI

Bin AI là mã nguồn mở theo [GPLv3](../../LICENSE).
