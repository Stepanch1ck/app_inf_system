"use client";
import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5295/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        message.success('Вход выполнен!');
        router.push('/information-systems');
      } else {
        message.error('Неверное имя пользователя или пароль.');
      }
    } catch (error) {
      console.error(error);
      message.error('Ошибка при входе.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Form
        name="login"
        onFinish={onFinish}
        initialValues={{ remember: true }}
        style={{ maxWidth: '300px' }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Пожалуйста, введите имя пользователя!' }]}
        >
          <Input placeholder="Имя пользователя" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
        >
          <Input.Password placeholder="Пароль" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Войти
          </Button>
        </Form.Item>

      </Form>
    </div>
  );
};

export default LoginPage;