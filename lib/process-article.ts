import * as cheerio from "cheerio";
import type { Element as DomElement } from "domhandler";
import sanitizeHtml from "sanitize-html";
import { isPlayableTitle } from "@/lib/titles";

const REMOVE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "link",
  "meta",
  "svg",
  "audio",
  "video",
  ".mw-editsection",
  ".navbox",
  ".vertical-navbox",
  ".sistersitebox",
  ".mw-empty-elt",
  ".toc",
  "#toc",
  ".reflist",
  ".references",
  ".refbegin",
  ".mw-references-wrap",
  ".reference",
  "sup.reference",
  ".mw-authority-control",
  ".shortdescription",
  "#coordinates",
  ".mw-indicators",
  ".mw-kartographer-container",
  ".portalbox",
  ".navbox-styles",
  ".navbar",
  ".mw-collapsible-toggle",
  // Do not strip `.noprint` — Wikipedia marks plenty of real body content with it.
].join(", ");

const DROP_SECTIONS = new Set([
  "References",
  "External_links",
  "Further_reading",
  "Notes",
  "Bibliography",
  "Sources",
  "Citations",
  "Footnotes",
  "Works_cited",
  "Primary_sources",
  "Secondary_sources",
]);

const IMAGE_HOSTS = [
  "https://upload.wikimedia.org/",
  "https://thumb.wikimedia.org/",
  "https://wikimedia.org/api/rest_v1/media/math/",
];

function absolutize(src: string) {
  if (src.startsWith("//")) return `https:${src}`;
  return src;
}

function titleFromHref(href: string) {
  let path = href.trim();
  if (!path || path.startsWith("#") || path.startsWith("//")) return null;

  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const url = new URL(path);
      if (!url.hostname.endsWith("wikipedia.org")) return null;
      path = `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return null;
  }

  const queryIndex = path.indexOf("?");
  if (queryIndex !== -1) {
    const params = new URLSearchParams(path.slice(queryIndex + 1));
    const action = params.get("action");
    if (action && action !== "view") return null;
    if (params.get("redlink") === "1") return null;
    const titleParam = params.get("title");
    if (!titleParam || !path.startsWith("/w/index.php")) return null;
    path = `/wiki/${titleParam}`;
  }

  if (!path.startsWith("/wiki/")) return null;
  let rest = path.slice("/wiki/".length);
  const hashIndex = rest.indexOf("#");
  let hash = "";
  if (hashIndex !== -1) {
    hash = rest.slice(hashIndex + 1);
    rest = rest.slice(0, hashIndex);
  }
  let title = rest;
  try {
    title = decodeURIComponent(rest);
  } catch {
    return null;
  }
  title = title.replace(/_/g, " ").trim();
  if (!isPlayableTitle(title)) return null;
  let decodedHash = hash;
  try {
    decodedHash = decodeURIComponent(hash);
  } catch {
    decodedHash = hash;
  }
  return { title, hash: decodedHash };
}

/** Keep the full article body — only strip chrome / dead-end sections. */
const MAX_IMAGES = 96;

function removeHeadingBlock($: cheerio.CheerioAPI, element: DomElement, level: number) {
  const node = $(element);
  let sibling = node.next();
  node.remove();
  while (sibling.length) {
    const next = sibling.next();
    const inner = sibling.is("h2, h3, h4") ? sibling : sibling.find("h2, h3, h4").first();
    const tag = inner.prop("tagName")?.toString().toLowerCase() ?? "";
    if (/^h[2-4]$/.test(tag) && Number(tag.slice(1)) <= level) break;
    sibling.remove();
    sibling = next;
  }
}

function dropSections($: cheerio.CheerioAPI) {
  const root = $("#speedwikipedia-root");
  const doomed: { element: DomElement; level: number }[] = [];
  root.find(".mw-heading, h2, h3").each((_, element) => {
    const node = $(element);
    const heading = node.is("h2, h3") ? node : node.find("h2, h3").first();
    const id = heading.attr("id") ?? "";
    if (!DROP_SECTIONS.has(id)) return;
    const level = Number(heading.prop("tagName")?.toString().slice(1) ?? "2");
    doomed.push({ element, level });
  });
  for (const item of doomed) removeHeadingBlock($, item.element, item.level);
}

export function processArticleHtml(html: string) {
  const $ = cheerio.load(`<div id="speedwikipedia-root">${html}</div>`, {
    xml: false,
  });
  const root = $("#speedwikipedia-root");

  root.find(REMOVE_SELECTORS).remove();
  root.find('[style*="display:none"], [style*="display: none"]').remove();
  dropSections($);

  let keptImages = 0;
  root.find("img").each((_, element) => {
    const image = $(element);
    if (keptImages >= MAX_IMAGES) {
      // Prefer keeping later thumbs out over nuking the whole rest of the article.
      const thumb = image.closest(".thumb, figure, .infobox-image");
      if (thumb.length) thumb.remove();
      else image.remove();
      return;
    }
    const src = absolutize(
      image.attr("src") ?? image.attr("data-src") ?? image.attr("data-file-src") ?? "",
    );
    if (!IMAGE_HOSTS.some((host) => src.startsWith(host))) {
      image.remove();
      return;
    }
    keptImages += 1;
    image.attr("src", src);
    image.attr("loading", "lazy");
    image.attr("decoding", "async");
    // Keep a modest srcset when present so retina still looks sharp.
    const srcset = image.attr("srcset");
    if (srcset) {
      const absolute = srcset
        .split(",")
        .map((part) => {
          const [url, size] = part.trim().split(/\s+/);
          if (!url) return "";
          const full = absolutize(url);
          if (!IMAGE_HOSTS.some((host) => full.startsWith(host))) return "";
          return size ? `${full} ${size}` : full;
        })
        .filter(Boolean)
        .join(", ");
      if (absolute) image.attr("srcset", absolute);
      else image.removeAttr("srcset");
    }
    image.removeAttr("data-src");
    image.removeAttr("data-file-src");
  });

  root.find("a").each((_, element) => {
    const link = $(element);
    const href = link.attr("href") ?? "";
    if (link.hasClass("new")) {
      link.replaceWith(link.contents());
      return;
    }
    if (href.startsWith("#")) return;

    const article = titleFromHref(href);
    if (!article) {
      link.replaceWith(link.contents());
      return;
    }

    link.attr("href", article.hash ? `#${article.hash}` : "#");
    link.attr("data-title", article.title);
    if (article.hash) link.attr("data-hash", article.hash);
    else link.removeAttr("data-hash");
    link.attr("class", "wiki-link");
    link.attr("title", `Explore ${article.title}`);
    link.attr("aria-label", `Explore ${article.title}`);
    link.removeAttr("rel");
    link.removeAttr("target");
  });

  root.find("*").each((_, element) => {
    const node = $(element);
    const attribs = "attribs" in element ? element.attribs : null;
    if (!attribs) return;
    for (const name of Object.keys(attribs)) {
      // Keep srcset for sharp thumbs; strip handlers and inline styles only.
      if (name.startsWith("on") || name === "style") {
        node.removeAttr(name);
      }
    }
  });

  root.find("table.wikitable").wrap('<div class="table-scroll"></div>');
  root.find("table.infobox").wrap('<div class="infobox-wrap"></div>');

  const cleaned = root.html() ?? "";
  return sanitizeHtml(cleaned, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "caption",
      "span",
      "div",
      "section",
      "sup",
      "sub",
      "abbr",
      "cite",
      "hr",
      "small",
      "wbr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "center",
    ],
    allowedAttributes: {
      "*": ["class", "id", "role", "title", "colspan", "rowspan", "scope"],
      a: ["href", "class", "id", "data-title", "data-hash", "aria-label", "title"],
      img: ["src", "srcset", "alt", "width", "height", "class", "loading", "decoding"],
      td: ["colspan", "rowspan", "class", "id", "headers"],
      th: ["colspan", "rowspan", "scope", "class", "id", "headers"],
      ol: ["class", "start", "id"],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
  });
}

export function extractLeadDescription(html: string) {
  const $ = cheerio.load(html);
  const text = $("p")
    .filter((_, element) => $(element).text().trim().length > 40)
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}
