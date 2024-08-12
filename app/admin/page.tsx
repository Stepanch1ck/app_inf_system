"use client";

import React, { useEffect, useState } from 'react';
import { Table, Space, Form, message, Input, Modal, Select, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import router from 'next/router';
import Option from 'antd/es/select';
import useFetchUser from '../utils/useFetchUser';
import { createUser, deleteUser, getAllUsers, updateUser, UserRequest } from '../services/admin';
import SearchAndFilter from '../components/serach&filter';
import Password from 'antd/es/input/Password';

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const userRoles = useFetchUser();
  const [originalData, setOriginalData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]); 
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);


  useEffect(() => {
    
    fetchUsers();
  }, []);

  const handleEdit = () => {
    if (selectedRowKeys.length !== 1) {
      message.warning('Выберите одну строку для редактирования.');
      return;
    }

    const selectedId = selectedRowKeys[0];
    const selectedUser = users.find(user => user.id === selectedId);

    if (selectedUser) {
      setSelectedUser(selectedUser);
      form.setFieldsValue({
        username: selectedUser.username,
        password: '',
        roleId: selectedUser.role,
      });
      setModalMode('edit');
      setIsModalVisible(true);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      const processedUsers = data.map((user: User) => ({
        ...user,
        role: user.role,  
      }));
      setUsers(processedUsers);
      setOriginalData(processedUsers);
      setFilteredData(processedUsers); 
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      message.error('Ошибка при получении данных пользователей.');
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
          await deleteUser(id.toString());
          
        });
        await Promise.all(deletePromises);
        message.success('Пользователи успешно удалены.');
        setSelectedRowKeys([]);
        await fetchUsers();
      } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        message.error('Ошибка при удалении данных.');
      }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const selectedId = selectedRowKeys[0];

      if (modalMode === 'add') {
        const newUserRequest: UserRequest = {
          id: '',
          username: values.username,
          password: values.password,
          role: values.role,
        };
        await createUser(newUserRequest);
      } else {
        const updatedUserRequest: UserRequest = {
          id: selectedId.toString(),
          username: values.username,
          role: values.role,
        };
  
        if (values.password) { 
          updatedUserRequest.password = values.password; 
        }
  
        await updateUser(selectedId.toString(), updatedUserRequest);
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);
      await fetchUsers();
      message.success(modalMode === 'add' ? 'Пользователь успешно добавлен.' : 'Пользователь успешно обновлен.');
    } catch (error) {
      console.error(error);
      message.error(modalMode === 'add' ? 'Ошибка при добавлении пользователя.' : 'Ошибка при обновлении пользователя.');
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

  const handleFilter = (filteredData: User[]) => {
    setFilteredData(filteredData);
  };

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase());
    filterData();
  };

  const handleFilterChange = (value: string | null) => {
    setSelectedFilter(value);
    filterData();
  };

  const handleSort = () => {
    setSortDirection(prevDirection => {
      if (prevDirection === 'asc') {
        return 'desc';
      } else if (prevDirection === 'desc') {
        return null;
      } else {
        return 'asc';
      }
    });
    filterData();
  };

  const filterData = () => {
    let filteredData = [...originalData];

    if (searchText) {
      filteredData = filteredData.filter(user =>
        user.username.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText) 
      );
    }

    if (selectedFilter) {
      filteredData = filteredData.filter(user => user.role === selectedFilter);
    }

    if (sortDirection) {
      filteredData.sort((a, b) => {
        const aValue = sortDirection === 'asc' ? a.username.toLowerCase() : b.username.toLowerCase();
        const bValue = sortDirection === 'asc' ? b.username.toLowerCase() : a.username.toLowerCase();
        return aValue.localeCompare(bValue); 
      });
    }
    setFilteredData(filteredData);
  };

  const filterOptions = [
    {
      label: 'Администратор',
      value: 'admin',
      filterFn: (user: User, value: string) => user.role === value
    },
    {
      label: 'Редактор',
      value: 'editor',
      filterFn: (user: User, value: string) => user.role === value
    },
    {
      label: 'Просмотр',
      value: 'viewer',
      filterFn: (user: User, value: string) => user.role === value
    },
  ];


  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Имя пользователя',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
    },
  ];

  const handleAdmin = () => {
    router.push('/admin'); 
  };
  const options = [
    { value: 'administrator', label: 'Администратор' },
    { value: 'editor', label: 'Редактор' }, 
    { value: 'viewer', label: 'Просмотр' },
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

      <h1>Пользователи</h1>
      <Table columns={columns} dataSource={filteredData} 
      onRow={(record: { id: React.Key; }, rowIndex: any) => {
        return {
          onClick: () => {
            setSelectedRowKeys([record.id]); 
          },
        };
      }}
        />
      
      {/* Modal для добавления пользователя */}
      <Modal
        title={modalMode === 'add' ? 'Добавить пользователя' : 'Редактировать пользователя'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Имя пользователя"
            name="username"
            rules={[{ required: true, message: 'Введите имя пользователя!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Роль" name="roleId" rules={[{ required: true, message: 'Выберите роль!' }]} >
          <Select options={options} defaultValue="Просмотр" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;