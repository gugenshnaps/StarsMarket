// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
console.log('Telegram WebApp:', tg); // Проверяем объект WebApp
console.log('Init data:', tg.initData); // Проверяем init data
console.log('Init data unsafe:', tg.initDataUnsafe); // Проверяем unsafe data

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Расширяем на весь экран
    tg.expand();

    // Загружаем данные пользователя
    if (tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('User data:', user); // Отладочная информация
        
        // Аватар
        const avatar = document.getElementById('userAvatar');
        if (user.photo_url) {
            console.log('Photo URL:', user.photo_url); // Проверяем URL аватарки
            avatar.src = user.photo_url;
            avatar.classList.remove('hidden');
        } else {
            console.log('No photo URL provided'); // Если URL отсутствует
            // Показываем заглушку или инициалы
            avatar.classList.remove('hidden');
            avatar.style.background = var(--gradient-primary);
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.textContent = user.first_name.charAt(0);
        }
        
        // Имя
        const name = document.getElementById('userName');
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        if (fullName) {
            console.log('Full name:', fullName); // Проверяем имя
            name.textContent = fullName;
            name.classList.remove('hidden');
        }
        
        // Username
        const username = document.getElementById('userUsername');
        if (user.username) {
            console.log('Username:', user.username); // Проверяем username
            username.textContent = '@' + user.username;
            username.classList.remove('hidden');
        }
    } else {
        console.log('No user data available'); // Если данные пользователя отсутствуют
    }

    // Устанавливаем основной цвет
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);

    // Настраиваем кнопку в хедере Telegram
    tg.MainButton.setParams({
        text: 'КУПИТЬ STARS',
        color: tg.themeParams.button_color,
        text_color: tg.themeParams.button_text_color,
        is_active: false
    });
});

// Получаем элементы DOM
const cryptoSelect = document.getElementById('cryptoSelect');
const starsAmount = document.getElementById('starsAmount');
const priceElement = document.querySelector('.price');
const priceUsdElement = document.querySelector('.price-usd');
const quickAmounts = document.querySelectorAll('.quick-amount');
const buyButton = document.getElementById('buyButton');
const paymentModal = document.getElementById('paymentModal');
const walletAddress = document.getElementById('walletAddress');
const confirmButton = document.getElementById('confirmButton');
const closeModal = document.getElementById('closeModal');

// Адреса кошельков для каждой криптовалюты
const walletAddresses = {
    TON: 'EQBz1_22222222222222222222222222222222222222222',
    USDT: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    USDC: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    DAI: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    BUSD: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    TUSD: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    SOL: '88xZgNZx3WLMcDxF8WgPUY1VGb5YhfhFNEPFXvVwY7e2',
    BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
    KAS: 'kaspa:qqxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    AVAX: 'X-avax1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    LINK: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    UNI: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    ATOM: 'cosmos1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ADA: 'addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    XRP: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
    DOGE: 'D8vFz4p1L37jdg47HXKtSHA1bF2zn7GEpJ',
    DOT: '1FRMM8PEiWXYax7rpS6X4XZX1aAAxSWx1CrKTyrVYhV',
    LTC: 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    TRX: 'TXYz1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    SHIB: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
};

// Базовая цена Stars в USDT
const starsPrice = {
    USDT: 0.015 // цена за 1 Stars
};

// Объект для хранения курсов криптовалют
let cryptoPrices = {
    TON: 0,
    USDT: 1,
    USDC: 1,
    DAI: 1,
    BUSD: 1,
    TUSD: 1,
    BTC: 0,
    ETH: 0,
    SOL: 0,
    BNB: 0,
    KAS: 0,
    AVAX: 0,
    LINK: 0,
    UNI: 0,
    ATOM: 0,
    ADA: 0,
    XRP: 0,
    DOGE: 0,
    DOT: 0,
    LTC: 0,
    TRX: 0,
    SHIB: 0
};

// Обработчики быстрого выбора количества
quickAmounts.forEach(button => {
    button.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок
        quickAmounts.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс нажатой кнопке
        button.classList.add('active');
        // Устанавливаем значение в input
        starsAmount.value = button.dataset.amount;
        // Обновляем цену
        updatePrice();
    });
});

// Обновление цены при изменении количества Stars или криптовалюты
starsAmount.addEventListener('input', updatePrice);
cryptoSelect.addEventListener('change', updatePrice);

// Функция получения курсов с Bybit
async function fetchPrices() {
    try {
        const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot');
        const data = await response.json();
        
        if (data.result && data.result.list) {
            data.result.list.forEach(item => {
                const symbol = item.symbol;
                if (symbol.endsWith('USDT')) {
                    const coin = symbol.replace('USDT', '');
                    if (coin in cryptoPrices) {
                        cryptoPrices[coin] = parseFloat(item.lastPrice);
                    }
                }
            });
        }
        
        // Обновляем отображение цены
        updatePrice();
        
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// Функция обновления цены
function updatePrice() {
    const amount = Number(starsAmount.value) || 0;
    const crypto = cryptoSelect.value;
    
    // Рассчитываем стоимость
    const usdPrice = amount * starsPrice.USDT;
    const cryptoAmount = crypto === 'USDT' ? usdPrice : usdPrice / cryptoPrices[crypto];
    
    // Обновляем отображение
    priceElement.textContent = `${cryptoAmount.toFixed(6)} ${crypto}`;
    priceUsdElement.textContent = `≈ $${usdPrice.toFixed(2)}`;
    
    // Активируем кнопку покупки если сумма больше 0
    buyButton.disabled = amount <= 0;
}

// Обработчик нажатия кнопки покупки
buyButton.addEventListener('click', () => {
    const amount = Number(starsAmount.value);
    const crypto = cryptoSelect.value;
    
    if (amount > 0) {
        // Показываем адрес кошелька
        walletAddress.textContent = walletAddresses[crypto];
        // Показываем модальное окно
        paymentModal.classList.remove('hidden');
        // Запускаем таймер
        startTimer();
    }
});

// Закрытие модального окна
closeModal.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
});

// Подтверждение оплаты
confirmButton.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    const notification = document.getElementById('notification');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
});

// Функция таймера
function startTimer() {
    let timeLeft = 5 * 60; // 5 минут
    const timerElement = document.getElementById('paymentTimer');
    
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            paymentModal.classList.add('hidden');
        }
        timeLeft--;
    }, 1000);
}

// Получаем курсы при загрузке
fetchPrices();

// Обновляем курсы каждые 10 секунд
setInterval(fetchPrices, 10000);
