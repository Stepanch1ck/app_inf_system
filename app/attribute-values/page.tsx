"use client";
import React, { useEffect, useState } from 'react';
import { Table, Space, Form, message, Modal, Select, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import router from 'next/router';
import  Option  from 'antd/es/select';
import fetchApi from '../utils/api';
import useFetchUser from '../utils/useFetchUser';


interface AttributeValue {
  id: number;
  informationSystemId: number;
  attribute: {
    id: number;
    name: string;
    dataType: string;
  };
  value: string;
}

interface InformationSystem {
    id: number;
    name: string;
}
  
interface Attribute {
  id: number;
  name: string;
  dataType: string;
}

const AttributeValuesPage: React.FC = () => {
    
    const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
    const [informationSystems, setInformationSystems] = useState<InformationSystem[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
  
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
    const [form] = Form.useForm();
    
  
    const userRoles = useFetchUser();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataAttributesValues = await fetchApi('AttributeValues');
        setAttributeValues(dataAttributesValues);
        const dataInformationSystems = await fetchApi('InformationSystems');
        setInformationSystems(dataInformationSystems);
        const dataAttributes = await fetchApi('Attribute');
        setAttributes(dataAttributes);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      message.warning('Выберите одну строку для редактирования.');
      return;
    }

    const selectedId = selectedRowKeys[0];
    const selectedAttributeValue = attributeValues.find(av => av.id === selectedId);
    if (selectedAttributeValue) {
      form.setFieldsValue({
        informationSystemId: selectedAttributeValue.informationSystemId,
        attributeId: selectedAttributeValue.attribute.id,
        value: selectedAttributeValue.value,
      });
      setModalMode('edit');
      setIsModalVisible(true);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalMode('add');
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Выберите строки для удаления.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const deletePromises = selectedRowKeys.map(async (id) => {
        const response = await fetch(`http://localhost:5295/api/AttributeValues/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка при удалении значения атрибута с ID ${id}: ${response.status}`);
        }
      });

      await Promise.all(deletePromises);

      message.success('Данные успешно удалены.');
      setSelectedRowKeys([]);
      const updatedAttributeValues = attributeValues.filter(av => !selectedRowKeys.includes(av.id.toString()));
      setAttributeValues(updatedAttributeValues);
    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
      message.error('Ошибка при удалении данных.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add') {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5295/api/AttributeValues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            informationSystemId: values.informationSystemId,
            attributeId: values.attributeId,
            value: values.value
          }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка при добавлении значения атрибута: ${response.status}`);
        }

        const newAttributeValue = await response.json();
        setAttributeValues([...attributeValues, newAttributeValue]);
      } else {
        const selectedId = selectedRowKeys[0];
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:5295/api/AttributeValues/${selectedId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedId,
            informationSystemId: values.informationSystemId,
            attributeId: values.attributeId,
            value: values.value
          }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка при обновлении значения атрибута с ID ${selectedId}: ${response.status}`);
        }

        const updatedAttributeValues = [...attributeValues];
        const index = updatedAttributeValues.findIndex(av => av.id === selectedId);
        if (index !== -1) {
          const foundAttribute = attributes.find(attr => attr.id === values.attributeId);

          if (foundAttribute) {
            updatedAttributeValues[index] = {
              ...updatedAttributeValues[index],
              informationSystemId: values.informationSystemId,
              attribute: foundAttribute,
              value: values.value
            };
            setAttributeValues(updatedAttributeValues);
          } else {
            message.error('Атрибут не найден.');
            return; 
          }
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);

      message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
      console.error(error);
      message.error(modalMode === 'add' ? 'Ошибка при добавлении данных.' : 'Ошибка при обновлении данных.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const handleAdmin = () => {
    router.push('/admin'); 
  };

  const columns: ColumnsType<AttributeValue> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'ИС',
      dataIndex: 'informationSystemId',
      key: 'informationSystemId',
      render: (informationSystemId: number) => {
        const system = informationSystems.find(system => system.id === informationSystemId);
        return system ? system.name : informationSystemId;
      },
    },
    {
      title: 'Название атрибута',
      dataIndex: ['attribute', 'name'],
      key: 'attribute.name',
    },
    {
      title: 'Тип данных атрибута',
      dataIndex: ['attribute', 'dataType'],
      key: 'attribute.dataType',
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Navigation
        onEdit={handleEdit}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onAdmin={handleAdmin}
        userRoles={userRoles}
        
      />
      <h1>Значения атрибутов</h1>
      <Table columns={columns} dataSource={attributeValues} 
       onRow={(record: { id: React.Key; }, rowIndex: any) => {
        return {
          onClick: () => {
            setSelectedRowKeys([record.id]); 
          },
        };
      }}/>

      <Modal
        title={modalMode === 'add' ? 'Добавить значение атрибута' : 'Редактировать значение атрибута'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="ИС" name="informationSystemId" rules={[{ required: true, message: 'Выберите ИС!' }]}>
            <Select>
              {informationSystems.length > 0 && informationSystems.map((system) => (
                <Option key={system.id} value={system.id}>
                  {system.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Атрибут" name="attributeId" rules={[{ required: true, message: 'Выберите атрибут!' }]}>
            <Select>
              {attributes.length > 0 && attributes.map((attribute) => (
                <Option key={attribute.id} value={attribute.id}>
                  {attribute.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Значение" name="value" rules={[{ required: true, message: 'Введите значение!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributeValuesPage;