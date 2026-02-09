// Глобальные переменные
let currentPage = 1;
const limit = 10;
let usersData = [];
let authToken = null;

// Получение токена из куки
function getToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'access_token') {
            return value;
        }
    }
    return null;
}

// Получение CSRF токена (если используется)
function getCSRFToken() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    return csrfToken ? csrfToken.content : '';
}

// Загрузка пользователей
async function loadUsers(page = 1) {
    currentPage = page;
    const skip = (page - 1) * limit;

    try {
        authToken = getToken();
        const response = await fetch(`/api/v1/admin/users?skip=${skip}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Не авторизован - редирект на логин
            window.location.href = '/login?redirect=/admin';
            return;
        }

        if (response.status === 403) {
            // Нет прав - показать ошибку
            showError('У вас нет прав для доступа к админ-панели');
            return;
        }

        const data = await response.json();
        usersData = data.users;

        // Обновляем статистику
        updateStats(data.total);

        // Отрисовываем таблицу
        renderUsersTable();

        // Отрисовываем пагинацию
        renderPagination(data.total);

    } catch (error) {
        console.error('Error loading users:', error);
        showError('Ошибка при загрузке пользователей');
    }
}

// Отрисовка таблицы пользователей
function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    if (usersData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Нет пользователей</td></tr>';
        return;
    }

    usersData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.full_name || '-'}</td>
            <td>
                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                    ${user.is_active ? 'Активен' : 'Неактивен'}
                </span>
            </td>
            <td>
                <span class="role-badge ${user.is_superuser ? 'admin' : 'user'}">
                    ${user.is_superuser ? 'Админ' : 'Пользователь'}
                </span>
            </td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td class="actions">
                <button class="btn-small btn-edit" onclick="editUser(${user.id})">
                    ✏️
                </button>
                <button class="btn-small btn-toggle" onclick="toggleUserActive(${user.id})">
                    ${user.is_active ? '❌' : '✅'}
                </button>
                <button class="btn-small btn-delete" onclick="deleteUser(${user.id})" 
                        ${user.id === 1 ? 'disabled' : ''}>
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Обновление статистики
function updateStats(total) {
    document.getElementById('total-users').textContent = total;

    const activeUsers = usersData.filter(u => u.is_active).length;
    const adminUsers = usersData.filter(u => u.is_superuser).length;

    document.getElementById('active-users').textContent = activeUsers;
    document.getElementById('admin-users').textContent = adminUsers;
}

// Отрисовка пагинации
function renderPagination(total) {
    const totalPages = Math.ceil(total / limit);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Кнопка "Назад"
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="loadUsers(${currentPage - 1})">←</button>`;
    }

    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" 
                      onclick="loadUsers(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    // Кнопка "Вперед"
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="loadUsers(${currentPage + 1})">→</button>`;
    }

    pagination.innerHTML = html;
}

// Создание пользователя
async function createUser(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        full_name: formData.get('full_name') || null,
        password: formData.get('password'),
        is_active: formData.get('is_active') === 'on',
        is_superuser: formData.get('is_superuser') === 'on'
    };

    try {
        const response = await fetch('/api/v1/admin/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка при создании пользователя');
        }

        const newUser = await response.json();

        // Закрываем модалку и обновляем список
        closeModal();
        showSuccess('Пользователь успешно создан');
        loadUsers(currentPage);

        // Очищаем форму
        form.reset();

    } catch (error) {
        showError(error.message);
    }
}

// Редактирование пользователя
function editUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;

    // Заполняем форму
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-full_name').value = user.full_name || '';
    document.getElementById('edit-is_active').checked = user.is_active;
    document.getElementById('edit-is_superuser').checked = user.is_superuser;

    // Показываем модалку
    document.getElementById('editUserModal').style.display = 'block';
}

// Обновление пользователя
async function updateUser(event) {
    event.preventDefault();

    const form = event.target;
    const userId = document.getElementById('edit-user-id').value;
    const formData = new FormData(form);

    const userData = {};

    // Добавляем только измененные поля
    if (formData.get('email')) userData.email = formData.get('email');
    if (formData.get('full_name')) userData.full_name = formData.get('full_name');
    if (formData.get('password')) userData.password = formData.get('password');
    userData.is_active = formData.get('is_active') === 'on';
    userData.is_superuser = formData.get('is_superuser') === 'on';

    try {
        const response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка при обновлении пользователя');
        }

        closeModal();
        showSuccess('Пользователь успешно обновлен');
        loadUsers(currentPage);

    } catch (error) {
        showError(error.message);
    }
}

// Включить/выключить пользователя
async function toggleUserActive(userId) {
    if (!confirm('Изменить статус пользователя?')) return;

    try {
        const response = await fetch(`/api/v1/admin/users/${userId}/toggle-active`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка при изменении статуса');
        }

        showSuccess('Статус пользователя изменен');
        loadUsers(currentPage);

    } catch (error) {
        showError(error.message);
    }
}

// Удаление пользователя
async function deleteUser(userId) {
    if (!confirm('Вы уверены, что хотите удалить пользователя? Это действие нельзя отменить.')) {
        return;
    }

    try {
        const response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка при удалении пользователя');
        }

        showSuccess('Пользователь успешно удален');
        loadUsers(currentPage);

    } catch (error) {
        showError(error.message);
    }
}

// Уведомления
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Модальные окна
function showCreateUserModal() {
    document.getElementById('createUserModal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Закрытие модалки при клике вне контента
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal();
    }
};

// Загрузка данных при открытии страницы
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();

    // Проверяем авторизацию
    if (!getToken()) {
        window.location.href = '/login?redirect=/admin';
    }
});