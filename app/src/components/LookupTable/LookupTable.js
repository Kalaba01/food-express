import React from 'react';
import { useTranslation } from 'react-i18next';
import './LookupTable.css';

function LookupTable({ columns, data, actions, showActions, customRenderers }) {
  const { t } = useTranslation('global');

  const getColumnKey = (col) => {
    const map = {
      [t('Requests.ime')]: 'first_name',
      [t('Requests.prezime')]: 'last_name',
      [t('Requests.email')]: 'email',
      [t('Requests.info')]: 'additional_info',
      [t('Requests.type')]: 'request_type',
      [t('Requests.created')]: 'created_at',
      [t('Users.username')]: 'username',
      [t('Users.email')]: 'email',
      [t('Users.role')]: 'role',
      [t('DeliveryZones.name')]: 'name',
      [t('Restaurants.rating')]: 'rating',
      [t('Restaurants.category')]: 'category'
    };
    return map[col] || col.toLowerCase().replace(/\s+/g, '');
  };

  const getCellValue = (col, item) => {
    const key = getColumnKey(col);

    if (customRenderers && customRenderers[col]) {
      return customRenderers[col](item);
    }

    const value = item[key];
    if (key === 'additional_info' && !value) {
      return t('Requests.noInfo');
    }
    return value;
  };

  return (
    <div className="lookup-table-container">
      <table className="lookup-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
            {showActions && !columns.includes('Actions') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{getCellValue(col, item)}</td>
              ))}
              {showActions && (
                <td>
                  {actions.map(
                    (action, actionIndex) =>
                      action.show !== false && (
                        <button
                          key={actionIndex}
                          className={action.className}
                          onClick={() => action.handler(item)}
                        >
                          {action.label}
                        </button>
                      )
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LookupTable;
