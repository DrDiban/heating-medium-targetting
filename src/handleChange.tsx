// formHandlers.ts

import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { FormInstance } from 'antd';

interface FormValues {
  hotFluid: {
    inletTemp: number;
    outletTemp: number;
  },
  minAppTemp: number;
  coldFluid: Array<{
    [key: string]: number;
  }>
}

export const handleChangeHot = (
  event: ChangeEvent<HTMLInputElement>,
  setFormData: Dispatch<SetStateAction<FormValues>>
) => {
  const { id, value } = event.target;
  setFormData(prevFormData => ({
    ...prevFormData,
    hotFluid: {
      ...prevFormData.hotFluid,
      [id]: parseFloat(value),
    },
  }));
};

export const handleMinAppTemp = (
  event: ChangeEvent<HTMLInputElement>,
  setFormData: Dispatch<SetStateAction<FormValues>>
) => {
  const {value } = event.target;
  setFormData(prevFormData => ({
    ...prevFormData,
    minAppTemp: parseFloat(value),
  }));
};

export const handleChangeCold = (
  event: ChangeEvent<HTMLInputElement>,
  index: number,
  setFormData: Dispatch<SetStateAction<FormValues>>,
  formData: FormValues
) => {
  const { id, value } = event.target;
  const updatedColdData = formData.coldFluid.map((item, idx) =>
    idx === index ? { ...item, [id]: parseFloat(value) } : item
  );

  setFormData(prevFormData => ({
    ...prevFormData,
    coldFluid: updatedColdData
  }));
};

export const handleAddColdFluid = (
  setFormData: Dispatch<SetStateAction<FormValues>>,
  formData: FormValues
) => {
  const newIndex = formData.coldFluid.length;
  setFormData(prevData => ({
    ...prevData,
    coldFluid: [
      ...prevData.coldFluid,
      {
        [`inletTemp_${newIndex}`]: NaN,
        [`outletTemp_${newIndex}`]: NaN,
        [`heatLoad_${newIndex}`]: NaN,
      }
    ]
  }));
};

export const handleDeleteColdFluid = (
  index: number,
  setFormData: Dispatch<SetStateAction<FormValues>>,
  formData: FormValues,
  form: FormInstance
) => {
  const updatedColdData = formData.coldFluid
    .filter((_, idx) => idx !== index)
    .map((item, idx) => ({
      [`inletTemp_${idx}`]: item[`inletTemp_${idx < index ? idx : idx + 1}`],
      [`outletTemp_${idx}`]: item[`outletTemp_${idx < index ? idx : idx + 1}`],
      [`heatLoad_${idx}`]: item[`heatLoad_${idx < index ? idx : idx + 1}`],
    }));

const updatedHotData = formData.hotFluid["inletTemp"]
const updatedMinAppTemp = formData.minAppTemp

  setFormData({
    ...formData,
    coldFluid: updatedColdData,
  });

  form.resetFields();
  updatedColdData.forEach((item, idx) => {
    form.setFieldsValue({
      [`inletTemp_${idx}`]: item[`inletTemp_${idx}`],
      [`outletTemp_${idx}`]: item[`outletTemp_${idx}`],
      [`heatLoad_${idx}`]: item[`heatLoad_${idx}`],
    });
  });

  form.setFieldsValue({"inletTemp": updatedHotData})
  form.setFieldsValue({"minAppTemp": updatedMinAppTemp})
};
