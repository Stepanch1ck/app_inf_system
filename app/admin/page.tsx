"use client";

import React, { useEffect, useState } from 'react';
import { Table, Space, Form, message, Input, Modal, Select, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Navigation from '../components/navigation';
import router from 'next/router';
import Option from 'antd/es/select';
import fetchApi from '../utils/api';
import useFetchUser from '../utils/useFetchUser';

interface User {
  id: number;
  username: string;
  role: {
    id: number;
    name: string;
  };
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const userRoles = useFetchUser();
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] = useState(false);
  const [createUserForm] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fetchApi('Users');
        setUsers(data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        message.error('Ошибка при получении данных пользователей.');
      }
    };
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
        roleId: selectedUser.role.id,
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
          const response = await fetch(`http://localhost:5295/api/Users/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (!response.ok) {
            throw new Error(`Ошибка при удалении пользователя с ID ${id}: ${response.status}`);
          }
        });
    
        await Promise.all(deletePromises);
    
        message.success('Пользователи успешно удалены.');
        setSelectedRowKeys([]);
        const updatedUsers = users.filter(user => !selectedRowKeys.includes(user.id));
        setUsers(updatedUsers);
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
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5295/api/Users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser]);
        } else {
          throw new Error(`Ошибка при добавлении пользователя: ${response.status}`);
        }
      } else {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:5295/api/Users/${selectedId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedId,
            username: values.username,
            roleId: values.roleId,
          }),
        });

        if (response.ok) {
          const updatedUsers = [...users];
          const index = updatedUsers.findIndex(user => user.id === selectedId);
          if (index !== -1) {
            updatedUsers[index] = { ...updatedUsers[index], username: values.username, role: { ...updatedUsers[index].role, id: values.roleId } };
            setUsers(updatedUsers);
          }
        } else {
          throw new Error(`Ошибка при обновлении пользователя: ${response.status}`);
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedRowKeys([]);

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
      dataIndex: 'role.name',
      key: 'role.name',
    },
  ];

  const handleAdmin = () => {
    router.push('/admin'); 
  };


  return (
    <div style={{ padding: '20px' }}>
      <Navigation
        onEdit={handleEdit}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onAdmin={handleAdmin}
        userRoles={userRoles}
        
      />
      <h1>Пользователи</h1>
      <Table columns={columns} dataSource={users} 
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
            <Select>
              <Option value={1}>Администратор</Option>
              <Option value={2}>Редактор</Option>
              <Option value={3}>Просмотр</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;