import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Space, Row, Col, Table, Descriptions, Divider } from 'antd';
import { handleChangeHot, handleMinAppTemp, handleChangeCold, handleAddColdFluid, handleDeleteColdFluid } from './handleChange'; // Adjust the path as needed
import { validateColdOutletTemperature, validateHeatLoad, validateMinAppTemp } from './validationHandlers'; // Adjust the path as needed
import { calculateHeatIntegration } from './heatIntegration';
import { AlignType } from 'rc-table/lib/interface';
import { FormValues, FormValuesData, DataColumn, ChartDataItem, ResultData } from './types'; // Adjust the path if necessary
import Chart from './Chart';

type DataColumns = DataColumn[];

const MyComponent: React.FC = () => {
  const [form] = Form.useForm<FormValuesData>();

  const [formData, setFormData] = React.useState<FormValues>({
    hotFluid: { inletTemp: NaN, outletTemp: NaN },
    minAppTemp: NaN,
    coldFluid: [{ "inletTemp_0": NaN, "outletTemp_0": NaN, "heatLoad_0": NaN }]
  });

  /// For Table Cascade Table 
  const [columns, setColumns] = React.useState<DataColumns>([
    {
      title: "Temperature, (°C)",
      dataIndex: "temperature",
      align: "center" as AlignType
    },
    {
      title: "Net heat capacity flowrate, (kW/°C)",
      dataIndex: "netHeatCapacity",
      align: "center" as AlignType
    },
    {
      title: "Interval Heat Load, (kW)",
      dataIndex: "intervalHeatLoad",
      align: "center" as AlignType
    },
    {
      title: "Heat Load Cascade, (kW)",
      dataIndex: "heatLoadCascade",
      align: "center" as AlignType
    },
    {
      title: "Min heat capacity flowrate, (kW/°C)",
      dataIndex: "minHeatCapacityFlowrate",
      align: "center" as AlignType
    },
  ]);

  const [dataSource, setDataSource] = React.useState([]);
  const [dataGraphSource, setDataGraphSource] = React.useState<ChartDataItem[]>([]);
  const [showResult, setShowResult] = React.useState(false);
  const [dataSummary, setDataSummary] = React.useState<ResultData>();

  const handleFinish = (values: FormValuesData) => {
    calculateHeatIntegration(values, columns, setDataSource, setDataGraphSource, setShowResult, setDataSummary);
  };

  useEffect(() => {
    if (!isNaN(formData.hotFluid.inletTemp)) {
      form.validateFields(['outletTemp']); // Trigger validation for outletTemp field
    }
  }, [form, formData.hotFluid.inletTemp]);

  useEffect(() => {
    formData.coldFluid.forEach((_, index) => {
      if (!isNaN(formData.coldFluid[index][`inletTemp_${index}`])) {
        form.validateFields([`outletTemp_${index}`]);
      }
    });
    setShowResult(false);
  }, [form, formData.coldFluid, formData.minAppTemp, formData.hotFluid.inletTemp]);

  const calculateHeatFlux = (heatLoad: number, inletTemp: number, outletTemp: number): string => {
    if (isNaN(heatLoad) || isNaN(inletTemp) || isNaN(outletTemp) || inletTemp >= outletTemp) {
      return 'N/A';
    }
    return `${(heatLoad / (outletTemp - inletTemp)).toFixed(2)} (kW/°C)`;
  };

  const customDividerStyle = {
    borderTop: '3px solid black',  // Customize thickness and color
  };

  const cardStyle = {
    margin: '16px 0', // Adds 16px margin to top and bottom of each card
  };

  return (
    <Space direction="vertical" size={10} style={{ width: '100%' }}>
      <Row gutter={16}>
        <Col span={11}>
          <Card title="Hot Fluid" extra={<a href="#">More</a>} style={{ width: '100%', margin: '32px'}} headStyle={{ color: 'red' }}>
            <Form form={form} onFinish={handleFinish}>
              <Row justify="space-around">
                <Col span={12}>
                  <Form.Item
                    label="Inlet Temperature"
                    name="inletTemp"
                    rules={[
                      { required: true, message: 'Please enter inlet temperature!' },
                    ]}
                  >
                    <Input placeholder="Enter inlet temperature..." 
                      addonAfter="°C" 
                      type="number" value={formData.hotFluid.inletTemp} 
                      onChange={(e) => { handleChangeHot(e, setFormData) }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col span={11}>
          <Card title="Minimum Approach Temperature" extra={<a href="#">More</a>} style={{ width: '100%', margin: '32px'}} >
            <Form form={form} onFinish={handleFinish}>
              <Row justify="space-around">
                <Col span={14}>
                  <Form.Item
                    label="Min. Approach Temperature"
                    name="minAppTemp"
                    rules={[
                      { required: true, message: 'Please enter minimum approach temperature!' },
                      { validator: validateMinAppTemp },
                    ]}
                  >
                    <Input 
                      placeholder="Enter minimum approach temperature..." 
                      addonAfter="°C" 
                      type="number" 
                      value={formData.minAppTemp} onChange={e => { handleMinAppTemp(e, setFormData) }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={22}>
          <Card title="Cold Fluid" extra={<Button onClick={() => { handleAddColdFluid(setFormData, formData) }}>Add</Button>} style={{ width: '100%',  margin: '32px'}} headStyle={{ color: 'blue' }}>
            <Form form={form} onFinish={handleFinish}>
              {formData.coldFluid.map((coldData, index) => (
                <Row key={index} justify="space-around" gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="Inlet Temperature"
                      name={`inletTemp_${index}`}
                      rules={[
                        { required: true, message: 'Please enter inlet temperature!' },
                      ]}
                    >
                      <Input
                        placeholder="Enter inlet temperature..."
                        addonAfter="°C"
                        type="number"
                        value={coldData[`inletTemp_${index}`]}
                        onChange={e => handleChangeCold(e, index, setFormData, formData)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="Outlet Temperature"
                      name={`outletTemp_${index}`}
                      rules={[
                        { required: true, message: 'Please enter outlet temperature!' },
                        { validator: validateColdOutletTemperature(formData, index) },
                      ]}
                    >
                      <Input
                        placeholder="Enter outlet temperature..."
                        addonAfter="°C"
                        type="number"
                        value={coldData[`outletTemp_${index}`]}
                        onChange={e => handleChangeCold(e, index, setFormData, formData)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      label="Heat Load"
                      name={`heatLoad_${index}`}
                      rules={[
                        { required: true, message: 'Please enter heat load' },
                        { validator: validateHeatLoad },
                      ]}
                    >
                      <Input
                        placeholder="Enter heat load..."
                        addonAfter="kW"
                        type="number"
                        value={coldData[`heatLoad_${index}`]}
                        onChange={e => handleChangeCold(e, index, setFormData, formData)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    Heat Capacity Flowrate: {calculateHeatFlux(coldData[`heatLoad_${index}`], coldData[`inletTemp_${index}`], coldData[`outletTemp_${index}`])}
                  </Col>
                  {formData.coldFluid.length > 1 && (
                    <Col span={2}>
                      <Button
                        danger
                        type="text"
                        onClick={() => handleDeleteColdFluid(index, setFormData, formData, form)}
                      >
                        Delete
                      </Button>
                    </Col>
                  )}
                </Row>
              ))}
              <Form.Item style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  Calculate
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {showResult && (
        <>
          <Row gutter={16}>
            <Col span={22}>
              <Card title="Result Summary" style={{ width: '100%', margin: '32px'}} > 
                <Descriptions>
                  <Descriptions.Item label="Total Heat Load">{dataSummary?.totalHeatLoad} kW</Descriptions.Item>
                  <Descriptions.Item label="Heating Medium Inlet Temperature">{dataSummary?.heatingMediumInletTemp} °C</Descriptions.Item>
                  <Descriptions.Item label="Heating Medium Outlet Temperature">{dataSummary?.heatingMediumOutletTemp} °C</Descriptions.Item>
                  <Descriptions.Item label="Min. Approach Temp">{dataSummary?.minAppTemp} °C</Descriptions.Item>
                  <Descriptions.Item label="Min. Heating Capacity Flowrate">{dataSummary?.minHeatCapacityFlowrate} kW/°C</Descriptions.Item>
                  <Descriptions.Item label="Pinch Temperature Cold Fluid">{dataSummary?.pinchColdFluidTemp} °C</Descriptions.Item>
                  <Descriptions.Item label="Pinch Temperature Heating Medium">{dataSummary?.pinchHotFluidTemp} °C</Descriptions.Item>
                </Descriptions>
                <Divider style={customDividerStyle} />
                <Table
                  title={() => 'Cascade Analysis'}
                  columns={columns} dataSource={dataSource} pagination={false} bordered={true} />
                <Divider style={customDividerStyle} />
                <Chart dataGraphSource={dataGraphSource} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Space>
  );
};

export default MyComponent;
