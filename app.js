// Получаем элементы
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

// Адреса кошельков
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
    MATIC: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    SHIB: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
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
    MATIC: 0,
    SHIB: 0
};

// Быстрые кнопки
quickAmounts.forEach(button => {
    button.addEventListener('click', () => {
        quickAmounts.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        starsAmount.value = button.dataset.amount;
        updatePrice();
    });
});

// Кнопка покупки
buyButton.addEventListener('click', () => {
    const amount = Number(starsAmount.value);
    if (amount > 0) {
        walletAddress.textContent = walletAddresses[cryptoSelect.value];
        paymentModal.classList.remove('hidden');
        startTimer();
    }
});

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
                        if (price > 0) {
                            cryptoPrices[coin] = price;
                            console.log(`${coin}: ${price}`); // Для отладки
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
    if (crypto === 'USDT' || crypto === 'USDC' || crypto === 'DAI' || crypto === 'BUSD' || crypto === 'TUSD') {
        cryptoAmount = usdPrice;
    } else {
        const price = cryptoPrices[crypto];
        cryptoAmount = price > 0 ? usdPrice / price : 0;
    }
    
    priceElement.textContent = `${cryptoAmount.toFixed(6)} ${crypto}`;
    priceUsdElement.textContent = `≈ $${usdPrice.toFixed(2)}`;
}

// Обработчики событий
starsAmount.addEventListener('input', updatePrice);
cryptoSelect.addEventListener('change', updatePrice);
closeModal.addEventListener('click', () => paymentModal.classList.add('hidden'));
confirmButton.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    const notification = document.getElementById('notification');
    notification.classList.remove('hidden');
    setTimeout(() => notification.classList.add('hidden'), 3000);
});

// Таймер
function startTimer() {
    let timeLeft = 300; // 5 минут
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

// Инициализация
fetchPrices();
// Обновляем курсы каждые 10 секунд
setInterval(fetchPrices, 10000);
