penpot.ui.open("Export WordPress", `?theme=${penpot.theme}`);

// Convert a Penpot color object to hex string
function colorToHex(color: string | undefined): string {
  if (!color) return "#000000";
  // Color is already in hex format from Penpot
  return color;
}

// Convert a single Penpot node to WordPress-compatible HTML
async function convertNodeToHtml(node: any): Promise<string> {
  const type = node.type;

  // Board, Frame or Group → <div> container
  if (type === "board" || type === "frame" || type === "group") {
    const childrenHtml = node.children
      ? await Promise.all(
          node.children.map((child: any) => convertNodeToHtml(child)),
        )
      : [];
    return `<div style="padding:8px;">\n${childrenHtml.join("\n")}\n</div>`;
  }

  // Rectangle → <div> with size and background (skip if it has an image fill)
  if (type === "rectangle") {
    const width = Math.round(node.width || 0);
    const height = Math.round(node.height || 0);
    const fills = node.fills || [];

    // Skip rectangles with image fills
    for (const fill of fills) {
      if (fill.fillImage) {
        return "";
      }
    }

    // Otherwise, treat as a regular rectangle with background color
    const backgroundColor =
      fills.length > 0 && fills[0].fillColor
        ? colorToHex(fills[0].fillColor)
        : "";

    const styles = [
      `width:${width}px`,
      `height:${height}px`,
      backgroundColor ? `background:${backgroundColor}` : "",
    ]
      .filter((s) => s)
      .join(";");

    return `<div style="${styles};"></div>`;
  }

  // Text → <p> element
  if (type === "text") {
    const content = node.characters || "";
    const fontSize = Math.round(node.fontSize || 16);
    const fontWeight = node.fontWeight || 400;
    const fills = node.fills || [];
    const color =
      fills.length > 0 && fills[0].fillColor
        ? colorToHex(fills[0].fillColor)
        : "#000000";

    const styles = [
      `font-size:${fontSize}px`,
      `font-weight:${fontWeight}`,
      `color:${color}`,
    ].join(";");

    return `<p style="${styles};">${content}</p>`;
  }

  // Circle/Ellipse → <div> with border-radius
  if (type === "circle" || type === "ellipse") {
    const width = Math.round(node.width || 0);
    const height = Math.round(node.height || 0);
    const fills = node.fills || [];

    // Skip circles with image fills
    for (const fill of fills) {
      if (fill.fillImage) {
        return "";
      }
    }

    const backgroundColor =
      fills.length > 0 && fills[0].fillColor
        ? colorToHex(fills[0].fillColor)
        : "";

    const styles = [
      `width:${width}px`,
      `height:${height}px`,
      `border-radius:50%`,
      backgroundColor ? `background:${backgroundColor}` : "",
    ]
      .filter((s) => s)
      .join(";");

    return `<div style="${styles};"></div>`;
  }

  // Image → skip images entirely
  if (type === "image") {
    return "";
  }

  // Unsupported element → skip silently
  return "";
}

// Main export handler
penpot.ui.onMessage<string>(async (message) => {
  if (message === "export-html") {
    const selection = penpot.selection;

    // Check if anything is selected
    if (!selection || selection.length === 0) {
      penpot.ui.sendMessage({
        type: "export-result",
        html: "",
        error:
          "Aucun élément sélectionné. Veuillez sélectionner un cadre, un groupe ou des éléments à exporter.",
      });
      return;
    }

    // Convert all selected elements
    try {
      const htmlParts = await Promise.all(
        selection.map((node) => convertNodeToHtml(node)),
      );
      const finalHtml = htmlParts.filter((html) => html).join("\n\n");

      penpot.ui.sendMessage({
        type: "export-result",
        html: finalHtml,
        error: "",
      });
    } catch (error) {
      penpot.ui.sendMessage({
        type: "export-result",
        html: "",
        error: `Échec de l'exportation: ${error}`,
      });
    }
  }
});

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    source: "penpot",
    type: "themechange",
    theme,
  });
});
