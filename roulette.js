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
        this.betHistory = [];
        this.houseProfit = 0;
        this.redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    }

    placeBet(input) {
        const parts = input.split(' ');
        const name = parts[0];
        let betType = parts[2].toLowerCase();
        const betAmount = parseInt(parts[1], 10);

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
        const losers = [];
        this.bets.forEach(bet => {
            const { name, betType, numbers, betAmount } = bet;
            let winnings = 0;
            let houseLoss = 0;
            if (betType === "numbers" && numbers.includes(winningNumber)) {
                winnings = betAmount * (this.getPayoutRatio(numbers.length) + 1);
                houseLoss = betAmount - winnings;
                winners.push({ name, winnings, betType, houseLoss });
            }
              else if (["0","00"].includes(betType) && this.checkWinningBetType(betType, winningNumber)) {
                winnings = betAmount * 36; // 0 or 00
                houseLoss = betAmount - winnings;
                console.log(houseLoss);
                winners.push({ name, winnings, betType ,houseLoss});
            } else if (["first", "second", "third"].includes(betType) && this.checkWinningBetType(betType, winningNumber)) {
                winnings = betAmount * 3; // 2:1 payout for 1st, 2nd, 3rd
                houseLoss = betAmount - winnings;
                console.log(houseLoss);
                winners.push({ name, winnings, betType ,houseLoss});
            } else if (this.checkWinningBetType(betType, winningNumber)) {
                winnings = betAmount * 2; // Even/Odd, Red/Black
                houseLoss = betAmount - winnings;
                console.log(houseLoss);
                winners.push({ name, winnings, betType ,houseLoss });
            }
            else{
                let losings = betAmount;
                winnings = 0;
                losers.push({ name, losings, betType });
            }
            totalPayout += winnings;
        });

        this.houseProfit += (this.totalBetAmount() - totalPayout);
        this.bets = [];
        
        this.updateWinningBetsDisplay(winners,losers);
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
            case 3: return 11;
            case 4: return 8;
            default: return 0;
        }
    }

    totalBetAmount() {
        return this.bets.reduce((acc, bet) => acc + bet.betAmount, 0);
    }

    removeBetByIndex(index) {
        this.bets.splice(index, 1);
        roulette.updateCurrentBetsDisplay();
    }

    updateCurrentBetsDisplay() {
        const display = document.getElementById('currentBets');
        
        if (this.bets.length === 0) {
            display.textContent = "No Current Bets";
            return;
        }
        display.innerHTML = this.bets.map((bet, index) => {
            if (bet.betType === "numbers") {
                return `<div>${bet.name}: ${bet.numbers.join(', ')} - $${bet.betAmount} 
                            <i class="fa fa-close" style="color:indianred;" onclick="roulette.removeBetByIndex(${index})"></i>
                        </div>`;
            } else {
                let displayBetType = bet.betType;
                if (displayBetType === "0") displayBetType = "37 (0)";
                if (displayBetType === "00") displayBetType = "38 (00)";
                return `<div>${bet.name}: ${displayBetType} - $${bet.betAmount}
                            <i class="fa fa-close" style="color:indianred;" onclick="roulette.removeBetByIndex(${index})"></i>
                        </div>`;
            }
        }).join('<br>');

    
    }

    updateWinningBetsDisplay(winners,losers) {
        const display = document.getElementById('winningBets');
        const currentRound = this.betHistory.length + 1;
        let roundHistory = `---Round ${currentRound}---\n`;
        if (winners.length === 0) {
            display.textContent = "No Winning Bets";
        }
        else{
            display.innerHTML = winners.map(winner => `${winner.name} wins $${winner.winnings} on ${winner.betType}`).join('<br>');
            winners.forEach(winner => {
                roundHistory += `[Win] ${winner.name} wins $${Math.abs(winner.houseLoss)} on ${winner.betType}\n`;
            });
        }
        losers.forEach(loser=> {
            roundHistory += `[Loss] ${loser.name} lost $${loser.losings} on ${loser.betType}\n`;
        });
        roundHistory += `[House Profit]: $${this.houseProfit}\n`;
        this.betHistory.push(roundHistory);

        // Update the bet history text display
        const betHistoryText = document.getElementById('betHistoryText');
        betHistoryText.innerHTML = this.betHistory.map(entry => {
        // Split entry into lines and process each line for color
        return entry.split('\n').map(line => {
            if (line.includes('[Win]')) {
                return `<span style="color: red;">${line}</span>`;
            } else if (line.includes('[Loss]')) {
                return `<span style="color: green;">${line}</span>`;
            } else if (line.includes('[House Profit]:') && this.houseProfit < 0) { 
                return `<span style="color: red;">${line}</span>`;
            } else {
                // Default color for other lines like round headers
                return line;
            }
        }).join('<br>');
    }).join('<br><br>');// Join with empty string, as <br> already provides line break

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

function showBetHistory() {
    const betHistoryDisplay = document.getElementById('betHistory');
    const exportCsvButton = document.getElementById('exportCsvButton');
    const saveTextButton = document.getElementById('saveTextButton');
    const isDisplayed = betHistoryDisplay.style.display === 'block';

    betHistoryDisplay.style.display = isDisplayed ? 'none' : 'block';
    exportCsvButton.style.display = isDisplayed ? 'none' : 'block'; // Toggle CSV button visibility
    saveTextButton.style.display = isDisplayed ? 'none' : 'block'; // Toggle Text button visibility
    
}

function exportBetHistoryToCsv() {
    const betHistoryText = document.getElementById('betHistoryText').innerText;
    let roundCounter = 0;
    let csvRows = ['Round,Result,Player,Amount,Bet Type'];
    let houseProfitForRound = 0; // This will capture the house profit for the last round

    betHistoryText.split('\n').forEach(line => {
        if (line.startsWith('---Round')) {
            // Increment round counter when a new round starts
            roundCounter++;
        } else if (line.includes('[Win]') || line.includes('[Loss]')) {
            const entryType = line.includes('[Win]') ? 'Win' : 'Loss';
            const parts = line.match(/\[.*?\] (\w+) (wins|lost) \$(\d+) on (\w+)/);
            const player = parts[1];
            let amount = parseInt(parts[3], 10);
            // If it's a loss, make the amount negative
            const betType = parts[4];

            csvRows.push(`${roundCounter},${entryType},${player},${amount},${betType}`);
        } else if (line.includes('[House Profit]:')) {
            const parts = line.match(/\[House Profit\]: \$(\-?\d+)/);
            houseProfitForRound = parseInt(parts[1], 10);
        }
    });

    // Add the house profit entry only for the last round
    let finalProfitEntryType = houseProfitForRound >= 0 ? 'Win' : 'Loss';
    let finalProfitAmount = houseProfitForRound;
    csvRows.push(`${roundCounter},${finalProfitEntryType},House,${finalProfitAmount},profit`);

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `rouletteSession_${getFormattedDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveBetHistoryAsText() {
    const betHistoryText = document.getElementById('betHistoryText').innerText;
    const blob = new Blob([betHistoryText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `betHistory_${getFormattedDate()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getFormattedDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${month}-${day}_${hour}:${minute}`;
}