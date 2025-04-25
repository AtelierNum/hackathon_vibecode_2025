<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multiplayer Quiz Game</title>
    <script src="https://cdn.tailwindcss.com"></script> <link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"> <style>
        body {
            font-family: 'Inter', sans-serif; /* Set font family for the body */
        }
        .player-progress-bar {
            height: 16px; /* Set height of progress bar */
            background-color: #e5e7eb; /* Set background color of progress bar */
            margin-top: 4px; /* Set top margin of progress bar */
            border-radius: 0.5rem; /* Set border radius of progress bar */
            position: relative; /* Set position of progress bar */
            overflow: hidden; /* Hide overflowed content */
            width: 200px; /* Increased width of progress bar */
        }
        .progress-bar-fill {
            height: 100%; /* Set height of progress bar fill */
            background-color: #6b7280; /* Set background color of progress bar fill */
            width: 0; /* Initial width of progress bar fill */
            transition: width 0.5s ease; /* Smooth transition for width change */
            border-radius: 0.5rem; /* Set border radius of progress bar fill */
        }
        .player-name-container {
            display: flex; /* Use flexbox for layout */
            align-items: center; /* Align items vertically */
            margin-bottom: 8px; /* Set bottom margin of player name container */
        }
        .player-name {
            margin-right: 8px; /* Set right margin of player name */
            font-weight: 500; /* Set font weight of player name */
            color: #374151; /* Set text color of player name */
            width: 100px; /* Added a fixed width */
            text-align: left;
        }
        .points-display {
            margin-left: 10px; /* Set left margin of points display */
            font-weight: 600; /* Set font weight of points display */
            color: #374151; /* Set text color of points display */
        }
        .point {
            width: 1cm; /* Set width of point */
            height: 4px; /* Set height of point */
            background-color: #4CAF50; /* Set background color of point */
            margin-right: 2px; /* Set right margin of point */
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center"> <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl"> <h1 class="text-2xl font-semibold mb-6 text-gray-800 text-center">Multiplayer Quiz Game</h1> <div id="players-container" class="mb-6">
        </div>
        <div id="question-container" class="mb-6">
        </div>
        <div id="theme-selection" class="mb-6">
        </div>
        <button id="next-question-button" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full transition duration-300 ease-in-out">
            Next Question
        </button>
        <div id="message-box" class="mt-6 text-center text-gray-600 font-medium">
        </div>
    </div>
    <script>
        // --- Game Configuration ---
        // Configuration du jeu
        const players = [
            { name: "Player 1", points: 0, score: 0, progressBarWidth: 0, correctAnswers: 0 }, // Define player 1 object
            { name: "Player 2", points: 0, score: 0, progressBarWidth: 0, correctAnswers: 0 }, // Define player 2 object
        ];
        const themes = [
            { name: "General Knowledge", questions: [ // Define general knowledge theme
                { text: "What is the capital of France?", options: ["London", "Paris", "Berlin"], correctAnswer: "Paris" }, // Define question 1 for general knowledge
                { text: "What is the highest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest"], correctAnswer: "Mount Everest" }, // Define question 2 for general knowledge
            ] },
            {
                name: "Science", questions: [ // Define science theme
                    { text: "What is the chemical symbol for water?", options: ["Wo", "Wa", "H2O"], correctAnswer: "H2O" }, // Define question 1 for science
                    { text: "What is the speed of light in meters per second?", options: ["300,000,000", "200,000,000", "400,000,000"], correctAnswer: "300,000,000" }, // Define question 2 for science
                ]
            },
            {
                name: "History", questions: [ // Define history theme
                    { text: "In what year did World War II end?", options: ["1943", "1945", "1947"], correctAnswer: "1945" }, // Define question 1 for history
                    { text: "Who was the first president of the United States?", options: ["John Adams", "Thomas Jefferson", "George Washington"], correctAnswer: "George Washington" }, // Define question 2 for history
                ]
            },
            {
                name: "Mystery", questions: [ // Added Mystery Theme
                    { text: "What is the smallest planet in our solar system?", options: ["Mars", "Mercury", "Venus"], correctAnswer: "Mercury" },
                    { text: "What is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean"], correctAnswer: "Pacific Ocean" },
                ]
            },
        ];
        const pointsPerCorrectAnswer = 10; // Define points per correct answer
        const progressIncrement = 20; // Define progress increment
        const malusPoints = 10; // Increased malus points to 10
        const maxQuestionsPerTheme = 2; // Define maximum questions per theme
        const maxScore = 100; // Define maximum score
        // --- Game State ---
        // État du jeu
        let currentPlayerIndex = 0; // Index of the current player
        let currentTheme = null; // Current theme
        let currentQuestion = null; // Current question
        let answeredQuestions = []; // Array of answered questions
        let isGameOver = false; // Flag to indicate if the game is over
        let currentRound = 1; // Current round number
        // --- DOM Elements ---
        // Éléments du DOM
        const playersContainer = document.getElementById("players-container"); // Get the players container element
        const questionContainer = document.getElementById("question-container"); // Get the question container element
        const nextQuestionButton = document.getElementById("next-question-button"); // Get the next question button element
        const messageBox = document.getElementById("message-box"); // Get the message box element
        const themeSelectionDropdown = document.getElementById("theme-selection"); // Get the theme selection dropdown element
        // --- Helper Functions ---
        // Fonctions d'aide
        /**
         * Displays a message to the player.
         * @param {string} message - The message to display.
         */
        function showMessage(message) {
            messageBox.textContent = message; // Set the text content of the message box
        }
        /**
         * Creates the player display with name and progress bar.
         */
        function createPlayerDisplay() {
            playersContainer.innerHTML = ""; // Clear the players container
            players.forEach((player, index) => { // Loop through each player
                const playerContainer = document.createElement("div"); // Create a div for the player
                playerContainer.className = "player-name-container"; // Set the class name of the player container
                const playerNameElement = document.createElement("div"); // Create a div for the player name
                playerNameElement.className = "player-name"; // Set the class name of the player name element
                playerNameElement.textContent = player.name; // Set the text content of the player name element
                const progressBarContainer = document.createElement("div"); // Create a div for the progress bar
                progressBarContainer.className = "player-progress-bar"; // Set the class name of the progress bar container
                const progressBarFill = document.createElement("div"); // Create a div for the progress bar fill
                progressBarFill.className = "progress-bar-fill"; // Set the class name of the progress bar fill
                progressBarFill.style.width = `${player.progressBarWidth}%`; // Set the width of the progress bar fill
                progressBarContainer.appendChild(progressBarFill); // Append the progress bar fill to the progress bar container
                const pointsDisplay = document.createElement("div"); // Create a div for the points display
                pointsDisplay.className = "points-display"; // Set the class name of the points display
                pointsDisplay.textContent = `Score: ${player.score} / ${maxScore}`; // Set the text content of the points display
                playerContainer.appendChild(playerNameElement); // Append the player name element to the player container
                playerContainer.appendChild(progressBarContainer); // Append the progress bar container to the player container
                playerContainer.appendChild(pointsDisplay); // Append the points display to the player container
                playersContainer.appendChild(playerContainer); // Append the player container to the players container
            });
        }
        /**
         * Updates the progress bar for a player.
         * @param {number} playerIndex - The index of the player to update.
         */
        function updateProgressBar(playerIndex) {
            const player = players[playerIndex]; // Get the player object
            player.progressBarWidth += progressIncrement; // Increment the progress bar width
            if (player.progressBarWidth > 100) { // If the progress bar width is greater than 100
                player.progressBarWidth = 100; // Set the progress bar width to 100
            }
            const progressBarFill = playersContainer.children[playerIndex].querySelector(".progress-bar-fill"); // Get the progress bar fill element
            progressBarFill.style.width = `${player.progressBarWidth}%`; // Set the width of the progress bar fill
            // Update the displayed score as well
            const pointsDisplayElement = playersContainer.children[playerIndex].querySelector(".points-display");
            pointsDisplayElement.textContent = `Score: ${player.score} / ${maxScore}`;
        }
        /**
         * Selects a random question from the current theme.
         * @returns {object} - The selected question.
         */
        function selectQuestion() {
            const availableQuestions = currentTheme.questions.filter(question => !answeredQuestions.includes(question)); // Filter out answered questions
            if (availableQuestions.length === 0) { // If there are no available questions
                return null; // Return null
            }
            const randomIndex = Math.floor(Math.random() * availableQuestions.length); // Get a random index
            const selectedQuestion = availableQuestions[randomIndex]; // Get the random question
            answeredQuestions.push(selectedQuestion); // Add the question to the answered questions array
            return selectedQuestion; // Return the random question
        }

        const frenchTranslations = {
            "What is the capital of France?": "Quelle est la capitale de la France ?",
            "What is the highest mountain in the world?": "Quelle est la plus haute montagne du monde ?",
            "What is the chemical symbol for water?": "Quel est le symbole chimique de l'eau ?",
            "What is the speed of light in meters per second?": "Quelle est la vitesse de la lumière en mètres par seconde ?",
            "In what year did World War II end?": "En quelle année la Seconde Guerre mondiale a-t-elle pris fin ?",
            "Who was the first president of the United States?": "Qui était le premier président des États-Unis ?",
            "What is the smallest planet in our solar system?": "Quelle est la plus petite planète de notre système solaire ?",
            "What is the largest ocean on Earth?": "Quel est le plus grand océan de la Terre ?",
        };

        /**
        * Applies a malus to the question or answer.
        * @param {object} question - The question object.
        * @param {number} malusType - The type of malus (1: lose points, 2: foreign language, 3: reverse answers).
        * @returns {object} - The modified question object.
        */
        function applyMalus(question, malusType) {
            const modifiedQuestion = { ...question }; // Create a copy to avoid modifying original / Créer une copie pour éviter de modifier l'original
            switch (malusType) {
                case 1: // Lose Points / Perdre des points
                    players[currentPlayerIndex].score -= malusPoints; // Subtract malus points from player's score
                    if (players[currentPlayerIndex].score < 0) { // If player's score is less than 0
                         players[currentPlayerIndex].score = 0; // Prevent negative scores / Empêcher les scores négatifs
                    }
                    showMessage(`${players[currentPlayerIndex].name} loses ${malusPoints} points!`); // Show message
                    break;
                case 2: // Foreign Language (French) / Langue étrangère (français)
                    if (frenchTranslations[modifiedQuestion.text]) {
                        modifiedQuestion.text = frenchTranslations[modifiedQuestion.text];
                    }
                    showMessage(`${players[currentPlayerIndex].name} gets the question in French!`); // Show message
                    break;
                case 3: // Reverse Answers / Inverser les réponses
                    modifiedQuestion.options = modifiedQuestion.options.map(option => option.split("").reverse().join("")); // Reverse each option
                    showMessage(`${players[currentPlayerIndex].name} sees reversed answers!`); // Show message
                    break;
            }
            return modifiedQuestion; // Return the modified question
        }
        /**
         * Displays the current question and its options.
         */
        function displayQuestion() {
            questionContainer.innerHTML = ""; // Clear the question container
            if (!currentQuestion) { // If there is no current question
                if (isGameOver) { // If the game is over
                    return; // Return
                }
                currentQuestion = selectQuestion(); // Select a question
                if (!currentQuestion) { // If there is no question
                    handleEndOfTheme(); // Handle the end of the theme
                    return; // Return
                }
            }

             let displayedQuestion = currentQuestion; // Start with the original / Commencer avec l'original

            if (players[currentPlayerIndex].malus) { // If the current player has a malus
                const malusType = Math.floor(Math.random() * 3) + 1; // Randomly choose a malus type (1, 2, or 3) / Choisir aléatoirement un type de malus (1, 2 ou 3)
                displayedQuestion = applyMalus(currentQuestion, malusType); // Apply the malus / Appliquer le malus
                players[currentPlayerIndex].malus = false; // Reset the malus flag / Réinitialiser le drapeau du malus
            }


            const questionText = document.createElement("h2"); // Create a heading for the question text
            questionText.className = "text-xl font-semibold mb-4 text-gray-700"; // Set the class name of the question text
            questionText.textContent = displayedQuestion.text; // Use the modified question / Utiliser la question modifiée

            const optionsContainer = document.createElement("div"); // Create a div for the options
            optionsContainer.className = "space-y-3";
            const displayOptions = displayedQuestion.options;

            displayOptions.forEach((option, index) => { // Loop through each option
                const optionButton = document.createElement("button"); // Create a button for the option
                optionButton.className = "bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md w-full text-left transition duration-300 ease-in-out"; // Set the class name of the option button
                optionButton.textContent = option; // Set the text content of the option button
                optionButton.dataset.option = option; // Set the data-option attribute of the option button
                optionButton.addEventListener("click", () => handleAnswer(option)); // Add a click event listener to the option button
                optionsContainer.appendChild(optionButton); // Append the option button to the options container
            });
            questionContainer.appendChild(questionText); // Append the question text to the question container
            questionContainer.appendChild(optionsContainer); // Append the options container to the question container
            nextQuestionButton.style.display = "none"; // Hide the next question button
        }
        /**
         * Handles the player's answer.
         * @param {string} selectedOption - The option selected by the player.
         */
        function handleAnswer(selectedOption) {
            if (isGameOver) // If the game is over
                return; // Return
            if (currentQuestion) { // If there is a current question
                if (selectedOption === currentQuestion.correctAnswer) { // If the selected option is correct
                    showMessage(`Correct! ${players[currentPlayerIndex].name} gains ${pointsPerCorrectAnswer} points.`); // Show a correct message
                    players[currentPlayerIndex].points += pointsPerCorrectAnswer; // Add points to the player's points
                    players[currentPlayerIndex].score += pointsPerCorrectAnswer; // Add points to the player's score
                    players[currentPlayerIndex].correctAnswers++; // Increment the player's correct answers
                    updateProgressBar(currentPlayerIndex); // Update the progress bar
                    if (currentTheme.name === "Mystery") {
                        const opponentIndex = (currentPlayerIndex + 1) % players.length;
                        showMessage(`Correct! ${players[currentPlayerIndex].name} gains ${pointsPerCorrectAnswer} points.  ${players[opponentIndex].name} suffers a malus!`);
                        players[opponentIndex].malus = true;
                    }
                    if (players[currentPlayerIndex].score >= maxScore) { // If the player's score is greater than or equal to the maximum score
                        isGameOver = true; // Set the game over flag to true
                        declareWinner(currentPlayerIndex); // Declare the winner
                        return; // Return
                    }
                } else { // If the selected option is incorrect
                    showMessage(`Incorrect! The correct answer was ${currentQuestion.correctAnswer}.`); // Show an incorrect message
                }
                currentQuestion = null; // Reset the current question
                nextQuestionButton.style.display = "block"; // Show the next question button
            }
        }
        /**
         * Handles the end of a theme.
         */
        function handleEndOfTheme() {
            showMessage(`End of ${currentTheme.name} theme.`); // Show the end of theme message
            answeredQuestions = []; // Reset the answered questions array
            currentTheme = null; // Reset the current theme
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Switch to the next player
            if (currentRound < 2) { // If the current round is less than 2
                currentRound++; // Increment the current round
                displayThemeSelection(); // Display the theme selection
            } else { // If the current round is not less than 2
                isGameOver = true; // Set the game over flag to true
                declareWinner(); // Declare the winner
            }
        }
        /**
         * Declares the winner of the game.
         */
        function declareWinner() {
            let winnerIndex = -1;
            let maxScoreReached = -1;
             for (let i = 0; i < players.length; i++) {
                if (players[i].score >= maxScore && players[i].score > maxScoreReached) {
                    maxScoreReached = players[i].score;
                    winnerIndex = i;
                }
            }
            if (winnerIndex !== -1) {
                showMessage(`Game Over! ${players[winnerIndex].name} wins with ${players[winnerIndex].score} points!`); // Show the winner message
            } else {
                showMessage("Game Over! No winner was determined!");
            }
            questionContainer.innerHTML = ""; // Clear the question container
            nextQuestionButton.style.display = "none"; // Hide the next question button
            themeSelectionDropdown.innerHTML = ""; // Clear the theme selection dropdown
        }
        /**
         * Displays the theme selection dropdown.
         */
        function displayThemeSelection() {
            questionContainer.innerHTML = ""; // Clear the question container
            nextQuestionButton.style.display = "none"; // Hide the next question button
            themeSelectionDropdown.innerHTML = ""; // Clear the theme selection dropdown
            const selectLabel = document.createElement("label"); // Create a label for the theme selection
            selectLabel.textContent = `${players[currentPlayerIndex].name}, choose a theme:`; // Set the text content of the label
            selectLabel.className = "block text-gray-700 text-sm font-bold mb-2"; // Set the class name of the label
            selectLabel.setAttribute("for", "theme-select"); // Set the for attribute of the label
            const selectElement = document.createElement("select"); // Create a select element for the theme selection
            selectElement.id = "theme-select"; // Set the id of the select element
            selectElement.className = "shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"; // Set the class name of the select element
            themes.forEach((theme, index) => { // Loop through each theme
                const option = document.createElement("option"); // Create an option element for the theme
                option.value = index; // Set the value of the option element
                option.textContent = theme.name; // Set the text content of the option element
                selectElement.appendChild(option); // Append the option element to the select element
            });
            const chooseButton = document.createElement("button"); // Create a button to choose the theme
            chooseButton.textContent = "Choose Theme"; // Set the text content of the button
            chooseButton.className = "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"; // Set the class name of the button
            chooseButton.addEventListener("click", () => { // Add a click event listener to the button
                const selectedIndex = parseInt(selectElement.value); // Get the selected theme index
                currentTheme = themes[selectedIndex]; // Set the current theme
                themeSelectionDropdown.innerHTML = ""; // Clear the theme selection dropdown
                showMessage(`You chose the ${currentTheme.name} theme.`); // Show the selected theme message
                displayQuestion(); // Display the question
            });
            themeSelectionDropdown.appendChild(selectLabel); // Append the label to the theme selection dropdown
            themeSelectionDropdown.appendChild(selectElement); // Append the select element to the theme selection dropdown
            themeSelectionDropdown.appendChild(chooseButton); // Append the button to the theme selection dropdown
        }
        // --- Event Listeners ---
        // Gestionnaires d'événements
        nextQuestionButton.addEventListener("click", () => { // Add a click event listener to the next question button
            if (!currentQuestion) { // If there is no current question
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Switch to the next player
                players.forEach(player => player.malus = false);
                if (players[currentPlayerIndex].malus) {
                    // If the player has a malus, display the malus question directly
                    const malusType = Math.floor(Math.random() * 3) + 1; // Choose a malus type
                    currentQuestion = {
                        text: malusType === 2 ? "Quelle est la capitale de la France ?" : "What is the capital of France?".split("").reverse().join(""),
                        options: malusType === 2 ? ["Londres", "Paris", "Berlin"] : ["nondoL", "siraP", "nireB"],
                        correctAnswer: malusType === 2 ? "Paris" : "siraP"
                    };
                    displayQuestion();
                }
                else {
                    displayThemeSelection(); // Display the theme selection
                }
            } else { // If there is a current question
                displayQuestion(); // Display the question
            }
        });
        // --- Initial Setup ---
        // Configuration initiale
        createPlayerDisplay(); // Create the player display
        displayThemeSelection(); // Display the theme selection
    </script>
</body>
</html>
