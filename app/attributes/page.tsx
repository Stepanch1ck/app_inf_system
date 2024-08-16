"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Form, message, Input, Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import { useRouter } from 'next/navigation';
import  Option  from 'antd/es/select';
import fetchApi from '../utils/api';
import useFetchUser from '../utils/useFetchUser';
import { createAttribute, CreateAttributeRequest, deleteAttribute, DeleteAttributeRequest, getAllAttribute, UpdateAttribute, UpdateAttributeRequest } from '../services/attribute';
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
        return;
    }
    const selectedId = selectedRowKeys[0];
    const selectedAttribute = attributes.find(attr => attr.name === selectedId);
    if (selectedAttribute){
        form.setFieldsValue({
          name: selectedAttribute.name,
          description: selectedAttribute.description,
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
      message.warning('Выберите строки для удаления.');
      return;
    }

    try {
      const selectedAttributes = attributes.filter(attr => selectedRowKeys.includes(attr.name));

    const deletePromises = selectedAttributes.map(async (attribute) => {
      const request: DeleteAttributeRequest = { name: attribute.name };
      await deleteAttribute(request);
    });

      await Promise.all(deletePromises);

      message.success('Данные успешно удалены.');
      await fetchAttributes();
      setSelectedRowKeys([]);
      
    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
      message.error('Ошибка при удалении данных.');
    }
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const existingNames = originalData.map(is => is.name);

      if (modalMode === 'add') {
        if (values.newName && values.newName !== values.name && existingNames.includes(values.newName)) {
          message.error('Атрибут с таким именем уже существует.');
          return;
        }
        const newAttr: CreateAttributeRequest = {
          name: values.name,
          description: values.description,
          states: [""],
        };
        await createAttribute(newAttr);
      } else {
        if (existingNames.includes(values.name)) {
          message.error('Атрибут с таким именем уже существует.');
          return;
        }
        const updatedAttr: UpdateAttributeRequest = {
          name: values.name,
          newName: values.NewName,
          description: values.description,
        };
        await UpdateAttribute(updatedAttr);
      }

      await fetchAttributes();
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
      console.error(modalMode === 'add' ? 'Ошибка при добавлении данных.' : 'Ошибка при обновлении данных.');
      message.error(modalMode === 'add' ? 'Ошибка при добавлении данных.' : 'Ошибка при обновлении данных.');
    }
  };

  const fetchAttributes = async () => {
    try {
      const data = await getAllAttribute();
      const normalizedData = data.map((attribute: Attribute) => ({
        ...attribute,
        states: Array.isArray(attribute.states) 
          ? attribute.states 
          : (typeof attribute.states === 'string' ? [attribute.states] : []),
      }));
      setAttributes(normalizedData);
      setOriginalData(normalizedData);
      setFilteredData(normalizedData);
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
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
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
        showFilter={false} 
      />
      <Table columns={columns} dataSource={filteredData} 
        rowKey="name"
        rowSelection={rowSelection}/>
        

        <Modal
        title={modalMode === 'add' ? 'Добавить атрибут' : 'Редактировать атрибут'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название!' }]}>
          <Input disabled={modalMode === 'edit'}/>
          </Form.Item>
          {modalMode === 'edit' && (
            <Form.Item
              label="Новое название (если менять не нужно, оставьте пустым)"
              name="newName"
            >
              <Input />
              </Form.Item>
            )}
          <Form.Item label="Описание" name="description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttributesPage;