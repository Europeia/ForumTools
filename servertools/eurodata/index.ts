import { createObjectCsvWriter } from "csv-writer";
import { ObjectCsvWriterParams } from "csv-writer/src/lib/csv-writer-factory";
import * as fs from "fs";
import * as xml2json from "xml2json";

import { convertToRegion, Region, RegionData, RegionListRaw } from "./Region.model";

const dataMap = new Map<number, Region[]>();
// Javascript's months are 0-indexed because reasons.
let currDate = new Date(2018, 8, 29);

function addDays(oldDate: Date, days: number): Date {
  const newDate: Date = new Date(oldDate.valueOf());
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function formatNum(val: number): string {
  return val.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false });
}

const regionNames = [
  "the north pacific",
  "the pacific",
  "the south pacific",
  "the west pacific",
  "the east pacific",
  "europeia",
  "10000 islands",
  "the communist bloc",
  "europe",
  "karma"
];
let done = false;

while (!done) {
  currDate = addDays(currDate, 1);
  if (currDate.getTime() > new Date().getTime()) {
    done = true;
    break;
  }

  let file;

  try {
    const filePath = `dl/${formatNum(currDate.getFullYear())}-${formatNum(currDate.getMonth() + 1)}-${formatNum(
      currDate.getDate()
    )}-regions-xml`;
    console.log(`Fetching ${filePath}`);
    file = fs.readFileSync(filePath, "utf-8");
  } catch {
    continue;
  }

  const obj: RegionListRaw = JSON.parse(xml2json.toJson(file));
  const regions: Region[] = obj.REGIONS.REGION.filter((r) => regionNames.includes(r.NAME.toLowerCase())).map((r) => convertToRegion(r));

  dataMap.set(currDate.getTime(), regions);
}

const shaped = new Map<string, RegionData[]>();
regionNames.forEach((rn) => shaped.set(rn, []));

dataMap.forEach((today, timeStamp) => {
  today.forEach((region) => {
    shaped.get(region.name)?.push({
      date: new Date(timeStamp),
      deltaVotes: region.delegate?.votes ?? 0,
      deltaNations: region.nations.length,
      name: region.name
    });
  });
});

shaped.forEach((data, name) => {
  const filename = `${name.replace(/ /g, "")}.csv`;
  const params: ObjectCsvWriterParams = {
    path: `out/${filename}`,
    header: [
      { id: "date", title: "Date" },
      { id: "deltaVotes", title: "Votes" },
      { id: "deltaNations", title: "Nations" }
    ]
  };
  const csvWriter = createObjectCsvWriter(params);
  console.log(`Generating ${filename}`);
  csvWriter.writeRecords(data);
});
