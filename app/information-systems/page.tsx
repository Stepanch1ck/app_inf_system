"use client";

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, message, Modal, Form, Input, Button, Row, Col, FormListFieldData, Select,} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import Option from 'antd/es/select'
import router from 'next/router';
import fetchApi from '../utils/api'; 
import useFetchUser from '../utils/useFetchUser';
import { createInfSystem, deleteInfSystem, getAllInfSystem, getInfSystem, InformationSystemRequest, updateInfSystem } from '../services/InformationSystem';
import SearchAndFilter from '../components/serach&filter';

const InformationSystemsPage: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [form] = Form.useForm();
  const [selectedInfoSystem, setSelectedInfoSystem] = useState<InformationSystemDetailsDto | null>(null);
  const [newAttributes, setNewAttributes] = useState<AttributeWithValue[]>([]);
  const [existingAttributes, setExistingAttributes] = useState<Attribute[]>([]);
  const [deletedAttributeIds, setDeletedAttributeIds] = useState<number[]>([]);
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
        const data = await getInfSystem(selectedId.toString());
        setSelectedInfoSystem(data);
        const formValues: { [key: string]: string } = {
            name: data.name,
        };
        data.attributes.forEach((attr: AttributeWithValue) => {
          formValues[attr.name] = attr.value;
        });
        form.setFieldsValue(formValues); 
        setModalMode('edit');
        setIsModalVisible(true);
        await fetchData();
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
        const success = await deleteInfSystem(id.toString());
        if (!success) {
          throw new Error(`Ошибка при удалении ИС с ID ${id}`);
        }
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
      let attributes: AttributeWithValue[] = [];
      if (selectedInfoSystem) {
        selectedInfoSystem.attributes.forEach((attribute) => {
          if (!deletedAttributeIds.includes(attribute.id)) {
            attributes.push({
              id: attribute.id,
              name: attribute.name,
              value: values[attribute.name], 
            });
          }
        })
    
      if (modalMode === 'edit') {
        if (values.newExistingAttributes) {
          values.newExistingAttributes.forEach((attribute: { attributeId: any; value: any; }) => {
            const attributeId = attribute.attributeId;
            const attributeName = existingAttributes.find(attr => attr.id === attributeId)?.name || '';
            const attributeValue = attribute.value;
  
            if (!attributes.some(attr => attr.name === attributeName)) {
              attributes.push({
                id: attributeId,
                name: attributeName,
                value: attributeValue,
              });
            }
          });
        }
      }
      await updateInfSystem(selectedRowKeys[0].toString(), selectedInfoSystem);
      } else if (modalMode === 'add') {
        if (values.newExistingAttributes) {
          values.newExistingAttributes.forEach((attribute: { attributeId: any; value: any; }) => {
            const attributeId = attribute.attributeId;
            const attributeName = existingAttributes.find(attr => attr.id === attributeId)?.name || '';
            const attributeValue = attribute.value;
  

            if (!attributes.some((attr) => attr.name === attributeName)) {
              attributes.push({
                id: attributeId,
                name: attributeName,
                value: attributeValue,
              });
            }
          });
        }
        const newInfoSystem: InformationSystemRequest = {
          id: 0,
          name: values.name,
          attributes: attributes,
        };
        await createInfSystem(newInfoSystem);
      }
      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      setNewAttributes([]);
      setDeletedAttributeIds([]);
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
    
      const dataAttributes = await fetchApi('Attribute');
      setExistingAttributes(dataAttributes);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      message.error('Ошибка при получении данных');
    }
  };
  
  const handleDeleteAttribute = (attributeId: number) => {
    setDeletedAttributeIds([...deletedAttributeIds, attributeId]);
    if (selectedInfoSystem) {
      setSelectedInfoSystem({
        ...selectedInfoSystem,
        attributes: selectedInfoSystem.attributes.filter(attr => attr.id !== attributeId)
      });
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
    if (modalMode === 'add') {
      setNewAttributes(newAttributes.filter((_, i) => i !== index));
    } else if (modalMode === 'edit' && selectedInfoSystem) {
      const updatedAttributes = selectedInfoSystem.attributes.filter((_, i) => i !== index);
      setSelectedInfoSystem({
        ...selectedInfoSystem,
        attributes: updatedAttributes,
      });
      form.setFieldsValue({ ...form.getFieldsValue(), [selectedInfoSystem.attributes[index].name]: undefined }); // Удаляем значение из формы
    }
  };

  const handleFilter = (filteredData: InformationSystem[]) => {
    setFilteredData(filteredData);
  };

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase()); // Приводим к нижнему регистру для регистронезависимого поиска
    filterData();
  };

  const filterOptions = [
    ...existingAttributes.map(attribute => ({
      label: `По атрибуту "${attribute.name}"`,
      value: attribute.name,
      filterFn: (item: InformationSystem, value: string) => item.attributes.some(attr => attr.name === value),
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
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.attributes.some(attr => attr.name.toLowerCase().includes(searchText.toLowerCase())) ||
          item.attributes.some(attr => attr.value.toLowerCase().includes(searchText.toLowerCase()))
        );
      });
    } else {
      filteredData = [...originalData];
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
      render: (attributes: AttributeWithValue[] | undefined) => (
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
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Введите название!' }]}>
            <Input />
          </Form.Item>
        
        
        {/* Форма для редактирования атрибутов */}
        {modalMode === 'edit' &&  selectedInfoSystem &&(
            <> 
              {selectedInfoSystem && selectedInfoSystem.attributes.map((attribute, index) => (
                <div key={attribute.id}> 
                  <Form.Item label={attribute.name} name={attribute.name}>
                    <Input />
                  </Form.Item>
                  <Button type="danger" onClick={() => handleDeleteAttribute(attribute.id)}>
                    Удалить
                  </Button>
                </div>
              ))}
              {/* Добавление новых атрибутов */}
              <Form.List name="newExistingAttributes">
                {(fields: any[], { add, remove }: any) => (
                  <>
                    {fields.map((field, index) => (
                      <Row key={field.key} gutter={16}>
                        <Col span={10}>
                          <Form.Item
                            {...field}
                            label="Существующий атрибут"
                            name={[field.name, 'attributeId']}
                            fieldKey={[field.fieldKey, 'attributeId']}
                            rules={[{ required: true, message: 'Выберите атрибут!' }]}
                          >
                      <Select placeholder="Выберите атрибут">
                        {existingAttributes.map((attr) => (
                          <Option key={attr.id} value={attr.id}>
                            {attr.name}
                          </Option>
                        ))}
                      </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  {...field}
                  label="Значение"
                  name={[field.name, 'value']}
                  fieldKey={[field.fieldKey, 'value']}
                  rules={[{ required: true, message: 'Введите значение!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
                        <Col span={2}>
                          <Button type="danger" onClick={() => remove(field.name)}>
                            Удалить
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block>
                        Добавить существующий атрибут
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </>
          )}
        {/* Форма для добавления атрибутов при создании ИС */}
        {modalMode === 'add' && (
           <Form.List name="newExistingAttributes">
           {(fields: any[], { add, remove }: any) => (
             <>
               {fields.map((field, index) => (
                 <Row key={field.key} gutter={16}>
                   <Col span={10}>
                     <Form.Item
                       {...field}
                       label="Существующий атрибут"
                       name={[field.name, 'attributeId']}
                       fieldKey={[field.fieldKey, 'attributeId']}
                       rules={[{ required: true, message: 'Выберите атрибут!' }]}
                     >
                 <Select placeholder="Выберите атрибут">
                   {existingAttributes.map((attr) => (
                     <Option key={attr.id} value={attr.id}>
                       {attr.name}
                     </Option>
                   ))}
                 </Select>
           </Form.Item>
         </Col>
         <Col span={12}>
           <Form.Item
             {...field}
             label="Значение"
             name={[field.name, 'value']}
             fieldKey={[field.fieldKey, 'value']}
             rules={[{ required: true, message: 'Введите значение!' }]}
           >
             <Input />
           </Form.Item>
         </Col>
                   <Col span={2}>
                     <Button type="danger" onClick={() => remove(field.name)}>
                       Удалить
                     </Button>
                   </Col>
                 </Row>
               ))}
               <Form.Item>
                 <Button type="dashed" onClick={() => add()} block>
                   Добавить существующий атрибут
                 </Button>
               </Form.Item>
             </>
           )}
         </Form.List>
        )}
      </Form>
    </Modal>
  </div>
);
};

export default InformationSystemsPage;