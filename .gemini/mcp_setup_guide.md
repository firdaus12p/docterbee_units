# MCP Setup Guide for Antigravity (Gemini)

## 📍 Lokasi Konfigurasi
File: `C:\Users\muham\.gemini\antigravity\mcp_config.json`

## 🔧 Konfigurasi yang Direkomendasikan

### Opsi 1: Serena MCP (Semantic Code Understanding)
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--project",
        "c:\\Projek\\docterbee_units"
      ]
    }
  }
}
```

**Keuntungan Serena:**
- ✅ Semantic code search (lebih pintar dari grep)
- ✅ Symbol-based navigation (jump to function/class)
- ✅ Code refactoring tools
- ✅ Project-wide understanding
- ✅ Language server integration (TypeScript, JavaScript, dll)

### Opsi 2: Multiple MCP Servers
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--project",
        "c:\\Projek\\docterbee_units"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "c:\\Projek\\docterbee_units"
      ]
    },
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 📝 Langkah-langkah Setup

### 1. Buka File Konfigurasi
```powershell
notepad "C:\Users\muham\.gemini\antigravity\mcp_config.json"
```

### 2. Paste Konfigurasi
Pilih salah satu opsi di atas dan paste ke file

### 3. Save File
Simpan dengan format JSON yang valid

### 4. Restart Antigravity
Tutup dan buka kembali Antigravity agar konfigurasi dimuat

### 5. Verifikasi
Antigravity akan otomatis connect ke MCP servers saat startup

## 🔍 Cara Mengecek MCP Sudah Aktif

Setelah restart, Anda bisa tanya:
> "Apakah MCP Serena sudah terhubung?"

Atau:
> "List available MCP servers"

## 🐛 Troubleshooting

### Error: "Command not found"
**Solusi**: Pastikan `uvx` atau `npx` sudah terinstall
```powershell
uv --version
node --version
```

### Error: "Failed to connect to MCP server"
**Solusi**: 
1. Cek path project sudah benar
2. Cek command bisa dijalankan manual:
```powershell
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --project c:\Projek\docterbee_units
```

### Error: "Invalid JSON"
**Solusi**: Validasi JSON di https://jsonlint.com/

## 📚 MCP Servers Lainnya

### Database MCP (MySQL)
Belum ada official MySQL MCP, tapi bisa pakai:
- PostgreSQL MCP (adaptasi)
- Custom MCP server (buat sendiri)

### Git MCP
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "c:\\Projek\\docterbee_units"
      ]
    }
  }
}
```

## 🎯 Rekomendasi untuk Docterbee Units

**Minimal Setup** (Serena saja):
- Serena MCP untuk code understanding

**Optimal Setup** (Serena + Filesystem + Search):
- Serena untuk semantic code search
- Filesystem untuk file operations
- Brave Search untuk web research

**Advanced Setup** (All-in-one):
- Semua di atas + Git MCP + Custom Database MCP

## 📖 Resources
- MCP Specification: https://modelcontextprotocol.io/
- Serena Docs: https://oraios.github.io/serena/
- Official MCP Servers: https://github.com/modelcontextprotocol/servers

---

**Last Updated**: 2025-12-10
**Author**: Antigravity Assistant
