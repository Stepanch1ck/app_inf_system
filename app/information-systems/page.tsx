"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, message, Modal, Form, Input, Button, Row, Col, FormListFieldData, Select,} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import Option from 'antd/es/select'
import router from 'next/router';
import useFetchUser from '../utils/useFetchUser';
import { createInfSystem, deleteInfSystem, getAllInfSystem, updateInfSystem } from '../services/InformationSystem';
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
        const selectedIS = data.find((iS: InformationSystem) => iS.name === selectedId);

        if (selectedIS) {
          setSelectedInfoSystem(selectedIS);
          form.setFieldsValue({
            name: selectedIS.name,
            description: selectedIS.description,
          });
          setSelectedAttributeKeys(selectedIS.attributeStatements.map((s: AttributeStatement) => s.attribute.name));
          setAttributeValues(selectedIS.attributeStatements.reduce((acc: { [key: string]: string }, curr: AttributeStatement) => {
            acc[curr.attribute.name] = curr.value;
            return acc;
          }, {} as { [key: string]: string }));
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
    setSelectedAttributeKeys([]);
    setAttributeValues({});
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
      const infoSystemsToDelete = filteredData.filter(is => 
        selectedRowKeys.includes(is.name)
      );
      const deletePromises = infoSystemsToDelete.map(async (is) => {
        await deleteInfSystem(is.name);
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
      const existingNames = originalData.map(is => is.name);

      if (modalMode === 'edit') { 
        if (values.newName && values.newName !== values.name && existingNames.includes(values.newName)) {
          message.error('Информационная система с таким именем уже существует.');
          return;
        }
          const updateRequest = {
            name: values.name,
            newName: values.newName || values.name,
            newDescription: values.description,
            attrNames: selectedAttributeKeys,
            attrValues: selectedAttributeKeys.map(key => attributeValues[key]),
          };
  
          await updateInfSystem(updateRequest); 
      } else if (modalMode === 'add') {
        if (existingNames.includes(values.name)) {
          message.error('Информационная система с таким именем уже существует.');
          return;
        }
        const newInfoSystem: CreateInfSystemRequest = {
          name: values.name,
          description: values.description,
          attributeKeys: selectedAttributeKeys,
          attributeValues: selectedAttributeKeys.map(key => attributeValues[key]),
        };
        await createInfSystem(newInfoSystem);
      }
      await fetchData();
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      message.success(modalMode === 'add' ? 'Данные успешно добавлены.' : 'Данные успешно обновлены.');
    } catch (error) {
      console.error(error);
      message.error(modalMode === 'add' ? 'Ошибка при добавлении данных.' : 'Ошибка при обновлении данных.');
    }
  };

  

  const fetchData = async () => {
    try {
      
      const dataIS = await getAllInfSystem();
      console.log(dataIS);
      setOriginalData(dataIS);
      setFilteredData(dataIS);

      const dataAttributes = await getAllAttribute();
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
    setSelectedAttributeKeys([]);
    setAttributeValues({});
  };

  const handleAttributeKeyChange = (value: string[]) => {
    if (modalMode === 'edit') {
      setSelectedAttributeKeys(prevKeys => {
        const updatedKeys = [...prevKeys]; 
        value.forEach(key => {
          const index = updatedKeys.indexOf(key);
          if (index > -1) {
            updatedKeys.splice(index, 1);
          } else {
            updatedKeys.push(key);
          }
        });
        return updatedKeys; 
      });
    } else {
      setSelectedAttributeKeys(value); 
    }
  };

  const handleAttributeValueChange = (key: string, value: string) => {
    setAttributeValues({
      ...attributeValues,
      [key]: value,
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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
        item.attributeStatements.some(s => s.attribute.name === value),
    })),
  ]
  
  
  const handleFilterChange = (value: string | null) => {
    setSelectedFilter(value);
    filterData();
  };
  
  const filterData = () => {
    let filteredData = [...originalData];

    if (searchText) {
      filteredData = filteredData.filter(item => {
        const lowerCaseSearchText = searchText.toLowerCase(); 
        if (
          item.name.toLowerCase().includes(lowerCaseSearchText) ||
          item.description.toLowerCase().includes(lowerCaseSearchText)
        ) {
          return true;
        }
  
        return item.attributeStatements.some(statement => {
          const attributeName = statement.attribute.name.toLowerCase();
          const attributeDescription = statement.attribute.description.toLowerCase();
          const attributeValue = statement.value.toLowerCase();
  
          return (
            attributeName.includes(lowerCaseSearchText) ||
            attributeDescription.includes(lowerCaseSearchText) ||
            attributeValue.includes(lowerCaseSearchText)
          );
        });
      });
    }

    if (selectedFilter) {
      const filterOption = filterOptions.find(option => option.value === selectedFilter);
      if (filterOption) {
        filteredData = filteredData.filter(item => filterOption.filterFn(item, selectedFilter));
      }
    }
    if (searchText || selectedFilter) {
      setFilteredData(filteredData);
    } else {
      setFilteredData(originalData);
    }
  };

  const handleAdmin = () => {
    router.push('/admin'); 
  };

  const columns: ColumnsType<InformationSystem> = [
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
    {
      title: 'Атрибуты',
      dataIndex: 'attributeStatements',
      key: 'attributeStatements',
      render: (attributeStatements: InformationSystem['attributeStatements']) => (
        attributeStatements && attributeStatements.length > 0 ? (
          <ul>
            {attributeStatements.map((statement) => (
              <li key={statement.id}>
                <strong>{statement.attributeName}:</strong> {statement.value} 
              </li>
            ))}
          </ul>
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
     <SearchAndFilter 
      data={originalData}
      onFilter={handleFilter}
      onSearch={handleSearch}
      filterOptions={filterOptions}
      showFilter={true} 
    />
     
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="name"
        rowSelection={rowSelection}
      />

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
    >
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
    <Form.Item label="Ключи атрибутов" name="attributeKeys">
      <Select
        mode="multiple"
        placeholder="Выберите ключи атрибутов"
        onChange={handleAttributeKeyChange}
        value={selectedAttributeKeys} 
      >
        {existingAttributes
              .filter(attr => 
                modalMode === 'add' || 
                !selectedInfoSystem?.attributeStatements.map(s => s.attribute.name).includes(attr.name)
              ).map(attr => (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAttributeValueChange(key, e.target.value)}
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