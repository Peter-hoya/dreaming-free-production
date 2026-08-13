import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const siteRedirectsPath = "src/data/siteRedirects.json";
const guideRedirectsPath = "src/data/guideRedirects.json";
const outputPath = "public/_redirects";
const redirects = {
  ...JSON.parse(await readFile(siteRedirectsPath, "utf8")),
  ...JSON.parse(await readFile(guideRedirectsPath, "utf8")),
};

function encodePath(pathname) {
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(segment).replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/");
}

const lines = [
  "# Generated from src/data/siteRedirects.json and src/data/guideRedirects.json. Run npm run prebuild after editing either map.",
  ...Object.entries(redirects).map(([source, destination]) =>
    `${encodePath(source)} ${encodePath(destination)} 301!`),
  "",
];
const expected = lines.join("\n");

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== expected) {
    console.error(`${outputPath} is out of sync with the redirect data. Run npm run prebuild.`);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ redirects: Object.keys(redirects).length, status: "in-sync" }, null, 2));
  }
} else {
  await writeFile(outputPath, expected, "utf8");
  console.log(`Generated ${Object.keys(redirects).length} Netlify redirect rules in ${outputPath}.`);
}
