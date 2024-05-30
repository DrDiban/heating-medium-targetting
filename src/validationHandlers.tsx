// validationHandlers.ts

interface FormValues {
    hotFluid: {
      inletTemp: number;
      outletTemp: number;
    },
    minAppTemp : number;
  
    coldFluid: Array<{
      [key: string]: number;
    }>
  }
  
  export const validateOutletTemperature = (formData: FormValues) => (_: unknown, value: string | number) => {
    if (parseFloat(String(value)) >= formData.hotFluid.inletTemp) {
      return Promise.reject('Outlet temperature must be lower than inlet temperature!');
    }
    return Promise.resolve();
  };
  
  export const validateColdOutletTemperature = (formData: FormValues, index: number) => (_: unknown, value: string | number) => {
    const minAppTemp = formData.minAppTemp
    const hotFluidInletTemp = formData.hotFluid.inletTemp
    if (parseFloat(String(value)) <= formData.coldFluid[index][`inletTemp_${index}`]) {
      return Promise.reject('Outlet temperature must be higher than inlet temperature!');
    }

    else if (parseFloat(String(value)) + minAppTemp > hotFluidInletTemp) {
        return Promise.reject('Outlet temperature of cold fluid + min approach temp must be lower than hot fluid inlet temperature!');

    }
    return Promise.resolve();
  };
  
  export const validateHeatLoad = (_: unknown, value: string | number) => {
    if (parseFloat(String(value)) <= 0) {
      return Promise.reject('Heat Load has to be more than 0');
    }
    return Promise.resolve();
  };
  

  export const validateMinAppTemp = (_: unknown, value: string | number) => {
    if (parseFloat(String(value)) < 0) {
      return Promise.reject('Min. approach temp. has to be a positive number');
    }
    return Promise.resolve();
  };
  