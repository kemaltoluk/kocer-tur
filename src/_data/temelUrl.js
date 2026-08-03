import fs from "node:fs";

/**
 * Sitenin kanonik adresi.
 *
 * Netlify derleme sırasında şu değişkenleri kendisi tanımlar:
 *   URL              → sitenin asıl adresi (özel alan adı varsa o, yoksa *.netlify.app)
 *   DEPLOY_PRIME_URL → dal/önizleme derlemelerinin adresi
 *
 * Böylece alan adı alınana kadar canonical/sitemap/OG adresleri
 * otomatik olarak gerçek Netlify adresini gösterir; alan adı bağlandığında
 * hiçbir kod değişikliği gerekmeden kendiliğinden ona döner.
 */
export default function () {
  const netlify = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (netlify) return netlify.replace(/\/+$/, "");

  try {
    const site = JSON.parse(fs.readFileSync("src/_data/site.json", "utf8"));
    if (site.url && !site.url.includes("DOLDURULACAK")) {
      return site.url.replace(/\/+$/, "");
    }
  } catch {
    /* site.json okunamazsa yerel adrese düş */
  }

  return "http://localhost:8080";
}
