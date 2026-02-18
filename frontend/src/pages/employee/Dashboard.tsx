import React from 'react';

const Dashboard: React.FC = () => {
  // Просто показываем что пользователь залогинен
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>✅ Успешный вход!</h1>
      <p>Вы успешно авторизовались в системе</p>
      <p>Token сохранен в localStorage</p>

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Dashboard;