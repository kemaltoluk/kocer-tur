import { HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import Image from "@11ty/eleventy-img";
import path from "node:path";

/**
 * Duyarlı görsel üretir: AVIF + WebP + JPEG, birden çok genişlikte.
 * Kullanım:  {% resim "src/assets/img/filo/x.jpg", "alt metni", "(min-width:900px) 50vw, 100vw" %}
 */
async function resimShortcode(
  src,
  alt,
  sizes = "100vw",
  sinif = "",
  oncelik = false,
  odak = ""
) {
  if (alt === undefined) {
    throw new Error(`Görselde alt metni eksik: ${src}`);
  }

  const metadata = await Image(src, {
    widths: [420, 760, 1100, 1600],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/assets/img/uretilen/",
    urlPath: "/assets/img/uretilen/",
    filenameFormat: (id, s, width, format) => {
      const isim = path.basename(s, path.extname(s));
      return `${isim}-${width}w.${format}`;
    },
  });

  const nitelikler = {
    alt,
    sizes,
    class: sinif,
    loading: oncelik ? "eager" : "lazy",
    fetchpriority: oncelik ? "high" : "auto",
    decoding: "async",
  };

  // Dikey çekilmiş fotoğraflarda araç genelde alt yarıda kalıyor.
  // "odak" ile kırpmanın hangi noktayı merkez alacağını belirliyoruz.
  if (odak) nitelikler.style = `object-position:${odak}`;

  return Image.generateHTML(metadata, nitelikler);
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/blog/feed.xml",
    collection: { name: "blog", limit: 20 },
    metadata: {
      language: "tr",
      title: "Koçer Tur Blog",
      subtitle: "Personel servisi, okul servisi ve grup taşımacılığı üzerine yazılar.",
      base: (process.env.URL || process.env.DEPLOY_PRIME_URL || "http://localhost:8080").replace(/\/+$/, "") + "/",
      author: { name: "Koçer Tur" },
    },
  });

  // Statik dosyalar
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img/marka": "assets/img/marka" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  eleventyConfig.addWatchTarget("src/assets/css/");

  // Shortcode'lar
  eleventyConfig.addAsyncShortcode("resim", resimShortcode);

  eleventyConfig.addShortcode("yil", () => `${new Date().getFullYear()}`);

  // Filtreler
  eleventyConfig.addFilter("tarih", (value) =>
    new Date(value).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  eleventyConfig.addFilter("isoTarih", (value) => new Date(value).toISOString());

  // "0554 159 56 01" -> "+905541595601"  (tel: ve WhatsApp bağlantıları için)
  eleventyConfig.addFilter("telLink", (value) => {
    const rakam = String(value).replace(/\D/g, "");
    return rakam.startsWith("0") ? `+9${rakam}` : `+${rakam}`;
  });

  eleventyConfig.addFilter("limit", (dizi, n) => (dizi || []).slice(0, n));

  eleventyConfig.addFilter("waLink", (value) => {
    const rakam = String(value).replace(/\D/g, "");
    return rakam.startsWith("0") ? `9${rakam}` : rakam;
  });

  eleventyConfig.addCollection("blog", (api) =>
    api.getFilteredByGlob("src/blog/*.md").reverse()
  );

  eleventyConfig.addCollection("hizmetler", (api) =>
    api
      .getFilteredByGlob("src/hizmetler/*.md")
      .sort((a, b) => (a.data.sira || 99) - (b.data.sira || 99))
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
