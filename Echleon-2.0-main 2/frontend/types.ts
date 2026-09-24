
export interface EnergyData {
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  utilizedPower: number;
  savedPower: number;
  isPhantom: boolean;
}

export interface HardwareState {
  ledOn: boolean;
  powerCutoffEnabled: boolean;
  phantomDetected: boolean;
  currentConsumption: number;
  totalUtilized: number;
  totalSaved: number;
}
