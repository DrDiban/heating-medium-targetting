import React, { ChangeEvent, useEffect } from 'react';
import { Form, Input, Button } from 'antd';

interface FormValues {
  inletTemp: number;
  outletTemp: number;
}

const MyComponent: React.FC = () => {
  const [form] = Form.useForm<FormValues>(); // Explicitly define the form instance type

  const [formData, setFormData] = React.useState<FormValues>({
    inletTemp: NaN,
    outletTemp: NaN,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [id]: parseFloat(value),
    }));
  };

  const validateInletTemperature = (_: unknown, value: string | number) => {
    if (!value || isNaN(Number(value))) {
      return Promise.reject('Please enter a valid number for inlet temperature!');
    }
    return Promise.resolve();
  };

  const validateOutletTemperature = (_: unknown, value: string | number) => {
    if (!value || isNaN(Number(value))) {
      return Promise.reject('Please enter a valid number for outlet temperature!');
    } else if (parseFloat(String(value)) >= formData.inletTemp) {
      return Promise.reject('Outlet temperature must be lower than inlet temperature!');
    }
    return Promise.resolve();
  };

  const handleFinish = (values: FormValues) => {
    console.log('Received values:', values);
  };

  // Use useEffect to watch for changes in formData.inletTemp
  useEffect(() => {
    form.validateFields(['outletTemp']); // Trigger validation for outletTemp field
  }, [formData.inletTemp]);

  return (
    <Form form={form} onFinish={handleFinish}>
      <Form.Item
        label="Inlet Temperature"
        name="inletTemp"
        rules={[
          { required: true, message: 'Please enter inlet temperature!' },
          { validator: validateInletTemperature },
        ]}
      >
        <Input placeholder="Enter inlet temperature..." type="number" onChange={handleChange} />
      </Form.Item>
      <Form.Item
        label="Outlet Temperature"
        name="outletTemp"
        rules={[
          { required: true, message: 'Please enter outlet temperature!' },
          { validator: validateOutletTemperature },
        ]}
      >
        <Input placeholder="Enter outlet temperature..." type="number" onChange={handleChange} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MyComponent;
