import { fetchCatalogPdfData, buildPdfPages } from "./catalogPdfBuilder";

function slugify(name) {
  return (name || "catalog")
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function collectPdfLinks(pageEl) {
  const pageRect = pageEl.getBoundingClientRect();
  return Array.from(pageEl.querySelectorAll("[data-pdf-link]"))
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        url: el.getAttribute("data-pdf-link"),
        x: rect.left - pageRect.left,
        y: rect.top - pageRect.top,
        w: rect.width,
        h: rect.height,
      };
    })
    .filter((link) => link.url && link.w > 0 && link.h > 0);
}

function applyPdfLinks(doc, links, spec, pdfW, pdfH) {
  const scaleX = pdfW / spec.widthPx;
  const scaleY = pdfH / spec.heightPx;

  for (const link of links) {
    doc.link(link.x * scaleX, link.y * scaleY, link.w * scaleX, link.h * scaleY, { url: link.url });
  }
}

async function renderPageToCanvas(pageHtml, spec) {
  const { default: html2canvas } = await import("html2canvas");

  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:0;top:0;z-index:-9999;opacity:0;pointer-events:none;width:${spec.widthPx}px;height:${spec.heightPx}px;overflow:hidden`;
  host.innerHTML = pageHtml;
  document.body.appendChild(host);

  const pageEl = host.querySelector(".pdf-page") || host.firstElementChild;

  try {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const links = collectPdfLinks(pageEl);

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: "#ffffff",
      width: spec.widthPx,
      height: spec.heightPx,
      windowWidth: spec.widthPx,
      windowHeight: spec.heightPx,
      imageTimeout: 20000,
      onclone: (clonedDoc) => {
        const el = clonedDoc.querySelector(".pdf-page");
        if (el) {
          el.style.position = "relative";
          el.style.overflow = "hidden";
        }
      },
    });

    return { canvas, links };
  } finally {
    document.body.removeChild(host);
  }
}

export async function generateCatalogPdf({ scope = "full", productId, categoryId, lotId, onProgress }) {
  onProgress?.("loading");
  const data = await fetchCatalogPdfData({ scope, productId, categoryId, lotId });

  onProgress?.("rendering");
  const { pages, spec } = buildPdfPages(data);

  onProgress?.("generating");
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfW = 210;
  const pdfH = 297;

  for (let i = 0; i < pages.length; i++) {
    onProgress?.(`page-${i + 1}-${pages.length}`);
    const { canvas, links } = await renderPageToCanvas(pages[i], spec);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    if (i > 0) doc.addPage([pdfW, pdfH], "portrait");
    doc.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
    applyPdfLinks(doc, links, spec, pdfW, pdfH);
  }

  const filename = `zareoon-catalog-${slugify(data.title)}-${Date.now()}.pdf`;
  doc.save(filename);

  onProgress?.("done");
  return { filename, pageCount: pages.length };
}
