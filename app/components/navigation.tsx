"use client";

import React from 'react';
import { Button, Space } from 'antd';
import Link from 'next/link';

interface NavigationProps {
  onEdit: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onAdmin: () => void;
  userRoles: string[];
}


const Navigation: React.FC<NavigationProps> = ({ onEdit, onAdd, onDelete, onAdmin, userRoles }) => {
  const canEdit = userRoles.includes('admin') || userRoles.includes('editor');
  const canAdd = userRoles.includes('admin') || userRoles.includes('editor');
  const canDelete = userRoles.includes('admin');
  const isAdmin = userRoles.includes('admin');

  return (
    <div>
      <Space style={{ marginBottom: '20px' }}>
        <Link href="/information-systems">
          <Button type="primary">Информационные системы</Button>
        </Link>
        <Link href="/attributes">
          <Button type="primary">Атрибуты</Button>
        </Link>
        <Link href="/attribute-values">
          <Button type="primary">Значения атрибутов</Button>
        </Link>
        {isAdmin && (
          <Link href="/admin">
            <Button type="primary">Администратор</Button>
          </Link>
        )}
      </Space>
      <Space style={{ marginBottom: '20px' }}>
        {canEdit && <Button onClick={onEdit}>Редактировать</Button>}
        {canAdd && <Button onClick={onAdd}>Добавить</Button>}
        {canDelete && <Button onClick={onDelete} danger>Удалить</Button>}
      </Space>
    </div>
  );

};

export default Navigation;