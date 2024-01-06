document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('betInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            placeBet();
        }
    });

    document.getElementById('winInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            calculateWinnings();
        }
    });
});

class RouletteBetting {
    constructor() {
        this.bets = [];
        this.houseProfit = 0;
        this.redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    }

    placeBet(input) {
        const parts = input.split(' ');
        const name = parts[0];
        let betType = parts[1].toLowerCase();
        const betAmount = parseInt(parts[2], 10);

        // Convert 37 to '0' and 38 to '00' for betting
        if (betType === "37") betType = "0";
        if (betType === "38") betType = "00";

        if (["even", "odd", "first", "second", "third", "red", "black", "0", "00"].includes(betType)) {
            this.bets.push({ name, betType, betAmount });
        } else {
            const numbers = betType.split(',').map(num => parseInt(num, 10));
            this.bets.push({ name, betType: "numbers", numbers, betAmount });
        }

        this.updateCurrentBetsDisplay();
    }

    calculateWinnings(inputWinningNumber) {
        let winningNumber = inputWinningNumber.trim();
        // Convert 37 to '0' and 38 to '00' for winning number
        if (winningNumber === "37") winningNumber = "0";
        if (winningNumber === "38") winningNumber = "00";

        winningNumber = winningNumber === "0" || winningNumber === "00" ? winningNumber : parseInt(winningNumber, 10);

        let totalPayout = 0;
        const winners = [];

        this.bets.forEach(bet => {
            const { name, betType, numbers, betAmount } = bet;

            if (betType === "numbers" && numbers.includes(winningNumber)) {
                const winnings = betAmount * (this.getPayoutRatio(numbers.length) + 1);
                winners.push({ name, winnings, betType: "numbers" });
                totalPayout += winnings;
            } else if (["first", "second", "third"].includes(betType) && this.checkWinningBetType(betType, winningNumber)) {
                const winnings = betAmount * 3; // 2:1 payout for 1st, 2nd, 3rd
                winners.push({ name, winnings, betType: betType });
                totalPayout += winnings;
            } else if (this.checkWinningBetType(betType, winningNumber)) {
                const winnings = betAmount * 2; // Even/Odd, Red/Black
                winners.push({ name, winnings, betType: betType });
                totalPayout += winnings;
            }
        });

        this.houseProfit += (this.totalBetAmount() - totalPayout);
        this.bets = [];
        this.updateWinningBetsDisplay(winners);
        this.updateHouseProfitDisplay();
        this.updateCurrentBetsDisplay();
    }

    checkWinningBetType(betType, winningNumber) {
        switch (betType) {
            case "even": return typeof winningNumber === 'number' && winningNumber % 2 === 0;
            case "odd": return typeof winningNumber === 'number' && winningNumber % 2 === 1;
            case "first": return winningNumber >= 1 && winningNumber <= 12;
            case "second": return winningNumber >= 13 && winningNumber <= 24;
            case "third": return winningNumber >= 25 && winningNumber <= 36;
            case "red": return this.redNumbers.has(winningNumber);
            case "black": return !this.redNumbers.has(winningNumber) && typeof winningNumber === 'number';
            case "0": return winningNumber === "0";
            case "00": return winningNumber === "00";
            default: return false;
        }
    }

    getPayoutRatio(numNumbers) {
        switch(numNumbers) {
            case 1: return 35;
            case 2: return 17;
            case 3: return 8;
            case 4: return 3;
            default: return 0;
        }
    }

    totalBetAmount() {
        return this.bets.reduce((acc, bet) => acc + bet.betAmount, 0);
    }

    updateCurrentBetsDisplay() {
        const display = document.getElementById('currentBets');
        display.innerHTML = this.bets.map(bet => {
            if (bet.betType === "numbers") {
                return `${bet.name}: ${bet.numbers.join(', ')} - $${bet.betAmount}`;
            } else {
                let displayBetType = bet.betType;
                if (displayBetType === "0") displayBetType = "37 (0)";
                if (displayBetType === "00") displayBetType = "38 (00)";
                return `${bet.name}: ${displayBetType} - $${bet.betAmount}`;
            }
        }).join('<br>');
    }

    updateWinningBetsDisplay(winners) {
        const display = document.getElementById('winningBets');
        display.innerHTML = winners.map(winner => `${winner.name} wins $${winner.winnings} on ${winner.betType}`).join('<br>');
    }

    updateHouseProfitDisplay() {
        const display = document.getElementById('houseProfit');
        display.textContent = this.houseProfit;
    }
}

const roulette = new RouletteBetting();

function placeBet() {
    const betInputValue = document.getElementById('betInput').value;
    roulette.placeBet(betInputValue);
    document.getElementById('betInput').value = ''; // Clear input field
}

function calculateWinnings() {
    const winningNumber = document.getElementById('winInput').value;
    roulette.calculateWinnings(winningNumber);
    document.getElementById('winInput').value = ''; // Clear input field
}

function clearBets() {
    roulette.bets = [];
    roulette.updateCurrentBetsDisplay();
}