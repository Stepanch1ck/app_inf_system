"use client";

import React, { useState } from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import Option from 'antd/es/select';

interface SearchAndFilterProps<T> {
  data: T[];
  onFilter: (filteredData: T[]) => void;
  filterOptions: { label: string; value: string; filterFn: (item: T, value: string) => boolean }[];
  onSearch: (value: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps<any>> = ({ data, onFilter, filterOptions }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSearch = (value: string) => {
    setSearchText(value);
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
      } else {
        return 'asc';
      }
    });
    filterData();
  };

  const filterData = () => {
    let filteredData = [...data];

    if (searchText) {
      filteredData = filteredData.filter(item => {
        return Object.values(item).some(val => {
          if (typeof val === 'string') {
            return val.toLowerCase().includes(searchText.toLowerCase());
          } else if (typeof val === 'object' && val !== null) {
            return Object.values(val).some(nestedVal => 
              typeof nestedVal === 'string' && nestedVal.toLowerCase().includes(searchText.toLowerCase())
            );
          }
          return false;
        });
      });
    }

    if (selectedFilter) {
      const filterOption = filterOptions.find(option => option.value === selectedFilter);
      if (filterOption) {
        filteredData = filteredData.filter(item => filterOption.filterFn(item, selectedFilter));
      }
    }

    if (sortDirection) {
      filteredData.sort((a, b) => {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase(); 

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    onFilter(filteredData);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        placeholder="Поиск..."
        prefix={<SearchOutlined />}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
      />
      <Select
        placeholder="Фильтр..."
        style={{ width: '100%' }}
        onChange={handleFilterChange}
        allowClear
      >
        {filterOptions.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      <Button 
        icon={sortDirection === 'asc' ? <SortAscendingOutlined /> : sortDirection === 'desc' ? <SortDescendingOutlined /> : null}
        onClick={handleSort}
      >
        Сортировка
      </Button>
    </Space>
  );
};

export default SearchAndFilter;