import { AlignType } from 'rc-table/lib/interface';

/// Form data structure
export interface FormValues {
    hotFluid: {
      inletTemp: number;
      outletTemp: number;
    },
    minAppTemp : number;
    coldFluid: Array<{
      [key: string]: number;
    }>
  }

/// Form data submit structure
export  interface FormValuesData {
      [key: string]: string;
    }
  
/// Cascade Table structure
export interface DataColumn {
      title: string;
      dataIndex: string;
      align: AlignType  
    }

/// Chart Data structure
export interface ChartDataItem {
    heatLoad: string;
    temperature: string;
    category: string;
      }

/// Result summary Data structure
export interface ResultData{
    totalHeatLoad: number;
    heatingMediumInletTemp: number;
    heatingMediumOutletTemp: number;
    minAppTemp: number;
    minHeatCapacityFlowrate: number;
    pinchColdFluidTemp: number;
    pinchHotFluidTemp: number;
}
