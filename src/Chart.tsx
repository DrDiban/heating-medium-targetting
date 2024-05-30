import React from 'react';
import { Line } from '@ant-design/plots';
import { FormValues, FormValuesData, DataColumn, ChartDataItem } from './types'; // Adjust the path if necessary




interface ChartProps {
  dataGraphSource: Array<ChartDataItem>; // Adjust the type according to your data structure
}

const Chart: React.FC<ChartProps> = ({dataGraphSource}) => {
  const result = calculateScaleValues(dataGraphSource)
  
  const config = {
    data: dataGraphSource,
    xField: 'heatLoad',
    yField: 'temperature',
    title: {
   
      title: 'Heating Medium Composite Curve (HMCC)',
     
      style:{
        align: "center",
        titleFill: "grey"
      }

    },
    colorField: 'category',
    size	:40,
    label: {
      text: (datum:ChartDataItem) => `${datum.temperature}`,
      style: {
        dy: -12,
        textAnchor: 'middle',
      },
    },
    point: {
      shapeField: 'circle',
      sizeField: 4,
    },
    
      tooltip: {
        title: "heatLoad",
        items: [{ channel: 'y', valueFormatter: (d: string) => `${d} °C`}],
       
    
    },
    
    axis: {
      x: { title: 'Heat Load (kW)' },
      y: { title: 'Temperature (°C)' },
    },
    
    
    scale: { color: { range: ['red', 'blue', "black"] },
    y: { 
      type: 'linear',
      domain: result.yDomain,
      tickMethod: () => result.yAxisTickMethod
    },

    x: { 
      type: 'linear',
      domain: result.xDomain,
      tickMethod: () => result.xAxisTickMethod
    },
  
  },
    
  };

  return <Line {...config} />;
};


const calculateScaleValues = (dataGraphSource:Array<ChartDataItem>) =>{
  /// Hot Fluid Inlet Temp and total heat load located at position 1 in dataGraphSource, refer heatIntegration.tsx file
  

  
  let xDomain : Array<number>  = []
  let yDomain : Array<number>  = []
  
  let xAxisTickMethod : Array<number>  = []
  let yAxisTickMethod  : Array<number> = []

  if (dataGraphSource.length === 0){
    return {xDomain, xAxisTickMethod, yDomain, yAxisTickMethod}

  }

  const hotFluidMaxTemp = dataGraphSource[1]["temperature"]
  const totalHeatLoad = dataGraphSource[1]["heatLoad"]
  const axisDivider = [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 5000, 7500, 10000]
  const limitTicks = 10

  const xAxisDividerValue = findDividerValue(axisDivider, parseFloat(totalHeatLoad), limitTicks)
  const xResult = generateDomainAndTickMethod(xAxisDividerValue, parseFloat(totalHeatLoad)) 
  xDomain = xResult.domain
  xAxisTickMethod = xResult.axisTicks

  const yAxisDividerValue = findDividerValue(axisDivider, parseFloat(hotFluidMaxTemp), limitTicks)
  const yResult = generateDomainAndTickMethod(yAxisDividerValue, parseFloat(hotFluidMaxTemp)) 
  yDomain = yResult.domain
  yAxisTickMethod = yResult.axisTicks

  console.log(xDomain, xAxisTickMethod, yDomain, yAxisTickMethod)

  return {xDomain, xAxisTickMethod, yDomain, yAxisTickMethod}

}

const findDividerValue = (axisDivider: Array <number>, value:number, limitTicks:number)=>{
  let axisDividerValue = NaN
  for (let i=0; i < axisDivider.length; i++){
    const count = Math.floor(value/axisDivider[i])
    const bal = value % axisDivider[i]
    if (count === limitTicks && bal ===0){
      axisDividerValue = axisDivider[i]
      break
    }
    else if (count <= limitTicks){
      if (Number.isNaN(axisDividerValue)){
        axisDividerValue = axisDivider[i]
        
      }
      break
    }
    else{
      axisDividerValue = axisDivider[i]
    }
  }
  return axisDividerValue
}

const generateDomainAndTickMethod = (axisDividerValue:number, value:number) =>{
  const domain : Array<number>  = [0]
  const axisTicks : Array<number>  = []

  domain.push((Math.floor(value/axisDividerValue) + 1) * axisDividerValue)
  
  for (let i = 0; i <= domain[1]/axisDividerValue; i++){
    axisTicks.push(i*axisDividerValue)
  }

  return {domain,  axisTicks}
 
  
}

export default Chart;


