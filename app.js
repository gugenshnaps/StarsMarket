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
    TON: 0,
    USDT: 1,
    BTC: 0,
    ETH: 0,
    BNB: 0,
    SOL: 0,
    XRP: 0,
    ADA: 0,
    DOGE: 0,
    TRX: 0,
    DOT: 0,
    MATIC: 0,
    LTC: 0,
    KAS: 0
};

// В начале файла после инициализации tg
tg.MainButton.text = "КУПИТЬ STARS";
tg.MainButton.color = tg.themeParams.button_color;
tg.MainButton.textColor = tg.themeParams.button_text_color;
tg.MainButton.hide();

// Обработчики быстрого выбора количества
quickAmounts.forEach(button => {
    button.addEventListener('click', () => {
        quickAmounts.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        starsAmount.value = button.dataset.amount;
        updatePrice();
    });
});

// Заменим обработчик кнопки buyButton на MainButton
starsAmount.addEventListener('input', () => {
    const amount = Number(starsAmount.value) || 0;
    if (amount > 0) {
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
    updatePrice();
});

// Обновление цены при изменении
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
                        cryptoPrices[coin] = parseFloat(item.lastPrice);
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
    const cryptoAmount = crypto === 'USDT' ? usdPrice : usdPrice / cryptoPrices[crypto];
    
    priceElement.textContent = `${cryptoAmount.toFixed(6)} ${crypto}`;
    priceUsdElement.textContent = `≈ $${usdPrice.toFixed(2)}`;
    
    buyButton.disabled = amount <= 0;
}

// Обработчик MainButton
tg.MainButton.onClick(() => {
    const amount = Number(starsAmount.value);
    if (amount > 0) {
        walletAddress.textContent = walletAddresses[cryptoSelect.value];
        paymentModal.classList.remove('hidden');
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
