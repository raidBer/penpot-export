penpot.ui.open("Penpot plugin starter template", `?theme=${penpot.theme}`);

function randomText(length:number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function printVersions() {
  penpot.currentFile?.findVersions().then((versions) => {
      versions.map((version)=> {
        console.log(version.label)
      })
      console.log("==========================")
    })
}

penpot.ui.onMessage<string>((message) => {
  if (message === "blue-stripe") {
    // code to test

    const board = penpot.createBoard();

    board.resize(1000, 1000);

    // Blue stripe
    const blueStripe = penpot.createRectangle();
    blueStripe.resize(100, 200);
    blueStripe.x = 0;
    blueStripe.y = 0;
    blueStripe.fills = [{ fillColor: "#0055A4", fillOpacity: 1 }];
    board.appendChild(blueStripe);

    penpot.currentFile?.saveVersion(randomText(8))
  }
});


penpot.ui.onMessage<string>((message) => {
  if (message === "restore-version") {
      penpot.currentFile?.findVersions().then((versions) => {
        versions[0].remove(); 
        versions[1].restore();        
      });
  }
});

penpot.ui.onMessage<string>((message) => {
  if (message === "print-versions") {
      printVersions()
    };
  }
);

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
