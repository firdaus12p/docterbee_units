# 🔧 Server Management Guide

## Cara Mencari & Kill Server yang Berjalan

### 🚀 Quick Commands

#### **Kill Semua Node Process (Tercepat)**
```powershell
Get-Process -Name node | Stop-Process -Force
```

#### **Kill Process di Port 3000**
```powershell
# Cari PID
netstat -ano | findstr :3000

# Kill berdasarkan PID (ganti 12345 dengan PID yang ditemukan)
taskkill /F /PID 12345
```

---

## 📋 Method Lengkap

### **Method 1: PowerShell (Recommended)**

**Kill semua node:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Kill port 3000 spesifik:**
```powershell
$pid = (netstat -ano | findstr :3000 | Select-String -Pattern '\d+$').Matches.Value | Select-Object -First 1
if ($pid) { taskkill /F /PID $pid }
```

### **Method 2: Command Prompt (CMD)**

**Kill semua node:**
```cmd
taskkill /F /IM node.exe
```

**Kill port 3000:**
```cmd
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %a
```

### **Method 3: Task Manager (GUI)**

1. Tekan `Ctrl + Shift + Esc`
2. Tab **"Details"**
3. Cari **"node.exe"**
4. Klik kanan → **"End Task"**

### **Method 4: Gunakan Script Helper**

Saya sudah buatkan 2 script untuk Anda:

#### **Windows Batch Script:**
```cmd
kill-server.bat
```
Double-click atau run di terminal.

#### **PowerShell Script:**
```powershell
.\kill-server.ps1
```

---

## 🔍 Cara Cek Server yang Running

### **Cek semua node process:**
```powershell
Get-Process -Name node
```

Output:
```
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    234      25    45678      67890      12.34  12345   1 node
```
- **Id** = PID (Process ID)

### **Cek port 3000:**
```powershell
netstat -ano | findstr :3000
```

Output:
```
TCP    0.0.0.0:3000     0.0.0.0:0      LISTENING       12345
TCP    [::]:3000        [::]:0         LISTENING       12345
```
- Angka terakhir (12345) = PID

### **Cek detail process:**
```powershell
Get-Process -Id 12345 | Format-List *
```

---

## 🛠️ Troubleshooting

### **Error: EADDRINUSE (Port sudah digunakan)**

**Solusi 1 - Kill semua node:**
```powershell
Get-Process -Name node | Stop-Process -Force
Start-Sleep -Seconds 2
npm run dev
```

**Solusi 2 - Kill port spesifik:**
```powershell
# Cari PID
netstat -ano | findstr :3000

# Kill PID (contoh: 12345)
taskkill /F /PID 12345

# Tunggu 2 detik
Start-Sleep -Seconds 2

# Start server
npm run dev
```

**Solusi 3 - Gunakan script:**
```powershell
.\kill-server.ps1
npm run dev
```

### **Error: Access Denied saat kill process**

**Jalankan PowerShell/CMD sebagai Administrator:**
1. Klik kanan PowerShell/CMD
2. Pilih **"Run as Administrator"**
3. Jalankan command kill lagi

### **Port masih TIME_WAIT setelah kill**

TIME_WAIT adalah state normal Windows yang akan clear otomatis dalam 30-120 detik.

**Solusi cepat:**
```powershell
# Tunggu 3 detik
Start-Sleep -Seconds 3

# Coba start lagi
npm run dev
```

---

## 📝 Best Practices

### **Sebelum Start Server:**
```powershell
# 1. Kill server lama
Get-Process -Name node | Stop-Process -Force

# 2. Tunggu sebentar
Start-Sleep -Seconds 2

# 3. Verify port free
netstat -ano | findstr :3000

# 4. Start server
npm run dev
```

### **Stop Server dengan Benar:**
- Tekan `Ctrl + C` di terminal yang running server
- Jangan langsung close terminal window

### **Jika Ctrl+C Tidak Bekerja:**
```powershell
# Kill dari terminal lain
Get-Process -Name node | Stop-Process -Force
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Kill all node | `Get-Process -Name node \| Stop-Process -Force` |
| Kill port 3000 | `netstat -ano \| findstr :3000` → `taskkill /F /PID <PID>` |
| Check node running | `Get-Process -Name node` |
| Check port 3000 | `netstat -ano \| findstr :3000` |
| Start server | `npm run dev` |
| Stop server | `Ctrl + C` |

---

## 🚨 Emergency Commands

**Jika semua gagal:**
```powershell
# Nuclear option - kill semua node dan restart PC
Get-Process -Name node | Stop-Process -Force
Restart-Computer
```

**Atau restart Windows Explorer:**
```powershell
taskkill /F /IM explorer.exe
Start-Process explorer.exe
```

---

## 📞 Support

Jika masih ada masalah:
1. Check Task Manager untuk process yang mencurigakan
2. Restart PC
3. Check antivirus yang mungkin block port
4. Check firewall settings

**Happy Coding!** 🚀
