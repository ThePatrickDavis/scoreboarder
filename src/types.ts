interface FileOutputArgs {
  folderPath: string;
  data: XmlData;
}
interface XmlData {
  RACEDATA: RaceData;
  [key: string]: any;
}
interface RaceData {
  CAR: Car[];
  SESSION: Session;
}

interface Car {
  CARNO: string;
  NAME: string;
  FASTTIME?: number;
  POSITION: number;
  LAG: string;
}

interface Session {
  LAP: number;
  LAPSTOGO: number;
}

export { XmlData, FileOutputArgs, RaceData, Car, Session }; 
