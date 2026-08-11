const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
  // 🔥 sobe o backend automaticamente
  serverProcess = fork(path.join(__dirname, "../server.js"));

  // aguarda o backend subir
  setTimeout(createWindow, 1200);
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
