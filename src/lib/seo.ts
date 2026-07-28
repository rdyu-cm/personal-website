const httpUrl = /^https?:\/\//i;

export const serializeJsonLd = (value: object | object[]) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export const resolveSocialImage = (
  image: string,
  site: string | URL,
  baseUrl: string,
) => {
  if (httpUrl.test(image)) return image;

  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const siteBase = new URL(base, site);
  return new URL(image.replace(/^\/+/, ""), siteBase).toString();
};
