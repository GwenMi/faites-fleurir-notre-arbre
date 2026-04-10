import { useEffect } from "react";

/**
 * Dynamic SEO meta tags for each page.
 * Updates <title>, description, OG and Twitter tags in the document <head>.
 */
export default function SEOHead({ title, description, url, image, type = "website", schema }) {
  const siteName = "Fleurs de Fête";
  const defaultImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png";
  const fullTitle = title ? `${title} — ${siteName}` : siteName;
  const img = image || defaultImage;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("description", description);
    setOG("title", fullTitle);
    setOG("description", description);
    setOG("image", img);
    setOG("url", url || window.location.href);
    setOG("type", type);
    setTwitter("title", fullTitle);
    setTwitter("description", description);
    setTwitter("image", img);
    setCanonical(url || window.location.href);

    if (schema) {
      let el = document.getElementById("__schema_page__");
      if (!el) {
        el = document.createElement("script");
        el.id = "__schema_page__";
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    }
  }, [fullTitle, description, img, url, type, schema]);

  return null;
}

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setOG(prop, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="og:${prop}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", `og:${prop}`); document.head.appendChild(el); }
  el.content = content;
}

function setTwitter(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="twitter:${name}"]`);
  if (!el) { el = document.createElement("meta"); el.name = `twitter:${name}`; document.head.appendChild(el); }
  el.content = content;
}

function setCanonical(href) {
  let el = document.querySelector("link[rel='canonical']");
  if (!el) { el = document.createElement("link"); el.rel = "canonical"; document.head.appendChild(el); }
  el.href = href;
}