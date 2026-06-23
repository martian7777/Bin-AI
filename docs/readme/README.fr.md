> Cette traduction a été générée par IA. Si vous repérez une erreur, ouvrez une PR.

<div align="center">

# Bin AI

**L'éditeur vidéo conçu pour l'IA.**

<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/BinAI.dmg">
  <img src="../../assets/macos-badge.png" alt="Télécharger Bin AI pour macOS" width="180" />
</a>

<sub><i>Nécessite macOS 26 (Tahoe) sur Apple Silicon</i></sub>


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
  <a href="README.ar.md">العربية</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <strong>Français</strong> ·
  <a href="README.ru.md">Русский</a>
</p>

</div>

<img src="../../assets/bin-ui.png" alt="Interface de Bin AI" width="900" />

---

Bin AI est un éditeur vidéo open source pour Mac. Vous et votre agent pouvez générer et monter des vidéos ensemble dans la timeline.

### Éditeur vidéo natif Swift

Nous avons construit Bin AI de zéro avec Swift. La référence est Premiere Pro, avec notre façon d'intégrer l'IA dans le workflow.

### IA générative intégrée

Générez des vidéos et des images avec des modèles de pointe comme Seedance, Kling et Nano Banana Pro directement dans l'éditeur de timeline.

### Intégration avec vos agents

Connectez Claude, Codex ou Cursor via MCP, ou utilisez l'agent intégré à l'app pour travailler ensemble sur le même projet.

## Serveur MCP

Lorsque l'app est ouverte, elle expose un serveur MCP à `http://127.0.0.1:19789/mcp` via HTTP. Pour vous connecter :

**Claude Code**
```bash
claude mcp add --transport http bin-ai http://127.0.0.1:19789/mcp
```

**Codex**
```bash
codex mcp add bin-ai --url http://127.0.0.1:19789/mcp
```

**Cursor**

Le plus simple est d'ouvrir dans l'app `Help` -> `MCP Instructions` -> `Install in Cursor`, ou de l'installer manuellement en ajoutant ceci à `~/.cursor/mcp.json` :

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

Nous fournissons un [mcpb](https://github.com/modelcontextprotocol/mcpb) avec l'app, ce qui permet d'installer en un clic la Desktop Extension dans Claude Desktop. Ouvrez `Help` -> `MCP Instructions` -> `Install in Claude Desktop`.

## FAQ

**Bin AI est-il entièrement open source ?**

L'éditeur vidéo, sans les fonctions d'IA générative, est entièrement open source. Le serveur MCP et le chat de l'agent sont aussi open source. La seule partie closed source est le traitement d'IA générative.

**Est-ce gratuit ?**

L'éditeur est gratuit. Vous pouvez le télécharger sans vous connecter et l'utiliser comme éditeur vidéo, comme CapCut ou Adobe Premiere. Vous pouvez aussi utiliser le serveur MCP gratuitement et commencer à expérimenter avec Claude Code, Claude Desktop ou Cursor pour interagir avec votre éditeur de timeline.

Les fonctions d'IA générative nécessitent une connexion et un abonnement.

**Quelles plateformes sont prises en charge ?**

macOS 26 (Tahoe) sur Apple Silicon uniquement.

Voir [FAQ.md](../../FAQ.md) pour plus d'informations.

## Développement

Voir [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Communauté et support

- **Feedback et support :** Créez une [GitHub Issue](https://github.com/martian7777/Bin-AI/issues)

## Star History

<a href="https://www.star-history.com/?type=date&repos=martian7777%2FBin-AI">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
   <img alt="Graphique Star History" src="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
 </picture>
</a>

## Licence

Copyright (C) 2026 Bin AI

Bin AI est open source sous [GPLv3](../../LICENSE).
