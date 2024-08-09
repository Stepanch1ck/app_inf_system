"use client";

import React, { useEffect, useState } from 'react';
import { Table, Space, Form, message, Input, Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import { useRouter } from 'next/navigation';
import  Option  from 'antd/es/select';
import fetchApi from '../utils/api';
import useFetchUser from '../utils/useFetchUser';
import { AttributeWithTypeRequest, createAttribute, deleteAttribute, updateAttribute } from '../services/attribute';
import SearchAndFilter from '../components/serach&filter';


const AttributesPage: React.FC = () => {
    const router = useRouter();
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
    const [form] = Form.useForm();
    const userRoles = useFetchUser();
    const [originalData, setOriginalData] = useState<Attribute[]>([]);
    const [filteredData, setFilteredData] = useState<Attribute[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  
  useEffect(() => {
    fetchAttributes();
    const intervalId = setInterval(fetchAttributes, 30000);
    return () => clearInterval(intervalId);
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
        const deletePromises =selectedRowKeys.map(async (id) => {
            const response = await deleteAttribute(id.toString());
            if (!response) {
                throw new Error(`Ошибка при удалении атрибута с ID: ${id}`);
            }
        });
        await Promise.all(deletePromises);
        message.success('Данные успешно удалены.');
        setSelectedRowKeys([]);
        await fetchAttributes()
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
            const newAttr : AttributeWithTypeRequest = {
              id: 0,
              name: values.name,
              dataType: values.dataType
            };
            await createAttribute(newAttr);
        } else {
            const selectedId = Number(selectedRowKeys[0]);
            if (!token) return;
              const updatedAttr: AttributeWithTypeRequest = {
                id: selectedId,
                name: values.name,
                dataType: values.dataType,
              };
        }
        await fetchAttributes()
        setIsModalVisible(false);
        form.resetFields();
        setSelectedRowKeys([]);
        message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
        console.error(modalMode === 'add' ? 'Ошибка при подключении данных.': 'Ошибка при обновлении данных.')
    }
  };

  const fetchAttributes = async () => {
    try {
      const data = await fetchApi('Attribute');
      setAttributes(data);
      setOriginalData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      message.error('Ошибка при получении данных атрибутов.');
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterData();
  };
  const handleFilter = (filteredData: Attribute[]) => {
    setFilteredData(filteredData);
  };

  const handleFilterChange = (value: string | null) => {
    setSelectedFilter(value);
    filterData();
  };

  const filterData = () => {
    let filteredData = [...originalData];

    if (searchText) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filteredData);
  };
  const filterOptions: { label: string; value: string; filterFn: (item: Attribute, value: string) => boolean }[] = [
    
  ];

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
      <SearchAndFilter
        data={originalData}
        onFilter={handleFilter}
        onSearch={handleSearch}
        filterOptions={filterOptions}
      />
      <Table columns={columns} dataSource={filteredData} 
        onRow={(record: { id: React.Key; }, rowIndex: any) => {
          return {
            onClick: () => {
              setSelectedRowKeys([record.id]); 
            },
          };
        }}/>
        

      <Modal
        title={modalMode === 'add' ? 'Добавить атрибут' : 'Редактировать атрибут'}
        open={isModalVisible}
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