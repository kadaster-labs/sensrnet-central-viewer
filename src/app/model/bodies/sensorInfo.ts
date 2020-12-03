export class SensorInfo {
  constructor(
    public name: string,
    public typeName: string,
    public category: string,
    public active: boolean,
    public aim: string,
    public description: string,
    public manufacturer: string,
    public theme?: Array<string>,
    public typeDetails?: Array<object>,
    public dataStreams?: Array<any>,
  ) { }
}
