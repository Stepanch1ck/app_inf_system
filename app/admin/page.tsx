"use client";

import React, { useEffect, useState } from 'react';
import { Table, Space, Form, message, Input, Modal, Select, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import router from 'next/router';
import Option from 'antd/es/select';
import useFetchUser from '../utils/useFetchUser';
import { createUser, CreateUserRequest, deleteUser, getAllUsers, updateUser, UserRequest } from '../services/admin';
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

    const selectedLogin = selectedRowKeys[0];
    const selectedUser = users.find(user => user.login === selectedLogin);

    if (selectedUser) {
      setSelectedUser(selectedUser);
      form.setFieldsValue({
        username: selectedUser.login,
        password: '',
        role: selectedUser.roleName,
      });
      setModalMode('edit');
      setIsModalVisible(true);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setOriginalData(data.map((user : User) => ({ ...user, name: user.login })));
      setFilteredData(data.map((user : User)=> ({ ...user, name: user.login })));
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
        const usersToDelete = filteredData.filter(user => 
          selectedRowKeys.includes(user.login)
          
        );
        const deletePromises = usersToDelete.map(async (user) => {
          await deleteUser(user.login);
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
      const existingNames = originalData.map(is => is.login);

      if (modalMode === 'add') {
        if (values.newName && values.newName !== values.name && existingNames.includes(values.newName)) {
          message.error('Пользователь с таким именем уже существует.');
          return;
        }
        const newUserRequest: CreateUserRequest = {
          username: values.username,
          password: values.password,
          role: values.role,
        };
        await createUser(newUserRequest);
      } else {
        const updatedUserRequest: UserRequest = {
          login: values.username,
          password: values.password,
          role: values.role,
        };
        await updateUser(updatedUserRequest);
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
        user.login.toLowerCase().includes(searchText.toLowerCase()) ||
        user.roleName.toLowerCase().includes(searchText.toLowerCase()) 
      );
    }
    setFilteredData(filteredData);
  };

  const filterOptions = [
    {
      label: 'Администратор',
      value: 'ADMIN',
      filterFn: (user: User, value: string) => user.roleName === value
    },
    {
      label: 'Редактор',
      value: 'CREATOR',
      filterFn: (user: User, value: string) => user.roleName === value
    },
    {
      label: 'Просмотр',
      value: 'READER',
      filterFn: (user: User, value: string) => user.roleName === value
    },
  ];


  const columns: ColumnsType<User> = [
    {
      title: 'Имя пользователя',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Роль',
      dataIndex: 'roleName',
      key: 'roleName',
    },
  ];

  const handleAdmin = () => {
    router.push('/admin'); 
  };
  const options = [
    { value: 'ADMIN', label: 'Администратор' },
    { value: 'CREATOR', label: 'Редактор' }, 
    { value: 'READER', label: 'Читатель' },
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
        showFilter={true} 
      />

      <h1>Пользователи</h1>
      <Table columns={columns} dataSource={filteredData} 
      rowKey="login"
      rowSelection={rowSelection}
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
          >
            <Input disabled={modalMode === 'edit'}/>
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введите пароль!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Роль" name="role" rules={[{ required: true, message: 'Выберите роль!' }]} >
          <Select options={options}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;