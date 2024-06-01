import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { AlignType } from 'rc-table/lib/interface';
import { FormValues, FormValuesData, DataColumn, ChartDataItem, ResultData } from './types'; // Adjust the path if necessary


type DataColumns = DataColumn[];
type ChartDataItems = ChartDataItem[]

export const calculateHeatIntegration = (values: FormValuesData, columns: DataColumns, setDataSource: any, setDataGraphSource: any, 
    setShowResult: any, setDataSummary:any) => {

    let coldFluid: { [key: string]: { [key: string]: number } } = {};
    let hotFluid: { [key: string]: number } = {};
    let minAppTemp = NaN;
   
    const coldFluidTempSet = new Set<number>();
    const netHeatCapacity: Array<number> = [];
    const intervalHeatLoad: Array<number> = [];
    const heatLoadCascade: Array<number> = [0];
    const minHeatCapacityFlowrate: Array<number> = [0];

    let heatLoadCascadeValue = 0;

    Object.keys(values).forEach(key => {
        if (key === "minAppTemp") {
            minAppTemp = parseFloat(values[key]);
        } else if (key.split('_').length === 2) {
            const parts = key.split('_');
            const name = parts[0];
            const index = parts[1];

            if (name!=="heatLoad"){
            coldFluidTempSet.add(parseFloat(values[key]));
            }

            if (!coldFluid[index]) {
                coldFluid[index] = { [name]: parseFloat(values[key]) };
            } else {
                coldFluid[index][name] = parseFloat(values[key]);
            }
        } else {
            hotFluid[key] = parseFloat(values[key]);
        }
    });
    let coldFluidTemp = Array.from(coldFluidTempSet);
    coldFluidTemp.sort((a, b) => b - a);
    const lengthColdFluidTemp = coldFluidTemp.length;

    
    for (let i = 0; i < lengthColdFluidTemp - 1; i++) {
        let curHeatFlux = 0;
        const curTemp = coldFluidTemp[i];
        const curTempLower = coldFluidTemp[i + 1];
        console.log(curTemp, curTempLower)
        const tempDiff = curTemp - curTempLower;

        Object.keys(coldFluid).forEach(key => {
            const curInletTemp = coldFluid[key]["inletTemp"];
            const curOutletTemp = coldFluid[key]["outletTemp"];
            const curHeatLoad = coldFluid[key]["heatLoad"];
            if (curOutletTemp >= curTemp && curInletTemp <= curTempLower) {
                curHeatFlux += curHeatLoad / (curOutletTemp - curInletTemp);
            }
        });

        let curIntervalHeatLoad = curHeatFlux * tempDiff;
        heatLoadCascadeValue += curIntervalHeatLoad;
        netHeatCapacity.push(curHeatFlux);
        intervalHeatLoad.push(curIntervalHeatLoad);
        heatLoadCascade.push(heatLoadCascadeValue);
        const curMinHeatCapacityFlowrate = parseFloat((heatLoadCascadeValue / (hotFluid["inletTemp"] - minAppTemp - curTempLower)).toFixed(4));
        minHeatCapacityFlowrate.push(curMinHeatCapacityFlowrate);
    }

    console.log(netHeatCapacity, intervalHeatLoad, heatLoadCascade, minHeatCapacityFlowrate);

    setDataSource(generateHeatIntegrationTableData(coldFluidTemp, netHeatCapacity, intervalHeatLoad, heatLoadCascade, 
        minHeatCapacityFlowrate))

    /// Calculate HMRT
    const minHeatCapacityFlowrateVal = Math.max(...minHeatCapacityFlowrate)
    const heatingMediumReturnTemperature = hotFluid["inletTemp"] - (heatLoadCascadeValue/minHeatCapacityFlowrateVal)
    
    setDataGraphSource(generateHeatIntegrationGraph(heatingMediumReturnTemperature, heatLoadCascadeValue, hotFluid['inletTemp'], 
    intervalHeatLoad, heatLoadCascade, minHeatCapacityFlowrateVal, minHeatCapacityFlowrate, coldFluidTemp, minAppTemp ))

    setDataSummary(generateSummaryData(heatLoadCascadeValue, hotFluid['inletTemp'], heatingMediumReturnTemperature, 
        minAppTemp, minHeatCapacityFlowrateVal,  minHeatCapacityFlowrate, coldFluidTemp))
    setShowResult(true)
    
};


/// For generation cascade table data
const generateHeatIntegrationTableData = (coldFluidTemp:Array<number>, netHeatCapacity:Array<number>, 
    intervalHeatLoad:Array<number>, heatLoadCascade:Array<number>, minHeatCapacityFlowrate:Array<number>) => {
    let tableData: Array<{ [key: string]: number | string }> = [];
    let even = 0
    let odd = 0

    for (let i = 0; i < 2*coldFluidTemp.length - 1 ;   i++){
        if (i%2 ===0){
            tableData.push({key: i.toString(), temperature: coldFluidTemp[even], heatLoadCascade:heatLoadCascade[even].toFixed(2), minHeatCapacityFlowrate: minHeatCapacityFlowrate[even].toFixed(2)})
            even+=1
        }
        else{
            tableData.push({key: i.toString(), netHeatCapacity: netHeatCapacity[odd].toFixed(2), intervalHeatLoad:intervalHeatLoad[odd].toFixed(2)})
            odd+=1

        }
    }
    return tableData
}

/// For generation graph data
const generateHeatIntegrationGraph = (heatingMediumReturnTemperature:Number, heatLoadCascadeValue:number, hotFluidInlerTemp:Number, 
    intervalHeatLoad: Array<number>, heatLoadCascade:Array<number>, minHeatCapacityFlowrateVal: number,
     minHeatCapacityFlowrate: Array<number>, coldFluidTemp:Array<number>, minAppTemp:number) =>{

    let chartData : ChartDataItems= [] 
    let reverseHeatCascade = 0

    /// Hot Fluid Data
    chartData.push({
        heatLoad: "0",
        temperature: parseFloat(heatingMediumReturnTemperature.toFixed(2)).toString(),
        category: "Hot Fluid",
    },
    {

        heatLoad: heatLoadCascadeValue.toString(),
        temperature: hotFluidInlerTemp.toString(),
        category: "Hot Fluid",

    })

    /// Cold Fluid Data
    for (let i = coldFluidTemp.length - 1; i >= 0; i--) {
        chartData.push({
            heatLoad: reverseHeatCascade.toString(),
            temperature: coldFluidTemp[i].toString(),
            category: "Cold Fluid"
        });

        if (i!==0){
            reverseHeatCascade += intervalHeatLoad[i-1]

        }
    }

    /// Pinch Data Point
    const highestValue = Math.max(...minHeatCapacityFlowrate);
    const highestIndex = minHeatCapacityFlowrate.indexOf(highestValue);
    chartData.push({
        heatLoad: (heatLoadCascadeValue - heatLoadCascade[highestIndex]).toString(),
        temperature: coldFluidTemp[highestIndex].toString(),
        category: "Pinch"})
    chartData.push({
        heatLoad: (heatLoadCascadeValue - heatLoadCascade[highestIndex]).toString(),
        temperature: (coldFluidTemp[highestIndex] + minAppTemp).toString(),
        category: "Pinch"})
    
    return chartData

}

const generateSummaryData  = (heatLoadCascadeValue:number, heatingMediumInletTemp:number, heatingMediumReturnTemperature:number, 
    minAppTemp:number, minHeatCapacityFlowrateVal: number,  minHeatCapacityFlowrate: Array<number>, 
    coldFluidTemp:Array<number>) =>{

    const highestValue = Math.max(...minHeatCapacityFlowrate);
    const highestIndex = minHeatCapacityFlowrate.indexOf(highestValue);

    return {totalHeatLoad : heatLoadCascadeValue.toFixed(2),
            heatingMediumInletTemp : heatingMediumInletTemp,
            heatingMediumOutletTemp : heatingMediumReturnTemperature.toFixed(2),
            minAppTemp : minAppTemp,
            minHeatCapacityFlowrate : minHeatCapacityFlowrateVal.toFixed(2),
            pinchColdFluidTemp : coldFluidTemp[highestIndex],
            pinchHotFluidTemp :coldFluidTemp[highestIndex] + minAppTemp
        }
    }