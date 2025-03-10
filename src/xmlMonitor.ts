import { XMLParser } from "fast-xml-parser";
import fs from 'fs';
import path from "path";
import { XmlData, FileOutputArgs, Car } from "./types";

export function processXml(filePath: string, folderPath: string) {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const parser = new XMLParser();
    const data: XmlData = parser.parse(xmlData);
    processData({
        folderPath,
        data,
    });
}

function processData(args: FileOutputArgs) {
    writeLaps(args);
    writeQualifying(args);
    writeQuickTime(args);
    writeScroling(args);
    writeTop(args, 3);
    writeTop(args, 5);
    writeGap(args);
}

function writeLaps(args: FileOutputArgs) {
  const { data, folderPath } = args;
    try {
        const lap = data.RACEDATA.SESSION.LAP;
        const lapsToGo = data.RACEDATA.SESSION.LAPSTOGO;
        const time = Number(data.RACEDATA.CAR[1].LAG) * -1;

        const output = `${lap}\n`;
        const outputPath = path.join(folderPath, 'laps in.txt');
        console.log(outputPath);
        fs.writeFileSync(outputPath, output);
    }   catch(err) {
        console.log(err);
    }
}

function writeGap(args: FileOutputArgs) {
  const { data, folderPath } = args;
    try {
        const time = Number(data.RACEDATA.CAR[1].LAG) * -1;

        const output = `+${time}\n`;
        const outputPath = path.join(folderPath, 'gap.txt');
        console.log(outputPath);
        fs.writeFileSync(outputPath, output);
    }   catch(err) {
        console.log(err);
    }
}

function writeQualifying(args: FileOutputArgs) {
  const { data, folderPath } = args;
    try {
        // console.log(JSON.stringify(data));
        const lines = data.RACEDATA.CAR.filter((car: Car) => car.NAME != 'N/A').sort((a: Car, b: Car) => a.POSITION - b.POSITION).map((car: Car) => {
        const fastTime = isNaN(car.FASTTIME) ? "" : car.FASTTIME?.toFixed(3);
            return `${car.POSITION}) ${car.CARNO}-${car.NAME.split(' ')[1]} - ${fastTime}`;
        });

        const output = lines.join('\n');
        const outputPath = path.join(folderPath, 'Qualifying.txt');
        console.log(outputPath);
        fs.writeFileSync(outputPath, output);
    }   catch(err) {
        console.log(err);
    }
}

function writeQuickTime(args: FileOutputArgs) {
  const { data, folderPath } = args;
    try {
        // console.log(JSON.stringify(data));
        const top5 = data.RACEDATA.CAR.filter((a: Car) => a.FASTTIME && !isNaN(a.FASTTIME)).sort((a: Car, b: Car) => a.FASTTIME - b.FASTTIME).slice(0, 1).map((car: Car) => {
            return `QT ${car.CARNO}-${car.NAME.split(' ')[1]} (${car.FASTTIME.toFixed(3)})`;
        });

        const output = top5.join('\n');
        const outputPath = path.join(folderPath, 'Quick Time.txt');
        console.log(outputPath);
        fs.writeFileSync(outputPath, output);
    }   catch(err) {
        console.log(err);
    }
}

function writeScroling(args: FileOutputArgs) {
  const { data, folderPath } = args;
    try {
        // console.log(JSON.stringify(data));
        const all = data.RACEDATA.CAR.filter((a: Car) => a.NAME != 'N/A').sort((a: Car, b: Car) => a.FASTTIME - b.FASTTIME).map((car: Car) => {
            return `${car.POSITION}) ${car.CARNO}-${car.NAME.split(' ')[1]}`;
        });

        const output = `RO Lap ${data.RACEDATA.SESSION.LAP}]  ` + all.join('  ') + '          ';

        const outputPath = path.join(folderPath, 'Scrolling.txt');
        console.log(outputPath);
        fs.writeFileSync(outputPath, output);
    }   catch(err) {
        console.log(err);
    }
}

function writeTop(args: FileOutputArgs, numberOfCars: number) {
  const { data, folderPath } = args;
    try {
      const carTotal = numberOfCars < (data.RACEDATA?.CAR?.length || 0) ? numberOfCars : data.RACEDATA?.CAR?.length;
        const top = data.RACEDATA.CAR.filter((car: Car) => car.POSITION <= numberOfCars).sort((a: Car, b: Car) => a.POSITION - b.POSITION).map((car: Car) => {
            return `${car.POSITION}) ${car.CARNO}-${car.NAME.split(' ')[1]}`;
        });

        const output = top.join('\n');
        const outputPath = path.join(folderPath, `top${carTotal}.txt`);
        console.log(outputPath);
        fs.writeFileSync(outputPath, output);
    }   catch(err) {
        console.log(err);
    }
}

module.exports = {
    processXml,
}