// Cookie functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

// Save/Load functions using cookies
function saveGame(gameState) {
    setCookie('dogeGame', JSON.stringify(gameState), 365); // Save for 1 year
}

function loadGame() {
    const savedState = getCookie('dogeGame');
    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (e) {
            console.error('Error loading saved game:', e);
        }
    }
    return {
        coins: 0,
        ownedHats: [],
        clickMultiplier: 1,
        equippedHat: null
    };
}

// Hat images mapping
const hatImages = {
    party: 'https://pngimg.com/d/birthday_hat_PNG86537.png',
    cowboy: 'https://cdn.sanity.io/images/v8kybopt/production/af7be4b35553a9752ec9a94b654f99126ebd22b5-2000x2000.png?auto=format&fit=max&w=1080',
    crown: 'https://pngimg.com/d/crown_PNG8.png'
};

// Load saved game state
let gameState = loadGame();
let coins = gameState.coins;
const coinCounter = document.getElementById('coin-count');
const hatDisplay = document.getElementById('hat-display');
coinCounter.textContent = coins;

// Update hat display
function updateHatDisplay() {
    if (gameState.equippedHat && hatImages[gameState.equippedHat]) {
        hatDisplay.src = hatImages[gameState.equippedHat];
        hatDisplay.style.display = 'block';
    } else {
        hatDisplay.style.display = 'none';
    }
}

// Initialize hat display
updateHatDisplay();

// Modal elements
const gambleBtn = document.getElementById('gamble-btn');
const gamblingModal = document.getElementById('gambling-modal');
const coinflipGame = document.getElementById('coinflip-game');
const blackjackGame = document.getElementById('blackjack-game');
const shopModal = document.getElementById('shop-modal');
const closeModal = document.getElementById('close-modal');
const closeButtons = document.querySelectorAll('.close-game');
const closeShop = document.getElementById('close-shop');
const resetBtn = document.getElementById('reset-btn');

// Game buttons
const coinflipBtn = document.getElementById('coinflip-btn');
const blackjackBtn = document.getElementById('blackjack-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const startBlackjackBtn = document.getElementById('start-blackjack');
const upgradeBtn = document.getElementById('upgrade');

function updateCoins(newAmount) {
    coins = newAmount;
    gameState.coins = coins;
    coinCounter.textContent = coins;
    saveGame(gameState);
}

function createFloatingText(x, y, text = '+' + gameState.clickMultiplier) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.className = 'click-text';
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    document.body.appendChild(floatingText);
    
    setTimeout(() => {
        document.body.removeChild(floatingText);
    }, 1000);
}

// Shop functionality
upgradeBtn.addEventListener('click', () => {
    shopModal.style.display = 'block';
    updateShopDisplay();
});

closeShop.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

function updateShopDisplay() {
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        const buyButton = item.querySelector('.buy-hat');
        const hatName = buyButton.dataset.hat;
        if (gameState.ownedHats.includes(hatName)) {
            item.classList.add('owned');
            buyButton.textContent = gameState.equippedHat === hatName ? 'EQUIPPED' : 'EQUIP';
            buyButton.disabled = gameState.equippedHat === hatName;
        }
    });
}

document.querySelectorAll('.buy-hat').forEach(button => {
    button.addEventListener('click', () => {
        const cost = parseInt(button.dataset.cost);
        const multiplier = parseInt(button.dataset.multiplier);
        const hatName = button.dataset.hat;

        if (gameState.ownedHats.includes(hatName)) {
            // Equip the hat
            gameState.equippedHat = hatName;
            updateHatDisplay();
            saveGame(gameState);
            updateShopDisplay();
            alert(`Equipped the ${hatName}!`);
        } else if (coins >= cost) {
            updateCoins(coins - cost);
            gameState.ownedHats.push(hatName);
            gameState.clickMultiplier += multiplier;
            gameState.equippedHat = hatName; // Automatically equip new hat
            saveGame(gameState);
            updateHatDisplay();
            updateShopDisplay();
            alert(`You bought and equipped the ${hatName}! Now earning ${gameState.clickMultiplier} coins per click!`);
        } else {
            alert('Not enough coins!');
        }
    });
});

// Initialize owned hats
updateShopDisplay();

// Doge click handler with multiplier
const doge = document.getElementById('doge');
doge.addEventListener('click', (event) => {
    updateCoins(coins + gameState.clickMultiplier);
    createFloatingText(event.pageX, event.pageY);
    
    doge.style.transform = 'scale(0.95)';
    setTimeout(() => {
        doge.style.transform = 'scale(1)';
    }, 100);
});

// Modal controls
gambleBtn.addEventListener('click', () => {
    if (coins < 1) {
        alert('You need at least 1 Such Coin to gamble!');
        return;
    }
    gamblingModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    gamblingModal.style.display = 'none';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal').style.display = 'none';
    });
});

// Coinflip game
coinflipBtn.addEventListener('click', () => {
    gamblingModal.style.display = 'none';
    coinflipGame.style.display = 'block';
});

function playCoinflip(choice) {
    const bet = parseInt(document.getElementById('coinflip-bet').value);
    if (bet > coins) {
        alert('Not enough Such Coins!');
        return;
    }
    if (bet < 1) {
        alert('Minimum bet is 1 Such Coin!');
        return;
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    updateCoins(coins - bet);
    
    if (choice === result) {
        const winnings = bet * 2;
        updateCoins(coins + winnings);
        createFloatingText(event.pageX, event.pageY, `+${winnings}`);
        alert(`Much win! You got ${result}!`);
    } else {
        createFloatingText(event.pageX, event.pageY, `-${bet}`);
        alert(`Such lose! It was ${result}!`);
    }
    
    coinflipGame.style.display = 'none';
}

document.getElementById('choose-heads').addEventListener('click', () => playCoinflip('heads'));
document.getElementById('choose-tails').addEventListener('click', () => playCoinflip('tails'));

// Blackjack game
blackjackBtn.addEventListener('click', () => {
    gamblingModal.style.display = 'none';
    blackjackGame.style.display = 'block';
    resetBlackjack();
});

const deck = [];
let playerHand = [];
let dealerHand = [];
let currentBet = 0;

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    deck.length = 0;
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    
    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}

function calculateHand(hand) {
    let sum = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            sum += 11;
        } else {
            sum += getCardValue(card);
        }
    }
    
    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    
    return sum;
}

function updateBlackjackDisplay() {
    const dealerCardsDiv = document.getElementById('dealer-cards');
    const playerCardsDiv = document.getElementById('player-cards');
    
    dealerCardsDiv.textContent = `Dealer's cards: ${dealerHand.map(card => card.value + card.suit).join(' ')}`;
    playerCardsDiv.textContent = `Your cards: ${playerHand.map(card => card.value + card.suit).join(' ')} (${calculateHand(playerHand)})`;
}

function resetBlackjack() {
    createDeck();
    playerHand = [];
    dealerHand = [];
    hitBtn.style.display = 'none';
    standBtn.style.display = 'none';
    startBlackjackBtn.style.display = 'block';
    updateBlackjackDisplay();
}

function startBlackjackGame() {
    currentBet = parseInt(document.getElementById('blackjack-bet').value);
    if (currentBet > coins) {
        alert('Not enough Such Coins!');
        return;
    }
    if (currentBet < 1) {
        alert('Minimum bet is 1 Such Coin!');
        return;
    }
    
    updateCoins(coins - currentBet);
    
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop()];
    
    hitBtn.style.display = 'inline-block';
    standBtn.style.display = 'inline-block';
    startBlackjackBtn.style.display = 'none';
    
    updateBlackjackDisplay();
}

function hit() {
    playerHand.push(deck.pop());
    const playerScore = calculateHand(playerHand);
    updateBlackjackDisplay();
    
    if (playerScore > 21) {
        createFloatingText(event.pageX, event.pageY, `-${currentBet}`);
        alert('Much bust! Very sad!');
        resetBlackjack();
    }
}

function stand() {
    while (calculateHand(dealerHand) < 17) {
        dealerHand.push(deck.pop());
    }
    
    const playerScore = calculateHand(playerHand);
    const dealerScore = calculateHand(dealerHand);
    
    updateBlackjackDisplay();
    
    if (dealerScore > 21 || playerScore > dealerScore) {
        const winnings = currentBet * 2;
        updateCoins(coins + winnings);
        createFloatingText(event.pageX, event.pageY, `+${winnings}`);
        alert('Much win! Very skill!');
    } else if (playerScore === dealerScore) {
        updateCoins(coins + currentBet);
        alert('Such tie! Much push!');
    } else {
        createFloatingText(event.pageX, event.pageY, `-${currentBet}`);
        alert('Dealer wins! Many sad!');
    }
    
    resetBlackjack();
}

startBlackjackBtn.addEventListener('click', startBlackjackGame);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);

// Reset functionality
resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all progress? This will delete all your coins and hats!')) {
        gameState = {
            coins: 0,
            ownedHats: [],
            clickMultiplier: 1,
            equippedHat: null
        };
        coins = 0;
        coinCounter.textContent = '0';
        updateHatDisplay();
        saveGame(gameState);
        updateShopDisplay();
        alert('Game reset! All progress has been cleared.');
    }
});

// Account system
let currentUser = null;

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function saveUserData(username, password) {
    const hashedPassword = hashPassword(password);
    const userData = {
        username: username,
        password: hashedPassword,
        gameState: gameState
    };
    setCookie(`user_${username}`, JSON.stringify(userData), 365);
}

function getUserData(username) {
    const userData = getCookie(`user_${username}`);
    return userData ? JSON.parse(userData) : null;
}

function loginUser(username, password) {
    const userData = getUserData(username);
    if (!userData) {
        return false;
    }
    
    if (userData.password === hashPassword(password)) {
        currentUser = username;
        if (userData.gameState) {
            gameState = userData.gameState;
            coins = gameState.coins;
            coinCounter.textContent = coins;
            updateHatDisplay();
            updateShopDisplay();
        }
        return true;
    }
    return false;
}

// Update the existing saveGame function
const originalSaveGame = saveGame;
saveGame = function(state) {
    if (currentUser) {
        const userData = getUserData(currentUser);
        userData.gameState = state;
        setCookie(`user_${currentUser}`, JSON.stringify(userData), 365);
    } else {
        originalSaveGame(state);
    }
};

// Update the existing loadGame function
const originalLoadGame = loadGame;
loadGame = function() {
    if (currentUser) {
        const userData = getUserData(currentUser);
        return userData.gameState || {
            coins: 0,
            ownedHats: [],
            clickMultiplier: 1,
            equippedHat: null
        };
    }
    return originalLoadGame();
};

// Account UI elements
const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const closeLogin = document.getElementById('close-login');
const doLoginBtn = document.getElementById('do-login');
const doRegisterBtn = document.getElementById('do-register');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const accountStatus = document.getElementById('account-status');

loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

closeLogin.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

doLoginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (username && password) {
        if (loginUser(username, password)) {
            accountStatus.innerHTML = `Logged in as ${username} <button id="logout-btn" class="account-btn">Logout</button>`;
            loginModal.style.display = 'none';
            
            document.getElementById('logout-btn').addEventListener('click', () => {
                currentUser = null;
                accountStatus.innerHTML = 'Not logged in <button id="login-btn" class="account-btn">Login</button>';
                document.getElementById('login-btn').addEventListener('click', () => {
                    loginModal.style.display = 'block';
                });
                // Reset game state to anonymous state
                gameState = loadGame();
                coins = gameState.coins;
                coinCounter.textContent = coins;
                updateHatDisplay();
                updateShopDisplay();
            });
        } else {
            alert('Invalid username or password!');
        }
    }
});

doRegisterBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (username && password) {
        if (getUserData(username)) {
            alert('Username already exists!');
            return;
        }
        
        saveUserData(username, password);
        loginUser(username, password);
        accountStatus.innerHTML = `Logged in as ${username} <button id="logout-btn" class="account-btn">Logout</button>`;
        loginModal.style.display = 'none';
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            currentUser = null;
            accountStatus.innerHTML = 'Not logged in <button id="login-btn" class="account-btn">Login</button>';
            document.getElementById('login-btn').addEventListener('click', () => {
                loginModal.style.display = 'block';
            });
            // Reset game state to anonymous state
            gameState = loadGame();
            coins = gameState.coins;
            coinCounter.textContent = coins;
            updateHatDisplay();
            updateShopDisplay();
        });
    }
});

// When window loads, check for existing cookie-based game and convert it
window.addEventListener('load', () => {
    const anonymousGame = getCookie('dogeGame');
    if (anonymousGame && !currentUser) {
        try {
            gameState = JSON.parse(anonymousGame);
            coins = gameState.coins;
            coinCounter.textContent = coins;
            updateHatDisplay();
            updateShopDisplay();
        } catch (e) {
            console.error('Error loading anonymous game:', e);
        }
    }
});
