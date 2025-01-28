// Добавим логирование для проверки загрузки конфигурации
console.log('Checking CONFIG availability:', window.CONFIG);
if (window.CONFIG) {
    console.log('CONFIG details:', {
        'TELEGRAM_BOT_TOKEN exists': !!window.CONFIG.TELEGRAM_BOT_TOKEN,
        'TELEGRAM_CHANNEL_ID exists': !!window.CONFIG.TELEGRAM_CHANNEL_ID,
        'API_URL exists': !!window.CONFIG.API_URL,
        'BOT_TOKEN length': window.CONFIG.TELEGRAM_BOT_TOKEN ? window.CONFIG.TELEGRAM_BOT_TOKEN.length : 0,
        'CHANNEL_ID length': window.CONFIG.TELEGRAM_CHANNEL_ID ? window.CONFIG.TELEGRAM_CHANNEL_ID.length : 0
    });
}
console.log('Current window object:', window);

// Дожидаемся загрузки DOM и Telegram WebApp
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking Telegram WebApp');
    
    // Ждем инициализацию Telegram WebApp
    function initApp() {
        if (!window.Telegram || !window.Telegram.WebApp) {
            console.log('Waiting for Telegram WebApp...');
            setTimeout(initApp, 100);
            return;
        }

        console.log('Telegram WebApp ready, initializing app');
        const tg = window.Telegram.WebApp;

        // Проверяем наличие конфигурации
        if (!window.CONFIG) {
            console.error('Configuration is not loaded');
            return;
        }

        // Принудительно расширяем окно
        if (tg.platform !== 'unknown') {
            tg.expand();
        }

        // Обработчик изменения размера окна
        tg.onEvent('viewportChanged', () => {
            if (!tg.isExpanded) {
                tg.expand();
            }
        });

        // Получаем все необходимые элементы
        const elements = {
            cryptoSelect: document.getElementById('cryptoSelect'),
            starsAmount: document.getElementById('starsAmount'),
            priceElement: document.querySelector('.price'),
            priceUsdElement: document.querySelector('.price-usd'),
            quickAmounts: document.querySelectorAll('.quick-amount'),
            buyButton: document.getElementById('buyButton'),
            paymentModal: document.getElementById('paymentModal'),
            walletAddress: document.getElementById('walletAddress'),
            confirmButton: document.getElementById('confirmButton'),
            closeModal: document.getElementById('closeModal'),
            notification: document.getElementById('notification')
        };

        // Проверяем наличие всех элементов
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.error('Missing elements:', missingElements);
            return;
        }

        // Остальной код без изменений
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

        let currentTimer;

        // Функции
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
                                    console.log(`${coin}: ${price}`);
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

        function updatePrice() {
            const amount = Number(elements.starsAmount.value) || 0;
            const crypto = elements.cryptoSelect.value;
            const usdPrice = amount * 0.015;
            
            let cryptoAmount;
            if (crypto === 'USDT' || crypto === 'USDC' || crypto === 'DAI' || crypto === 'BUSD' || crypto === 'TUSD') {
                cryptoAmount = usdPrice;
            } else {
                const price = cryptoPrices[crypto];
                cryptoAmount = price > 0 ? usdPrice / price : 0;
            }
            
            elements.priceElement.textContent = `${cryptoAmount.toFixed(6)} ${crypto}`;
            elements.priceUsdElement.textContent = `≈ $${usdPrice.toFixed(2)}`;
        }

        function startTimer() {
            if (currentTimer) {
                clearInterval(currentTimer);
            }
            
            let timeLeft = 300;
            const timerElement = document.getElementById('paymentTimer');
            timerElement.textContent = '5:00';
            
            currentTimer = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 0) {
                    clearInterval(currentTimer);
                    elements.paymentModal.classList.add('hidden');
                }
            }, 1000);
        }

        // Обработчики событий
        elements.quickAmounts.forEach(button => {
            button.addEventListener('click', () => {
                elements.quickAmounts.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                elements.starsAmount.value = button.dataset.amount;
                updatePrice();
            });
        });

        elements.buyButton.addEventListener('click', () => {
            const amount = Number(elements.starsAmount.value);
            if (amount > 0) {
                elements.walletAddress.textContent = walletAddresses[elements.cryptoSelect.value];
                elements.paymentModal.classList.remove('hidden');
                startTimer();
            }
        });

        elements.closeModal.addEventListener('click', () => {
            elements.paymentModal.classList.add('hidden');
            if (currentTimer) {
                clearInterval(currentTimer);
            }
        });

        elements.confirmButton.addEventListener('click', async () => {
            try {
                if (!window.CONFIG) {
                    throw new Error('Configuration is not loaded');
                }

                const message = `
🌟 Новый заказ Stars!

👤 Получатель: ${elements.starsAmount.value}
💎 Количество: ${elements.starsAmount.value} Stars
💰 Оплата: ${elements.priceElement.textContent}
💵 Сумма в USD: ${elements.priceUsdElement.textContent}

⏰ Время заказа: ${new Date().toLocaleString()}
`;

                console.log('Sending notification...');
                console.log('Message:', message);

                const response = await fetch(`${window.CONFIG.API_URL}${window.CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: window.CONFIG.TELEGRAM_CHANNEL_ID,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });

                const data = await response.json();
                console.log('Response:', data);

                if (data.ok) {
                    elements.paymentModal.classList.add('hidden');
                    if (currentTimer) {
                        clearInterval(currentTimer);
                    }
                    elements.notification.classList.remove('hidden');
                    setTimeout(() => elements.notification.classList.add('hidden'), 3000);
                } else {
                    throw new Error(`Telegram API Error: ${data.description || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Full error details:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                alert(`Произошла ошибка при отправке уведомления: ${error.message}`);
            }
        });

        // Дополнительные обработчики
        elements.starsAmount.addEventListener('input', updatePrice);
        elements.cryptoSelect.addEventListener('change', updatePrice);

        // Инициализация
        fetchPrices();
        setInterval(fetchPrices, 10000);

        // Автоматический выбор 1000 Stars
        const button1000 = Array.from(elements.quickAmounts).find(btn => btn.dataset.amount === '1000');
        if (button1000) {
            button1000.click();
        }

        // Обработчики для iOS
        elements.starsAmount.addEventListener('focus', () => {
            if (tg.platform === 'ios') {
                tg.setHeaderButton({
                    text: 'Done',
                    show: true,
                    onClick: () => elements.starsAmount.blur()
                });
            }
        });

        elements.starsAmount.addEventListener('blur', () => {
            tg.setHeaderButton({
                show: false
            });
        });

        // Закрытие клавиатуры по клику вне поля
        document.addEventListener('click', (e) => {
            if (e.target !== elements.starsAmount && document.activeElement === elements.starsAmount) {
                elements.starsAmount.blur();
            }
        });

        elements.starsAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.starsAmount.blur();
            }
        });
    }

    // Запускаем инициализацию
    initApp();
});
