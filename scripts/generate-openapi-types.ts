import openapiTS, { astToString } from "openapi-typescript";
import { writeFile } from "node:fs/promises";
import { openapiDocument } from "../lib/openapi";

async function generate() {
  const nodes = await openapiTS(JSON.stringify(openapiDocument));
  const source = astToString(nodes);

  await writeFile(
    new URL("../lib/api/generated/openapi.ts", import.meta.url),
    source,
    "utf8",
  );

  console.log("Generated lib/api/generated/openapi.ts");
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
