// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

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

// Объект для хранения курсов криптовалют
let cryptoPrices = {
    TON: 2.5,      // Примерные начальные значения
    USDT: 1,
    BTC: 43000,
    ETH: 2200,
    BNB: 300,
    SOL: 100,
    XRP: 0.6,
    ADA: 0.5,
    DOGE: 0.08,
    TRX: 0.09,
    DOT: 7,
    MATIC: 0.8,
    LTC: 70,
    KAS: 0.1
};

// Обработчики быстрых кнопок
quickAmounts.forEach(button => {
    button.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок
        quickAmounts.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс нажатой кнопке
        button.classList.add('active');
        // Устанавливаем значение
        starsAmount.value = button.dataset.amount;
        // Обновляем цену
        updatePrice();
    });
});

// Простой обработчик кнопки покупки
buyButton.addEventListener('click', () => {
    const amount = Number(starsAmount.value);
    if (amount > 0) {
        // Показываем адрес кошелька
        walletAddress.textContent = walletAddresses[cryptoSelect.value];
        // Показываем модальное окно
        paymentModal.classList.remove('hidden');
        // Запускаем таймер
        startTimer();
    }
});

// Обновление цены при изменении количества или криптовалюты
starsAmount.addEventListener('input', updatePrice);
cryptoSelect.addEventListener('change', updatePrice);

// Получение курсов с Bybit
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
                        const price = parseFloat(item.lastPrice);
                        if (price > 0) { // Проверяем, что цена положительная
                            cryptoPrices[coin] = price;
                        }
                    }
                }
            });
        }
        updatePrice();
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// Обновление цены
function updatePrice() {
    const amount = Number(starsAmount.value) || 0;
    const crypto = cryptoSelect.value;
    
    const usdPrice = amount * 0.015; // $0.015 за 1 Stars
    
    let cryptoAmount;
    if (crypto === 'USDT') {
        cryptoAmount = usdPrice;
    } else {
        const price = cryptoPrices[crypto];
        cryptoAmount = price > 0 ? usdPrice / price : 0;
    }
    
    priceElement.textContent = `${cryptoAmount.toFixed(6)} ${crypto}`;
    priceUsdElement.textContent = `≈ $${usdPrice.toFixed(2)}`;
}

// Закрытие модального окна
closeModal.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
});

// Подтверждение оплаты
confirmButton.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    const notification = document.getElementById('notification');
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
});

// Таймер
function startTimer() {
    let timeLeft = 5 * 60;
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

// Добавим обработчики для закрытия клавиатуры
starsAmount.addEventListener('blur', () => {
    tg.HapticFeedback.impactOccurred('light');
});

// Добавим кнопку "Готово" над клавиатурой
tg.setHeaderButton({
    text: 'Готово',
    show: true,
    onClick: () => {
        starsAmount.blur();
    }
});

// Также добавим обработку Enter
starsAmount.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        starsAmount.blur();
    }
});

// Инициализация
fetchPrices();
setInterval(fetchPrices, 10000);
