> Esta traducción fue generada por IA. Si encuentras un error, abre un PR.

<div align="center">

# Bin AI

**El editor de video creado para IA.**

<a href="https://github.com/martian7777/Bin-AI/releases/latest/download/BinAI.dmg">
  <img src="../../assets/macos-badge.png" alt="Descargar Bin AI para macOS" width="180" />
</a>

<sub><i>Requiere macOS 26 (Tahoe) en Apple Silicon</i></sub>


<p>
  <a href="../../README.md">English</a> ·
  <strong>Español</strong> ·
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
  <a href="README.fr.md">Français</a> ·
  <a href="README.ru.md">Русский</a>
</p>

</div>

<img src="../../assets/bin-ui.png" alt="Interfaz de Bin AI" width="900" />

---

Bin AI es un editor de video de código abierto para Mac. Tú y tu agente pueden generar y editar videos juntos dentro de la línea de tiempo.

### Editor de video nativo en Swift

Construimos Bin AI desde cero con Swift. La referencia es Premiere Pro, con nuestra forma de integrar IA en el flujo de trabajo.

### IA generativa integrada

Genera videos e imágenes con modelos de vanguardia como Seedance, Kling y Nano Banana Pro dentro del editor de línea de tiempo.

### Integración con tus agentes

Conecta Claude, Codex o Cursor mediante MCP, o usa el agente integrado en la app para trabajar juntos en el mismo proyecto.

## Servidor MCP

Cuando la app está abierta, expone un servidor MCP en `http://127.0.0.1:19789/mcp` mediante HTTP. Para conectarlo:

**Claude Code**
```bash
claude mcp add --transport http bin-ai http://127.0.0.1:19789/mcp
```

**Codex**
```bash
codex mcp add bin-ai --url http://127.0.0.1:19789/mcp
```

**Cursor**

La forma más fácil es abrir `Help` -> `MCP Instructions` -> `Install in Cursor` dentro de la app, o instalarlo manualmente agregando esto a `~/.cursor/mcp.json`:

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

Incluimos un [mcpb](https://github.com/modelcontextprotocol/mcpb) con la app que permite instalar la extensión de escritorio en Claude Desktop con un clic. Abre `Help` -> `MCP Instructions` -> `Install in Claude Desktop`.

## FAQ

**¿Bin AI es completamente de código abierto?**

El editor de video, sin las funciones de IA generativa, es completamente de código abierto. El servidor MCP y el chat del agente también son de código abierto. Lo único cerrado es el procesamiento de IA generativa.

**¿Es gratis?**

El editor es gratis. Puedes descargarlo sin iniciar sesión y usarlo como editor de video, como CapCut o Adobe Premiere. También puedes usar el servidor MCP gratis y empezar a experimentar con Claude Code, Claude Desktop o Cursor para interactuar con tu editor de línea de tiempo.

Las funciones de IA generativa requieren inicio de sesión y suscripción.

**¿Qué plataformas admite?**

Solo macOS 26 (Tahoe) en Apple Silicon.

Consulta [FAQ.md](../../FAQ.md) para más información.

## Desarrollo

Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Comunidad y soporte

- **Feedback y soporte:** Crea un [GitHub Issue](https://github.com/martian7777/Bin-AI/issues)

## Historial de estrellas

<a href="https://www.star-history.com/?type=date&repos=martian7777%2FBin-AI">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
   <img alt="Gráfico del historial de estrellas" src="https://api.star-history.com/chart?repos=martian7777/Bin-AI&type=date&legend=top-left" />
 </picture>
</a>

## Licencia

Copyright (C) 2026 Bin AI

Bin AI es de código abierto bajo [GPLv3](../../LICENSE).
