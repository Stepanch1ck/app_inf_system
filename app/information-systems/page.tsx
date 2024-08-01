"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, message, Modal, Form, Input, Button, Row, Col, FormListFieldData, Select,} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import Option from 'antd/es/select'
import router from 'next/router';

interface AttributeWithValueDto {
  id: number;
  name: string;
  value: string;
}

interface InformationSystemDetailsDto {
  id: number;
  name: string;
  attributes: AttributeWithValueDto[];
}

interface InformationSystem {
  id: number;
  name: string;
  attributes: AttributeWithValueDto[];
}

const InformationSystemsPage: React.FC = () => {
  const [informationSystems, setInformationSystems] = useState<InformationSystem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [form] = Form.useForm();
  const [selectedInfoSystem, setSelectedInfoSystem] = useState<InformationSystemDetailsDto | null>(null);
  const [newAttributes, setNewAttributes] = useState<AttributeWithValueDto[]>([]);
  
  const [userRoles, setUserRoles] = useState<string[]>([]);
  

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login'); 
        return;
      }

      try {
        const response = await fetch('http://localhost:5295/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserRoles([userData.role.name]);
        } else {
          console.error('Ошибка при получении данных пользователя:', response.status);
          message.error('Ошибка авторизации');
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        message.error('Ошибка при получении данных пользователя');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchInformationSystems = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5295/api/InformationSystems/with-attributes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();

          setInformationSystems(data);
        } else {
          console.error('Ошибка при получении данных:', response.status);
          message.error('Ошибка при получении данных');
          
        }
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        message.error('Ошибка при получении данных');
      }
    };

    fetchInformationSystems();
  }, []);

  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      message.warning('Выберите одну строку для редактирования.');
      return;
    }

    const selectedId = selectedRowKeys[0];

    const fetchInformationSystemDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:5295/api/InformationSystems/${selectedId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: InformationSystemDetailsDto = await response.json();
          setSelectedInfoSystem(data);
          const formValues: { [key: string]: string } = {
              name: data.name,
          };
          
          data.attributes.forEach(attr => {
              formValues[attr.name] = attr.value;
          });
          console.log(formValues);
          form.setFieldsValue(formValues); 
  
          setModalMode('edit');
          setIsModalVisible(true);
        }  else {
          console.error('Ошибка при изменении данных:', response.status);
          message.error('Ошибка при изменении данных');
        }
    } catch (error){
        console.error('Ошибка при изменении данных:', error);
        message.error('Ошибка при изменении данных');
    }
  };
  fetchInformationSystemDetails();
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
        const response = await fetch(`http://localhost:5295/api/InformationSystems/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка при удалении ИС с ID ${id}: ${response.status}`);
        }
      });

      await Promise.all(deletePromises);

      message.success('Данные успешно удалены.');
      setSelectedRowKeys([]);
      const updatedInfoSystems = informationSystems.filter(is => !selectedRowKeys.includes(is.id));
      setInformationSystems(updatedInfoSystems);
    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
      message.error('Ошибка при удалении данных.');
    }
  };


  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let attributes: AttributeWithValueDto[] = [];


      if (modalMode === 'edit' && selectedInfoSystem) { 
        attributes = selectedInfoSystem.attributes.map((attribute) => ({
          id: attribute.id,
          name: attribute.name,
          value: values[attribute.name], 
        }));
      } else if (modalMode === 'add') {
        attributes = newAttributes; 
      }
      const url = modalMode === 'add'
      ? 'http://localhost:5295/api/InformationSystems'
      : `http://localhost:5295/api/InformationSystems/${selectedRowKeys[0]}/edit-with-attributes`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const token = localStorage.getItem('token');
      if (!token) return; 
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: values.name, 
          attributes: attributes 
        }),
      });
      if (!response.ok) {
        throw new Error(`Ошибка при ${modalMode === 'add' ? 'добавлении' : 'обновлении'} ИС: ${response.status}`);
      }
      if (modalMode === 'add') {
        const newInfoSystem = await response.json();
        setInformationSystems([...informationSystems, newInfoSystem]);
      } else {
        const updatedInfoSystems = [...informationSystems];
        const index = updatedInfoSystems.findIndex(is => is.id === selectedRowKeys[0]);
        if (index !== -1) {
          updatedInfoSystems[index] = { ...updatedInfoSystems[index], name: values.name, attributes };
          setInformationSystems(updatedInfoSystems);
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      setNewAttributes([]);
      message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
      console.error(error);
      message.error(modalMode === 'add' ? 'Ошибка при добавлении данных.' : 'Ошибка при обновлении данных.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setNewAttributes([]);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const addAttribute = () => {
    setNewAttributes([...newAttributes, { id: 0, name: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setNewAttributes(newAttributes.filter((_, i) => i !== index));
  };

  const handleAdmin = () => {
    router.push('/admin'); 
  };

  const columns: ColumnsType<InformationSystem> = [
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
      title: 'Атрибуты',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes: AttributeWithValueDto[] | undefined) => (
        attributes && attributes.length > 0 ? (
          <Space size={[0, 8]} wrap>
            {attributes.map((attribute) => (
              <Tag color="blue" key={attribute.id}>
                {`${attribute.name}: ${attribute.value}`}
              </Tag>
            ))}
          </Space>
        ) : (
          <div>Нет атрибутов</div>
        )
      ),
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
      <h1>Информационные системы</h1>
      <Table columns={columns} dataSource={informationSystems.length > 0 ? informationSystems : []} 
         onRow={(record: { id: React.Key; }, rowIndex: any) => {
          return {
            onClick: () => {
              setSelectedRowKeys([record.id]); 
            },
          };
        }}/>

      <Modal
        title={modalMode === 'add' ? 'Добавить ИС' : 'Редактировать ИС'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название!' }]}>
            <Input />
          </Form.Item>
        
        
        {/* Форма для редактирования атрибутов */}
        {modalMode === 'edit' && selectedInfoSystem && (
            selectedInfoSystem.attributes.map((attribute, index) => (
              <Form.Item key={attribute.name} label={attribute.name} name={attribute.name}>
                <Input />
              </Form.Item>
            ))
        )}

        {/* Форма для добавления атрибутов при создании ИС */}
        {modalMode === 'add' && newAttributes.map((attr, index) => (
          <Row key={index} gutter={16}>
            <Col span={12}>
                <Form.Item
                  label="Имя атрибута"
                  name={['newAttributes', index, 'name']}
                  rules={[{ required: true, message: 'Введите имя атрибута!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item
                    label="Значение атрибута"
                    name={['newAttributes', index, 'value']}
                    rules={[{ required: true, message: 'Введите значение атрибута!' }]}
                  >
                <Input />
                </Form.Item>
              </Col>
              {/* <Col span={4}>
                <Form.Item
                  label="ID атрибута (опционально)"
                  name={['newAttributes', index, 'id']}
                >
                  <Select>
                    <Option value={undefined}>Создать новый</Option>
                    {newAttributes.map((attribute) => (
                      <Option key={attribute.name} value={attribute.dataType}>
                        {attribute.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col> */}
              <Col span={2}>
                <Button type="danger" onClick={() => removeAttribute(index)}>
                  Удалить
                </Button>
              </Col>
          </Row>
        ))}
      </Form>
    </Modal>
  </div>
);
};

export default InformationSystemsPage;