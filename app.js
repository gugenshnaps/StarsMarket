// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Расширяем на весь экран
    tg.expand();

    // Загружаем данные пользователя
    if (tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        // Аватар
        const avatar = document.getElementById('userAvatar');
        if (user.photo_url) {
            avatar.src = user.photo_url;
            avatar.classList.remove('hidden');
        }
        
        // Имя
        const name = document.getElementById('userName');
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        if (fullName) {
            name.textContent = fullName;
            name.classList.remove('hidden');
        }
        
        // Username
        const username = document.getElementById('userUsername');
        if (user.username) {
            username.textContent = '@' + user.username;
            username.classList.remove('hidden');
        }
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
    TON: 1,
    USDT: 1,
    USDC: 0,
    DAI: 0,
    BUSD: 0,
    TUSD: 0,
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

// Храним последний известный курс TON/USDT
let lastTonUsdPrice = null;

// Получаем элементы DOM
const cryptoSelect = document.getElementById('cryptoSelect');
const starsAmount = document.getElementById('starsAmount');
const priceDisplay = document.getElementById('priceDisplay');
const selectedCrypto = document.getElementById('selectedCrypto');
const buyButton = document.getElementById('buyButton');
const paymentModal = document.getElementById('paymentModal');
const modalAmount = document.getElementById('modalAmount');
const modalCrypto = document.getElementById('modalCrypto');
const walletAddress = document.getElementById('walletAddress');
const confirmButton = document.getElementById('confirmButton');
const closeModal = document.getElementById('closeModal');
const quickAmountButtons = document.querySelectorAll('.quick-amount');
const usdPrice = document.getElementById('usdPrice');

// Добавляем новые переменные
const accountInfo = document.querySelector('.account-info');
const accountAvatar = document.getElementById('accountAvatar');
const accountName = document.getElementById('accountName');

// Добавляем переменные для таймера
let paymentTimer = null;
const PAYMENT_TIMEOUT = 5 * 60; // 5 минут в секундах
const timerDisplay = document.getElementById('paymentTimer');

// Добавляем переменную для уведомления
const successNotification = document.getElementById('successNotification');

// Временное решение для цены Stars, пока не решим проблему с CORS
async function fetchStarsPrice() {
    try {
        // Здесь должен быть запрос к fragment.com
        // Пока используем фиксированное значение
        starsPrice.TON = 0.1462; // Цена за 50 Stars
        calculatePrice();
    } catch (error) {
        console.error('Ошибка при получении цены Stars:', error);
    }
}

// Обновляем список поддерживаемых пар
const pairs = [
    // Стейблкоины
    'TONUSDT',
    'USDCUSDT',
    'DAIUSDT',
    'BUSDUSDT',
    'TUSDUSDT',
    
    // Топ криптовалюты
    'BTCUSDT',
    'ETHUSDT',
    'SOLUSDT',
    'BNBUSDT',
    
    // Альткоины
    'KASUSDT',
    'AVAXUSDT',
    'LINKUSDT',
    'UNIUSDT',
    'ATOMUSDT',
    'ADAUSDT',
    'XRPUSDT',
    'DOGEUSDT',
    'DOTUSDT',
    'LTCUSDT',
    'TRXUSDT',
    'SHIBUSDT'
];

// Функция получения курсов криптовалют с ByBit
async function fetchCryptoPrices() {
    try {
        // Используем глобальный список пар
        const usdtPrices = {};
        
        // Получаем курсы всех криптовалют к USDT
        for (const pair of pairs) {
            try {
                const url = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${pair}`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.retCode === 0 && data.result.list && data.result.list[0]) {
                    const symbol = pair.replace('USDT', '');
                    const price = parseFloat(data.result.list[0].lastPrice);
                    
                    if (!isNaN(price) && price > 0) {
                        usdtPrices[symbol] = price;
                        console.log(`${symbol}/USDT price:`, price);
                    }
                }
            } catch (error) {
                console.error(`Error fetching ${pair}:`, error);
            }
        }

        // Обновляем курсы всех криптовалют
        if (Object.keys(usdtPrices).length > 0) {
            cryptoPrices = {
                TON: usdtPrices.TON || 0,
                USDT: 1, // USDT всегда 1
                USDC: usdtPrices.USDC || 0,
                DAI: usdtPrices.DAI || 0,
                BUSD: usdtPrices.BUSD || 0,
                TUSD: usdtPrices.TUSD || 0,
                BTC: usdtPrices.BTC || 0,
                ETH: usdtPrices.ETH || 0,
                SOL: usdtPrices.SOL || 0,
                BNB: usdtPrices.BNB || 0,
                KAS: usdtPrices.KAS || 0,
                AVAX: usdtPrices.AVAX || 0,
                LINK: usdtPrices.LINK || 0,
                UNI: usdtPrices.UNI || 0,
                ATOM: usdtPrices.ATOM || 0,
                ADA: usdtPrices.ADA || 0,
                XRP: usdtPrices.XRP || 0,
                DOGE: usdtPrices.DOGE || 0,
                DOT: usdtPrices.DOT || 0,
                LTC: usdtPrices.LTC || 0,
                TRX: usdtPrices.TRX || 0,
                SHIB: usdtPrices.SHIB || 0
            };

            console.log('Updated crypto prices:', cryptoPrices);
            calculatePrice();
        }
    } catch (error) {
        console.error('Error in fetchCryptoPrices:', error);
    }
}

// Функция расчета цены
function calculatePrice() {
    const stars = parseFloat(starsAmount.value) || 0;
    const selectedCryptoValue = cryptoSelect.value;
    
    // Проверяем наличие курсов
    if (!cryptoPrices[selectedCryptoValue]) {
        console.error('Missing crypto price');
        return;
    }

    // 1. Рассчитываем стоимость Stars в USDT
    const priceInUsdt = stars * starsPrice.USDT;
    
    // 2. Конвертируем из USDT в выбранную криптовалюту
    let finalPrice;
    if (selectedCryptoValue === 'USDT') {
        finalPrice = priceInUsdt;
    } else if (selectedCryptoValue === 'TON') {
        finalPrice = priceInUsdt / cryptoPrices.TON;
    } else {
        // Для остальных криптовалют: делим цену в USDT на курс криптовалюты
        finalPrice = priceInUsdt / cryptoPrices[selectedCryptoValue];
    }

    console.log('Price calculation:', {
        stars,
        priceInUsdt,
        selectedCrypto: selectedCryptoValue,
        cryptoPrice: cryptoPrices[selectedCryptoValue],
        finalPrice
    });

    // Отображаем результаты
    if (!isNaN(finalPrice) && finalPrice > 0) {
        priceDisplay.textContent = finalPrice.toFixed(8);
        selectedCrypto.textContent = selectedCryptoValue;
        usdPrice.textContent = priceInUsdt.toFixed(2);
    }
}

// Обработчики событий
cryptoSelect.addEventListener('change', calculatePrice);

starsAmount.addEventListener('input', () => {
    quickAmountButtons.forEach(btn => btn.classList.remove('active'));
    calculatePrice();
});

quickAmountButtons.forEach(button => {
    button.addEventListener('click', () => {
        quickAmountButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        starsAmount.value = button.dataset.amount;
        calculatePrice();
    });
});

// Функция форматирования времени
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Функция запуска таймера
function startPaymentTimer() {
    let timeLeft = PAYMENT_TIMEOUT;
    
    // Очищаем предыдущий таймер если он есть
    if (paymentTimer) {
        clearInterval(paymentTimer);
    }
    
    // Показываем начальное время
    timerDisplay.textContent = formatTime(timeLeft);
    
    paymentTimer = setInterval(() => {
        timeLeft -= 1;
        
        if (timeLeft <= 0) {
            // Время вышло
            clearInterval(paymentTimer);
            paymentModal.classList.add('hidden');
            alert('Время на оплату истекло. Пожалуйста, попробуйте снова.');
        } else {
            // Обновляем отображение таймера
            timerDisplay.textContent = formatTime(timeLeft);
            
            // Добавляем красный цвет когда осталось мало времени
            if (timeLeft <= 60) { // последняя минута
                timerDisplay.style.color = '#FF3B30';
            }
        }
    }, 1000);
}

// Функция остановки таймера
function stopPaymentTimer() {
    if (paymentTimer) {
        clearInterval(paymentTimer);
        paymentTimer = null;
    }
    timerDisplay.textContent = formatTime(PAYMENT_TIMEOUT);
    timerDisplay.style.color = ''; // сбрасываем цвет
}

// Обновляем обработчик открытия модального окна
buyButton.addEventListener('click', () => {
    const amount = parseFloat(starsAmount.value);
    
    // Проверяем количество Stars
    if (amount <= 0) {
        alert('Пожалуйста, введите количество Stars больше 0');
        return;
    }

    // Проверяем username только при попытке покупки
    const recipientAccount = document.getElementById('recipientAccount').value.trim();
    if (!recipientAccount) {
        alert('Пожалуйста, введите аккаунт получателя');
        return;
    }

    modalAmount.textContent = priceDisplay.textContent;
    modalCrypto.textContent = cryptoSelect.value;
    walletAddress.textContent = walletAddresses[cryptoSelect.value];
    paymentModal.classList.remove('hidden');
    
    // Запускаем таймер
    startPaymentTimer();
});

// Обновляем обработчик закрытия модального окна
closeModal.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    stopPaymentTimer();
});

// Функция показа уведомления
function showNotification() {
    successNotification.classList.add('show');
    
    // Скрываем уведомление через 5 секунд
    setTimeout(() => {
        successNotification.classList.remove('show');
    }, 5000);
}

async function notifyAdmin(orderData) {
    try {
        const message = `
🔔 *Новый заказ Stars!*

👤 Получатель: ${orderData.recipientAccount}
💎 Количество: ${orderData.starsAmount} Stars
💰 Сумма: ${orderData.finalPrice} ${orderData.selectedCrypto}
💵 USD: $${orderData.usdAmount}
🕒 Время: ${new Date().toLocaleString()}
        `;

        const response = await fetch(`https://api.telegram.org/bot${BOT_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: BOT_CONFIG.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Обновляем обработчик кнопки подтверждения
confirmButton.addEventListener('click', async () => {
    const orderData = {
        recipientAccount: document.getElementById('recipientAccount').value,
        starsAmount: starsAmount.value,
        finalPrice: priceDisplay.textContent,
        selectedCrypto: cryptoSelect.value,
        usdAmount: usdPrice.textContent
    };

    await notifyAdmin(orderData);
    stopPaymentTimer();
    paymentModal.classList.add('hidden');
    showNotification();
});

// Интервал обновления цен
let priceUpdateInterval;

function startPriceUpdates() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }
    
    priceUpdateInterval = setInterval(async () => {
        await Promise.all([
            fetchStarsPrice(),
            fetchCryptoPrices()
        ]);
    }, 15000);
}

// Инициализация
async function initialize() {
    await Promise.all([
        fetchStarsPrice(),
        fetchCryptoPrices()
    ]);
    calculatePrice();
    startPriceUpdates();
}

// Очищаем таймер при закрытии страницы
window.addEventListener('beforeunload', () => {
    stopPaymentTimer();
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
    }
});

// Запуск инициализации
initialize();
