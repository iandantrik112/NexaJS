// import { keyGenerator } from "./keyGenerator.js";
export class NexaSimulator {
  constructor(options = {}) {
    this.options = {
      fileCount: options.fileCount || 20,
      updateInterval: options.updateInterval || 200,
      progressIncrement: options.progressIncrement || 25,
      displaySelector: options.displaySelector || ".display",
      loaderBarSelector: options.loaderBarSelector || ".loader .bar",
      loaderTextSelector: options.loaderTextSelector || ".loader .text",
      customFiles: options.customFiles || null, // Add support for custom files
      ...options,
    };

    // Data will be provided through customFiles from updatedDataform

    // Load CSS styles dynamically
    this.loadStyles();

    // Verify styles are loaded after a short delay
    setTimeout(() => {
      this.verifyStylesLoaded();
    }, 100);

    this.elements = {
      display: null,
      loaderBar: null,
      loaderText: null,
    };

    this.words = [];
    this.intervalId = null;
    this.isRunning = false;
    this.currentFileIndex = 0;

    // Event callbacks
    this.onProgress = options.onProgress || null;
    this.onComplete = options.onComplete || null;
    this.onFileComplete = options.onFileComplete || null;

    this.init();
  }

  init() {
    this.elements.display = document.querySelector(
      this.options.displaySelector
    );
    this.elements.loaderBar = document.querySelector(
      this.options.loaderBarSelector
    );
    this.elements.loaderText = document.querySelector(
      this.options.loaderTextSelector
    );

    if (
      !this.elements.display ||
      !this.elements.loaderBar ||
      !this.elements.loaderText
    ) {
      throw new Error(
        "Required DOM elements not found. Please check your selectors."
      );
    }

    // Use custom files if provided, otherwise generate random files
    this.words = this.options.customFiles
      ? this.createCustomFilesFromDataform(this.options.customFiles)
      : this.makeInstallerFiles();
  }

  start() {
    if (this.isRunning) {
      console.warn("Installer simulator is already running");
      return;
    }

    this.isRunning = true;
    this.currentFileIndex = 0;
    this.drawInstallerFiles();

    this.intervalId = setInterval(() => {
      this.updateProgress();
    }, this.options.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.words = this.options.customFiles
      ? this.createCustomFilesFromDataform(this.options.customFiles)
      : this.makeInstallerFiles();
    this.currentFileIndex = 0;
    this.drawInstallerFiles();
  }

  updateProgress() {
    let foundIncompleteFile = false;

    for (let i = 0; i < this.words.length; i++) {
      if (this.words[i].percent < 100) {
        foundIncompleteFile = true;
        this.words[i].percent += Math.floor(
          Math.random() * this.options.progressIncrement
        );
        this.elements.loaderBar.style.display = "block";

        if (this.words[i].percent >= 100) {
          this.words[i].percent = 100;
          this.currentFileIndex = i;

          // Trigger file complete callback
          if (this.onFileComplete) {
            this.onFileComplete(this.words[i], i);
          }

          // Check if this is the last file
          if (i === this.words.length - 1) {
            // All files completed
            this.stop();
            if (this.onComplete) {
              this.onComplete();
            }
          } else {
            // Move to next file
            this.currentFileIndex = i + 1;
            // Don't hide progress bar, just reset for next file
            this.elements.loaderBar.style.width = "0%";
          }
        }

        // Trigger progress callback
        if (this.onProgress) {
          this.onProgress(this.words[i], i, this.getOverallProgress());
        }

        break;
      }
    }

    // If no incomplete files found, all are done
    if (!foundIncompleteFile) {
      this.stop();
      if (this.onComplete) {
        this.onComplete();
      }
    }

    this.drawInstallerFiles();
  }

  drawInstallerFiles() {
    this.elements.display.innerHTML = "";

    this.words.forEach((word, index) => {
      if (word.percent > 0) {
        this.elements.display.innerHTML += `<div class="line">${word.word}...${word.percent}%</div>`;

        // Only update loader for current active file
        if (index === this.currentFileIndex && word.percent < 100) {
          this.elements.loaderText.innerHTML = `${word.word}...${word.percent}%`;
          this.elements.loaderBar.style.width = word.percent + "%";
          this.elements.loaderBar.style.display = "block";
        }

        if (word.percent < 100) {
          this.elements.display.scrollTop = 100000;
        }
      }
    });

    // If all files are complete, show completion message but keep progress bar
    const allComplete = this.words.every((word) => word.percent >= 100);
    if (allComplete) {
      this.elements.loaderBar.style.display = "block";
      this.elements.loaderBar.style.width = "100%";
      this.elements.loaderText.innerHTML =
        "Installation completed successfully!";
    }
  }

  makeInstallerFiles() {
    // If no custom files provided, create default installation files
    const defaultFiles = [
      "Initializing system...",
      "Loading configuration...",
      "Preparing installation...",
      "Extracting files...",
      "Installing components...",
      "Configuring settings...",
      "Finalizing installation...",
      "Cleaning up...",
      "Installation complete!",
    ];

    return defaultFiles.map((file) => ({
      word: file,
      percent: 0,
    }));
  }

  getOverallProgress() {
    const totalProgress = this.words.reduce(
      (sum, word) => sum + word.percent,
      0
    );
    return Math.round(totalProgress / this.words.length);
  }

  getCurrentFile() {
    return this.words[this.currentFileIndex] || null;
  }

  getAllFiles() {
    return [...this.words];
  }

  addCustomFile(fileName) {
    this.words.push({
      word: fileName,
      percent: 0,
    });
  }

  setProgressIncrement(increment) {
    this.options.progressIncrement = increment;
  }

  setUpdateInterval(interval) {
    this.options.updateInterval = interval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  loadStyles() {
    // Check if styles are already loaded
    if (document.querySelector("style[data-nexa-simulator]")) {
      return;
    }

    // Load inline CSS directly
    this.loadInlineStyles();
  }

  verifyStylesLoaded() {
    // Check if CSS styles are actually applied by testing computed styles
    const testElement = document.createElement("div");
    testElement.className = "window microsoft";
    testElement.style.position = "absolute";
    testElement.style.left = "-9999px";
    testElement.style.visibility = "hidden";

    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const hasMicrosoftStyles =
      computedStyle.fontFamily && computedStyle.fontFamily.includes("Raleway");

    document.body.removeChild(testElement);

    if (!hasMicrosoftStyles) {
      // Try to reload inline CSS
      setTimeout(() => {
        this.loadInlineStyles();
      }, 100);
    }
  }

  loadInlineStyles() {
    // Check if already loaded
    if (document.querySelector("style[data-nexa-simulator]")) {
      return;
    }

    const inlineCSS = `
  
.window {
  width:100%;
}

.microsoft {
  font-family: "Raleway", sans-serif;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  -webkit-animation: openwindows 0.2s;
          animation: openwindows 0.2s;
  transform-origin: bottom center;
}
.microsoft .header {
  display: flex;
  color: rgba(255, 255, 255, 0.9);
  line-height: 40px;
  font-weight: 100;
  height: 40px;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  position: relative;
  z-index: 1;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
}
.microsoft .header .title {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0px 10px;
  display: flex;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
.microsoft .header .title .icon {
  width: 30px;
  position: relative;
  display: inline-block;
  top: 6px;
}
.microsoft .header .title .text {
  flex: 1;
  height: 25px;
  top: 7px;
  position: relative;
  padding: 0px 8px;
  line-height: 25px;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.microsoft .header .buttons {
  display: flex;
  width: 160px;
  height: 30px;
}
.microsoft .header .buttons .btn {
  flex: 1;
  text-align: center;
}
.microsoft .header .buttons .btn:hover {
  cursor: pointer;
}
.microsoft .header .buttons .btn:hover.minus {
  background: rgba(0, 0, 0, 0.25);
}
.microsoft .header .buttons .btn:hover.expand {
  background: rgba(0, 0, 0, 0.25);
}
.microsoft .header .buttons .btn:hover.close {
  background: rgba(150, 0, 0, 0.5);
}
.microsoft .header .buttons .btn i {
  position: relative;
  display: inline-block;
  top: -1px;
  font-size: 20px;
}
.microsoft .form {
  min-height: 60px;
  background: #f8f9fa;
}
.microsoft .form .top {
  padding: 10px;
  display: flex;
}
.microsoft .form .top .icon {
  width: 50px;
  padding: 0px 10px 0px 0px;
}
.microsoft .form .top .icon .amd {
  background: transparent;
}
.microsoft .form .top .icon .amd .amd-border, .microsoft .form .top .icon .amd .amd-border:after, .microsoft .form .top .icon .amd .amd-top:after {
  background: transparent;
}
.microsoft .form .top .loader {
  flex: 1;
}
.microsoft .form .top .loader .text {
  font-size: 12px;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}
.microsoft .form .top .loader .bar {
  min-height: 20px;
  background: linear-gradient(90deg, #28a745, #20c997);
  width: 100%;
  transition: 0.2s all;
  -webkit-animation: 0.4s opacitize;
          animation: 0.4s opacitize;
  border-radius: 2px;
}
.microsoft .middle {
  padding: 0px 10px 10px 10px;
}
.microsoft .middle .display {
  height: 200px;
  background: #ffffff;
  padding: 8px;
  font-size: 12px;
  color: #495057;
  font-weight: 400;
  overflow-y: auto;
  box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  border-radius: 3px;
}
.microsoft .bottom {
  min-height: 40px;
  display: flex;
  font-size: 12px;
  color: #6c757d;
  padding: 0px 10px;
  line-height: 30px;
  background: #f8f9fa;
}
.microsoft .bottom .btn {
  width: 80px;
  text-align: center;
  height: 30px;
  position: relative;
  background: #ffffff;
  color: #495057;
  border: 1px solid #dee2e6;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  border-radius: 3px;
}
.microsoft .bottom .btn:not(:first-child) {
  margin-left: 4px;
}
.microsoft .bottom .btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}
.microsoft .bottom .btn:active {
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.1);
  background: #dee2e6;
}
.microsoft .bottom .text {
  color: #6c757d;
  flex: 1;
  text-align: center;
}

.amd {
  display: inline-block;
  width: 100%;
  padding: 5%;
  background: transparent;
}
.amd .amd-border {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible;
  min-height: 40px;
  min-width: 40px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.amd .amd-border img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  background: transparent;
}

@-webkit-keyframes opacitize {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes opacitize {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
    `;

    const style = document.createElement("style");
    style.type = "text/css";
    style.setAttribute("data-nexa-simulator", "true");
    style.textContent = inlineCSS;
    document.head.appendChild(style);

    // Add favicon image to existing amd-border elements
    this.addFaviconToElements();
  }

  createCustomFilesFromDataform(dataform) {
    const customFiles = [];

    // Add main form data
    customFiles.push({
      word: `Update ${dataform.label || dataform.className} (ID: ${
        dataform.id
      })`,
      percent: 0,
      type: "main",
    });

    // Add submenu items
    if (dataform.submenu && Array.isArray(dataform.submenu)) {
      dataform.submenu.forEach((item, index) => {
        customFiles.push({
          word: `Processing ${item.label} - ${item.action}`,
          percent: 0,
          type: "submenu",
          data: item,
        });
      });
    }

    // Add variables
    if (dataform.variables && Array.isArray(dataform.variables)) {
      dataform.variables.forEach((variable, index) => {
        customFiles.push({
          word: `Synchronizing variable: ${variable}`,
          percent: 0,
          type: "variable",
          data: variable,
        });
      });
    }

    return customFiles;
  }

  addFaviconToElements() {
    // Find all amd-border elements and add img tag
    const amdBorders = document.querySelectorAll(".amd .amd-border");

    amdBorders.forEach((border) => {
      // Check if img already exists
      if (border.querySelector("img")) {
        return;
      }

      // Create img element
      const img = document.createElement("img");
      img.src = "http://localhost/dev/assets/images/favicon.png";
      img.alt = "App Icon";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "100%";
      img.style.width = "auto";
      img.style.height = "auto";
      img.style.background = "transparent";

      // Add error handling
      img.onerror = () => {
        // If image fails to load, hide the image
        img.style.display = "none";
      };

      // Add img to border
      border.appendChild(img);
    });
  }
}

export async function installObject(version, store, id) {
  const dataform = await NXUI.ref.get(store, id);
  // Update all timestamp fields 
  const updatedDataform = dataform.applications ? {
    id: id,
    label: `Package ${dataform.className}`,
    submenu: dataform.applications.aliasNames ? dataform.applications.aliasNames.map(name => ({
      label: name,
      action: "install"
    })) : [],
    form: {},
    variables: dataform.applications.aliasNames || []
  } : dataform;


  const modalID = "UpgradePackages" + id;
     NXUI.modalHTML({
       elementById: modalID,
       styleClass: "w-600px",
       minimize: false,
       label: `Upgrade Package to Version ${version}`,
       getFormBy: ["name"], // ✅ Compatible dengan NexaModalHtml
       setDataBy: updatedDataform, // ✅ Standard validation approach
       onclick: false,
       content: `
   <div class="window microsoft">
     <div class="form">
       <div class="top">
         <div class="icon">
           <div class="amd">
             <div class="amd-border">
               <div class="amd-top"></div>
               <div class="amd-bottom"></div>
             </div>
           </div>
         </div>
         <div class="loader">
           <div class="text">Initializing package ${dataform.className}... 0%</div>
           <div class="bar"></div>
         </div>
       </div>
       <div class="middle">
         <div class="display">
           <div class="line">Preparing installation...</div>
         </div>
       </div>
       <div class="bottom"></div>
     </div>
   </div>


       `,
     });
     NXUI.nexaModal.open(modalID);
  NXUI.id("body_" + modalID).setStyle("padding", "0px");
  // Pass the retrieved form data to init function
  const installer = new NexaSimulator({
    updateInterval: 200,
    progressIncrement: 15,
    customFiles: updatedDataform, // Pass updatedDataform directly
    onProgress: (file, index, overallProgress) => {
      // Update the display with actual data being processed
      const displayElement = document.querySelector(".display");
      if (displayElement && file.percent > 0) {
        const lineElement = displayElement.children[index];
        if (lineElement) {
          lineElement.textContent = `${file.word}...${file.percent}%`;
        }
      }
    },
    onFileComplete: (file, index) => {
      // Show completion status
      const displayElement = document.querySelector(".display");
      if (displayElement) {
        const lineElement = displayElement.children[index];
        if (lineElement) {
          lineElement.style.color = "#4CAF50";
          lineElement.innerHTML = `✅ ${file.word} - Completed`;
        }
      }
    },
    onComplete: async () => {
      // Show completion message
      const loaderText = document.querySelector(".loader .text");
      if (loaderText) {
        loaderText.textContent = "Installation completed successfully!";
        loaderText.style.color = "#4CAF50";

        await NXUI.ref.mergeData(store, id, {packages:version});
        NXUI.nexaModal.close(modalID);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    },
  });

  // Memberikan kesempatan modal terbuka terlebih dahulu selama 3 detik sebelum memulai instalasi
  setTimeout(() => {
    installer.start();
  }, 3000);
}
