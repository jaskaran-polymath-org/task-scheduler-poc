import fs from "fs";
import path from "path";
import YAML from "yaml";

const configPath = path.resolve(__dirname, "../jobs.yaml");
const file = fs.readFileSync(configPath, "utf8");
export const config = YAML.parse(file);