import * as fs from "fs";
import * as xml2json from "xml2json";

import { convertToRegion, Region, RegionListRaw } from "./Region.model";

const dataMap = new Map<Date, Region[]>();
// Javascript's months are 0-indexed because reasons.
let currDate = new Date(2018, 8, 30);

let found = true;

function formatNum(val: number): string {
  return val.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false });
}

while (found) {
  let file;

  try {
    const filePath = `dl/${formatNum(currDate.getFullYear())}-${formatNum(currDate.getMonth() + 1)}-${formatNum(
      currDate.getDate()
    )}-regions-xml`;
    console.log(`Fetching ${filePath}`);
    file = fs.readFileSync(filePath, "utf-8");
  } catch {
    found = false;
    break;
  }

  const obj: RegionListRaw = JSON.parse(xml2json.toJson(file));
  const regions: Region[] = obj.REGIONS.REGION.map((r) => convertToRegion(r));

  dataMap.set(currDate, regions);
  const newDate = new Date(currDate.valueOf());
  newDate.setDate(newDate.getDate() + 1);
  currDate = new Date(newDate.getTime());
}

console.log(Array.from(dataMap.keys()).map((k) => k));
