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
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
};

// Курсы валют (фиксированные для теста)
let cryptoPrices = {
    TON: 2.5,
    USDT: 1,
    BTC: 43000,
    ETH: 2200
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

// Обновление цены
function updatePrice() {
    const amount = Number(starsAmount.value) || 0;
    const crypto = cryptoSelect.value;
    const usdPrice = amount * 0.015; // $0.015 за 1 Stars
    const cryptoAmount = crypto === 'USDT' ? usdPrice : usdPrice / cryptoPrices[crypto];
    
    priceElement.textContent = `${cryptoAmount.toFixed(6)} ${crypto}`;
    priceUsdElement.textContent = `≈ $${usdPrice.toFixed(2)}`;
}

// Обработчики событий
starsAmount.addEventListener('input', updatePrice);
cryptoSelect.addEventListener('change', updatePrice);
closeModal.addEventListener('click', () => paymentModal.classList.add('hidden'));
confirmButton.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    alert('Транзакция отправлена на проверку');
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
updatePrice();
