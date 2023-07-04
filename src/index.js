const path = require('path');
const os = require('os');
const resizeImg = require('resize-img');
const fs = require('fs');
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  dialog,
} = require('electron');

let mainWin;

const createWindow = () => {
  mainWin = new BrowserWindow({
    width: 440,
    height: 670,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation:true,
      preload: path.join(__dirname, 'preload.js'),  
    },
    icon: "assets/icon.ico",
  });
  mainWin.loadFile("src/index.html");
};

const menuTemt = [
  {
    label: "Help",
    submenu: [
      {
        role: "toggledevtools",
      },
      {
        type: "separator",
      },
      {
        label: "Join Us on Twitter",
        click: () => {
          shell.openExternal("https://twitter.com/tahasintonmoy");
        },
      },
      {
        label: "Report Issues",
        click: () => {
          shell.openExternal("https://twitter.com/tahasintonmoy");
        },
      },
      { type: "separator" },
      {
        label: "About",
        click: async () => {
          dialog.showMessageBoxSync({
            type: "info",
            buttons: ["OK"],
            title: "About",
            message: "SNX Resizer",
            detail:
              "SNX Resizer is an open-source project \ndeveloped by Tahasin Tonmoy \n" +
              "and is a free software project developed\nby Tahasin Tonmoy." +
              "\n\n Version 0.1.0 (Beta) \n Electron JS Version 25.2.0 \n Node.js Version 18.16.1 LTS " +
              "\n Chromium Version 88.0.4324.190",
          });
        },
      },
    ],
  },
];

const AppMenu = Menu.buildFromTemplate(menuTemt);
Menu.setApplicationMenu(AppMenu);

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options)
});

async function resizeImage({  imgPath, width, height, dest }){
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath),{
      width: +width,
      height: +height,
    });

    const filename = path.basename(imgPath);

    if (!fs.existsSync(dest)) {
        fs.mkdir(dest);
    }

    fs.writeFileSync(path.join(dest, filename), newPath);
    mainWin.webContents.send('image:done');

    shell.openPath(dest)
  } catch (error) {
    alert('Error: ' + error)
  }
}

app.on("window-all-close", () => {
  if (process.platform !== "drawing") app.quit();
});
