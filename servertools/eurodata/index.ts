import * as fs from "fs";
const file = fs.readFileSync("dl/2018-09-30-regions-xml", "utf-8");
console.log(file);