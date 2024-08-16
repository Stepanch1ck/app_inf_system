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
  showFilter?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps<any>> = ({ data, onFilter, filterOptions, onSearch, showFilter }) => {
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

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedFilter(null);
    setSortDirection(null);
    onFilter(data);
  };

  const filterData = () => {
    let filteredData = [...data];

    if (searchText) {
      const lowerCaseSearchText = searchText.toLowerCase();
      filteredData = filteredData.filter(item => {
        return Object.keys(item).some(key => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerCaseSearchText);
          } else if (typeof value === 'object' && value !== null) {
            return recursivelySearchObject(value, lowerCaseSearchText);
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

    if (searchText === '' && selectedFilter === null) {
      filteredData = data;
    }

    onFilter(filteredData);
  };
  const recursivelySearchObject = (obj: any, searchText: string): boolean => {
    return Object.keys(obj).some(key => {
      const value = obj[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchText);
      } else if (typeof value === 'object' && value !== null) {
        return recursivelySearchObject(value, searchText);
      }
      return false;
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        placeholder="Поиск..."
        prefix={<SearchOutlined />}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        value={searchText}
      />
      {showFilter && ( 
        <Select
          placeholder="Фильтр..."
          style={{ width: '100%' }}
          onChange={handleFilterChange}
          allowClear
          value={selectedFilter}
        >
          {filterOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )}
      <Space>
        <Button
          icon={sortDirection === 'asc' ? <SortAscendingOutlined /> : sortDirection === 'desc' ? <SortDescendingOutlined /> : null}
          onClick={handleSort}
        >
          Сортировка
        </Button>
        <Button onClick={handleResetFilters}>Сбросить</Button>
      </Space>
    </Space>
  );
};

export default SearchAndFilter;