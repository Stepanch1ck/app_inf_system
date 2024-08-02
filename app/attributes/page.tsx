"use client";

import React, { useEffect, useState } from 'react';
import { Table, Space, Form, message, Input, Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import { useRouter } from 'next/navigation';
import  Option  from 'antd/es/select';
import fetchApi from '../utils/api';
import useFetchUser from '../utils/useFetchUser';

interface Attribute {
  id: number;
  name: string;
  dataType: string;
}

const AttributesPage: React.FC = () => {
    const router = useRouter();
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
    const [form] = Form.useForm();
  
    const userRoles = useFetchUser();

  
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const data = await fetchApi('Attribute');
        setAttributes(data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        message.error('Ошибка при получении данных атрибутов.');
      }
    };

    fetchAttributes();
  }, []);

  const handleEdit = () => {
    if (selectedRowKeys.length != 1){
        message.warning('Выберите одну строку для редактирования.')
    }
    const selectedId = selectedRowKeys[0];
    const selectedAttribute = attributes.find(attr => attr.id === selectedId);
    if (selectedAttribute){
        form.setFieldsValue({
            name: selectedAttribute.name,
            dataType: selectedAttribute.dataType,
        });
        setModalMode('edit');
        setIsModalVisible(true);
    }
  };

  const handleAdd =() => {
    form.resetFields();
    setModalMode('add')
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
        message.warning('Выберите строки для удаления.')
        return;
    }

    try{
        const token = localStorage.getItem('token');
        if (!token) return;

        const deletePromises =selectedRowKeys.map(async (id) => {
            const response = await
            fetch(`http://localhost:5295/api/Attribute/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при удалении атрибута с ID ${id}: ${response.status}`);
            }
        });

        await Promise.all(deletePromises);

        message.success('Данные успешно удалены.');
        setSelectedRowKeys([]);

        const UpdatedAttributes = attributes.filter(attr => !selectedRowKeys.includes(attr.id));
        setAttributes(UpdatedAttributes);
    } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        message.error('Ошибка при удалении данных.');
    }
  };
  
  const handleModalOk = async () => {
    try {
        const values = await form.validateFields();
        const token = localStorage.getItem('token');

        if (modalMode === 'add') {
            if (!token) return;
            

            const response = await fetch('http://localhost:5295/api/Attribute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: values.name,
                    dataType: values.dataType
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при добавлении атрибута: ${response.status}`);
            }

            const newAttribute = await response.json();
            setAttributes([...attributes, newAttribute]);
        } else {
            const selectedId = selectedRowKeys[0];
            
            if (!token) return;
            console.log(JSON.stringify({ id: selectedId, name: values.name, dataType: values.dataType }));
            const response = await fetch(`http://localhost:5295/api/Attribute/${selectedId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: selectedId,
                    name: values.name,
                    dataType: values.dataType,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка при обновлении атрибута с ID ${selectedId}: ${response.status}`);
            }

            const updatedAttributes = [...attributes];
            const index = updatedAttributes.findIndex(attr => attr.id === selectedId);
            if (index != -1) {
                updatedAttributes[index] = {
                    ...updatedAttributes[index],
                    name: values.name,
                    dataType: values.dataType
                };
                setAttributes(updatedAttributes);
            }
        }

        setIsModalVisible(false);
        form.resetFields();
        setSelectedRowKeys([]);

        message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
        console.error(modalMode === 'add' ? 'Ошибка при подключении данных.': 'Ошибка при обновлении данных.')
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

  const columns: ColumnsType<Attribute> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Тип данных',
      dataIndex: 'dataType',
      key: 'dataType',
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
      <h1>Атрибуты</h1>
      <Table columns={columns} dataSource={attributes.length > 0 ? attributes : []} 
        onRow={(record: { id: React.Key; }, rowIndex: any) => {
          return {
            onClick: () => {
              setSelectedRowKeys([record.id]); 
            },
          };
        }}/>
        

      <Modal
        title={modalMode === 'add' ? 'Добавить атрибут' : 'Редактировать атрибут'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Тип данных" name="dataType" rules={[{ required: true, message: 'Выберите тип данных!' }]}>
            <Select>
              <Option value="string">Строка</Option>
              <Option value="number">Число</Option>
              <Option value="boolean">Логический</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributesPage;