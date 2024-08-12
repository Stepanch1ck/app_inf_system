"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, message, Modal, Form, Input, Button, Row, Col, FormListFieldData, Select,} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import Option from 'antd/es/select'
import router from 'next/router';
import fetchApi from '../utils/api'; 
import useFetchUser from '../utils/useFetchUser';
import { ChangeAttributesRequest, createInfSystem, deleteInfSystem, getAllInfSystem, getInfSystemByAttributeContain, updateInfSystem } from '../services/InformationSystem';
import SearchAndFilter from '../components/serach&filter';
import { getAllAttribute } from '../services/attribute';

const InformationSystemsPage: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [form] = Form.useForm();
  const [selectedAttributeKeys, setSelectedAttributeKeys] = useState<string[]>([]);
  const [attributeValues, setAttributeValues] = useState<{ [key: string]: string }>({});
  const [selectedInfoSystem, setSelectedInfoSystem] = useState<InformationSystem | null>(null);
  const [existingAttributes, setExistingAttributes] = useState<Attribute[]>([]);
  const [originalData, setOriginalData] = useState<InformationSystem[]>([]);
  const [filteredData, setFilteredData] = useState<InformationSystem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  
  const userRoles = useFetchUser();

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000); 
    return () => clearInterval(intervalId);
  }, []);

  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      message.warning('Выберите одну строку для редактирования.');
      return;
    }
    const selectedId = selectedRowKeys[0];
    const fetchInformationSystemDetails = async () => {
      try {
        const data = await getAllInfSystem();
        const selectedIS = data.find((iS: InformationSystem) => iS.id === selectedId);

        if (selectedIS) {
          setSelectedInfoSystem(selectedIS);
          const formValues = {
            name: selectedIS.name,
            description: selectedIS.description,
            attributeKeys: selectedIS.attributeKeys,
            attributeValues: selectedIS.attributeValues,
          };
          form.setFieldsValue(formValues);
          setModalMode('edit');
          setIsModalVisible(true);
          await fetchData();
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
      const deletePromises = selectedRowKeys.map(async (id) => {
        await deleteInfSystem(id.toString());
      });
      await Promise.all(deletePromises);
      message.success('Данные успешно удалены.');
      setSelectedRowKeys([]);
      await fetchData();
    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
      message.error('Ошибка при удалении данных.');
    }
  };


  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'edit') {
        const updatedInfoSystem: InformationSystem = {
          ...selectedInfoSystem!,
          name: values.name,
          description: values.description || '',
          attributeKeys: values.attributeKeys,
          attributeValues: values.attributeValues.map((key: string) => attributeValues[key] || '')
        };
        const updateRequest: ChangeAttributesRequest = {
          name: updatedInfoSystem.name,
          attrNames: updatedInfoSystem.attributeKeys,
          attrValues: updatedInfoSystem.attributeValues,
        };
        await updateInfSystem(updateRequest);
      } else if (modalMode === 'add') {
        const newInfoSystem: CreateInfSystemRequest = {
          name: values.name,
          description: values.description,
          attributeKeys: values.attributeKeys,
          attributeValues: values.attributeValues,
        };
        await createInfSystem(newInfoSystem);
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      await fetchData();
      message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
      console.error(error);
      message.error(modalMode === 'add' ? 'Ошибка при добавлении данных.' : 'Ошибка при обновлении данных.');
    }
  };

  

  const fetchData = async () => {
    try {
      const dataIS = await getAllInfSystem();
      setOriginalData(dataIS);
      setFilteredData(dataIS);

      const dataAttributes = await getAllAttribute();
      console.log("Attributes fetched:", dataAttributes);
      setExistingAttributes(dataAttributes);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      message.error('Ошибка при получении данных');
    }
  };
  
  const handleDeleteAttributeKey = (index: number) => {
    const updatedKeys = [...selectedAttributeKeys];
    const deletedKey = updatedKeys.splice(index, 1)[0];
    setSelectedAttributeKeys(updatedKeys);
  
    const updatedValues = { ...attributeValues };
    delete updatedValues[deletedKey];
    setAttributeValues(updatedValues);
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleAttributeKeyChange = (value: string[]) => {
    setSelectedAttributeKeys(value);
  };

  const handleAttributeValueChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setAttributeValues({
      ...attributeValues,
      [key]: e.target.value,
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // const addAttribute = () => {
  //   setNewAttributes([...newAttributes, { id: 0, name: '', value: '' }]);
  // };
  // const removeAttribute = (index: number) => {
  //   if (modalMode === 'add') {
  //     setNewAttributes(newAttributes.filter((_, i) => i !== index));
  //   } else if (modalMode === 'edit' && selectedInfoSystem) {
  //     const updatedAttributes = selectedInfoSystem.attributes.filter((_, i) => i !== index);
  //     setSelectedInfoSystem({
  //       ...selectedInfoSystem,
  //       attributes: updatedAttributes,
  //     });
  //     form.setFieldsValue({ ...form.getFieldsValue(), [selectedInfoSystem.attributes[index].name]: undefined }); // Удаляем значение из формы
  //   }
  // };

  const handleFilter = (filteredData: InformationSystem[]) => {
    setFilteredData(filteredData);
  };

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase());
    filterData();
  };

  const filterOptions = [
    ...existingAttributes.map(attribute => ({
      label: `По атрибуту "${attribute.name}"`,
      value: attribute.name,
      filterFn: (item: InformationSystem, value: string) =>
        item.attributeKeys.includes(value),
    })),
  ];
  
  const handleFilterChange = (value: string | null) => {
    setSelectedFilter(value);
    filterData();
  };
  
  const filterData = () => {
    let filteredData = [...originalData];

    if (searchText) {
      filteredData = filteredData.filter(item => {
        return (
          item.name.toLowerCase().includes(searchText) ||
          item.attributeKeys.some(key => key.toLowerCase().includes(searchText)) ||
          item.attributeValues.some(value => value.toLowerCase().includes(searchText))
        );
      });
    }

    if (selectedFilter) {
      const filterOption = filterOptions.find(option => option.value === selectedFilter);
      if (filterOption) {
        filteredData = filteredData.filter(item => filterOption.filterFn(item, selectedFilter));
      }
    }

    setFilteredData(filteredData);
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
      render: (attributeKeys: string[], record: InformationSystem) => (
        attributeKeys && attributeKeys.length > 0 ? (
          <Space size={[0, 8]} wrap>
            {attributeKeys.map((key, index) => (
              <Tag color="blue" key={index}>
                {`${key}: ${record.attributeValues[index]}`}
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
     <SearchAndFilter 
      data={originalData}
      onFilter={handleFilter}
      onSearch={handleSearch}
      filterOptions={filterOptions}
    />
      <h1>Информационные системы</h1>
      <Table columns={columns} dataSource={filteredData} 
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
    <Form.Item
      label="Название"
      name="name"
      rules={[{ required: true, message: 'Введите название!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item label="Описание" name="description">
      <Input />
    </Form.Item>
    <Form.Item label="Ключи атрибутов" name="attributeKeys">
      <Select
        mode="multiple"
        placeholder="Выберите ключи атрибутов"
        onChange={handleAttributeKeyChange}
      >
        {existingAttributes.map(attr => (
          <Option key={attr.name} value={attr.name}>
            {attr.name}
          </Option>
        ))}
      </Select>
    </Form.Item>

    {selectedAttributeKeys.map((key, index) => (
      <Row key={index} gutter={16}>
        <Col span={10}>
          <Form.Item label={`Значение для ${key}`}>
            <Input
              value={attributeValues[key] || ''}
              onChange={(e: { target: { value: React.ChangeEvent<HTMLInputElement>; }; }) => handleAttributeValueChange(key, e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Button type="danger" onClick={() => handleDeleteAttributeKey(index)}>
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