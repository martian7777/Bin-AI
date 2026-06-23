> تمت ترجمة هذا الملف بواسطة AI. إذا لاحظت خطأ، افتح PR.

<div align="center">

# Bin AI

**محرر فيديو مصمم لعصر الذكاء الاصطناعي.**

<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/BinAI.dmg">
  <img src="../../assets/macos-badge.png" alt="تنزيل Bin AI لنظام macOS" width="180" />
</a>
<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/Bin-AI-Setup.exe">
  <img src="../../assets/windows-badge.png" alt="Download Bin AI for Windows" width="180" />
</a>

<sub><i>يتطلب macOS 26 (Tahoe) على Apple Silicon لتحميله / Windows 10/11</i></sub>


<p>
  <a href="../../README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.hi.md">हिन्दी</a> ·
  <a href="README.bn.md">বাংলা</a> ·
  <strong>العربية</strong> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ru.md">Русский</a>
</p>

</div>

<img src="../../assets/bin-ui.png" alt="واجهة Bin AI" width="900" />

---

بالمي برو (Bin AI) هو محرر فيديو مفتوح المصدر لنظام macOS. يتيح لك العمل جنبًا إلى جنب مع المساعد الذكي الخاص بك لإنشاء الفيديوهات وتحريرها داخل الخط الزمني (Timeline) نفسه.

### محرر فيديو Swift-native

تم تطوير بالمي برو (Bin AI) من الصفر باستخدام Swift. استلهمنا تجربة الاستخدام من Premiere Pro، مع إعادة تصميمها لتناسب أدوات الذكاء الاصطناعي الحديثة وسير العمل المعتمد عليها.

### ذكاء اصطناعي توليدي مدمج (Generative AI)

أنشئ الفيديوهات والصور مباشرة من داخل المحرر باستخدام أحدث النماذج مثل Seedance وKling وNano Banana Pro، دون الحاجة إلى التنقل بين تطبيقات متعددة.

### يتكامل مع أدواتك ومساعديك الذكيين

يمكنك ربط Claude أو Codex أو Cursor عبر MCP، أو استخدام المساعد المدمج داخل التطبيق للعمل معًا على المشروع نفسه.
## خادم الMCP

عندما يكون التطبيق مفتوحًا، فإنه يوفّر MCP server على `http://127.0.0.1:19789/mcp` عبر HTTP. للاتصال:

**Claude Code**
```bash
claude mcp add --transport http bin-ai http://127.0.0.1:19789/mcp
```

**Codex**
```bash
codex mcp add bin-ai --url http://127.0.0.1:19789/mcp
```

**Cursor**

أسهل طريقة هي فتح `Help` -> `MCP Instructions` -> `Install in Cursor` داخل التطبيق، أو التثبيت يدويًا بإضافة هذا إلى `~/.cursor/mcp.json`:

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

نضمّن [mcpb](https://github.com/modelcontextprotocol/mcpb) مع التطبيق، ما يسمح بتثبيت Desktop Extension على Claude Desktop بنقرة واحدة. افتح `Help` -> `MCP Instructions` -> `Install in Claude Desktop`.

## FAQ

**هل Bin AI بالكامل open source؟**

محرر الفيديو، بدون ميزات generative AI، مفتوح المصدر بالكامل. MCP server وagent chat مفتوحا المصدر أيضًا. الجزء الوحيد closed source هو معالجة generative AI.

**هل هو مجاني؟**

المحرر مجاني. يمكنك تنزيله دون تسجيل دخول واستخدامه كمحرر فيديو مثل CapCut أو Adobe Premiere. يمكنك أيضًا استخدام MCP server مجانًا والبدء بالتجربة مع Claude Code أو Claude Desktop أو Cursor للتفاعل مع محرر timeline.

ميزات generative AI تتطلب تسجيل الدخول والاشتراك.

**ما المنصات المدعومة؟**

يدعم Bin AI حاليًا:
* macOS 26 (Tahoe)
* أجهزة Apple Silicon فقط
  
راجع [FAQ.md](../../FAQ.md) للمزيد.

## Development

راجع [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Community والدعم

- **Feedback والدعم:** افتح [GitHub Issue](https://github.com/martian7777/Bin-AI/issues)

## Star History

<a href="https://www.star-history.com/?type=date&repos=martian7777%2FBin-AI">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
   <img alt="مخطط Star History" src="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
 </picture>
</a>

## License

Copyright (C) 2026 Bin AI

Bin AI مفتوح المصدر بموجب [GPLv3](../../LICENSE).
