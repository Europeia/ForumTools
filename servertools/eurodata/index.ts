import { createObjectCsvWriter } from "csv-writer";
import { ObjectCsvWriterParams } from "csv-writer/src/lib/csv-writer-factory";
import * as fs from "fs";
import * as xml2json from "xml2json";

import { convertToRegion, Region, RegionData, RegionListRaw } from "./Region.model";

const dataMap = new Map<number, Region[]>();
// Javascript's months are 0-indexed because reasons.
let currDate = new Date(2021, 9, 30);

let found = true;

function addDays(oldDate: Date, days: number): Date {
  const newDate: Date = new Date(oldDate.valueOf());
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function formatNum(val: number): string {
  return val.toLocaleString(undefined, { minimumIntegerDigits: 2, useGrouping: false });
}

const regionNames = [
  "The North Pacific",
  "The Pacific",
  "The South Pacific",
  "The West Pacific",
  "The East Pacific",
  "Europeia",
  "10000 Islands",
  "The Communist Bloc",
  "Europe",
  "Karma"
];

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
  const regions: Region[] = obj.REGIONS.REGION.filter((r) => regionNames.includes(r.NAME)).map((r) => convertToRegion(r));

  dataMap.set(currDate.getTime(), regions);
  currDate = addDays(currDate, 1);
}

const shaped = new Map<string, RegionData[]>();
regionNames.forEach((rn) => shaped.set(rn, []));

dataMap.forEach((today, key, map) => {
  const yesterdayDate = addDays(new Date(key), -1);
  const yDayList = map.get(yesterdayDate.getTime());

  if (yDayList) {
    yDayList.map((yesterday) => {
      const data = today.find((r) => r.name === yesterday.name);
      if (data) {
        const deltaVotes = (data.delegate?.votes ?? 0) - (yesterday.delegate?.votes ?? 0);
        const deltaNations = data.nations.length - yesterday.nations.length;
        shaped.get(data.name)?.push({ date: new Date(key), deltaVotes, deltaNations, name: data.name });
        console.log(shaped.get(data.name));
      }
    });

    // console.log([new Date(key), deltaVotes, deltaNations, `${(((data.delegate?.votes ?? 0) / data.nations.length) * 100).toFixed(2)}%`]);
  }
});

shaped.forEach((data, name) => {
  const filename = `${name.replace(/ /g, "")}.csv`;
  const params: ObjectCsvWriterParams = {
    path: `out/${filename}`,
    header: [
      { id: "date", title: "Date" },
      { id: "deltaVotes", title: "VoteDelta" },
      { id: "deltaNations", title: "NationsDelta" }
    ]
  };
  const csvWriter = createObjectCsvWriter(params);
  console.log(`Generating ${filename}`);
  csvWriter.writeRecords(data);
});
