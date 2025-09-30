import { checkAnswers } from "./checkAnswers.js";

let questions = [];

// Ładowanie lokalnego pliku JSON
fetch('https://github.com/Kiszkah/zawodowyinfopgf08/raw/refs/heads/master/output.json')
  .then(response => response.json())
  .then(data => {
    // losuj 40 pytań
    questions = getRandomItemsFromArray(data, 40);

    console.log("[INFO] Załadowano pytania:", questions.length);
    const quizContainer = document.getElementById('quiz-container');

    questions.forEach((question, index) => {
      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.dataset.questionIndex = index;

      // Numer pytania
      const questionNumber = document.createElement('h3');
      questionNumber.innerText = `Pytanie ${index + 1}:`;
      questionElement.appendChild(questionNumber);

      // Tekst pytania
      const questionText = document.createElement('p');
      questionText.innerText = question.question;
      questionText.classList.add('question-text');
      questionElement.appendChild(questionText);

      // Wstawienie tabeli odpowiedzi
      if (question.answers_table) {
        const tableWrapper = document.createElement('div');
        tableWrapper.innerHTML = question.answers_table;

        // Odblokuj inputy (oryginalnie są disabled w HTML)
        const inputs = tableWrapper.querySelectorAll("input[type='radio']");
        inputs.forEach((input, ansIndex) => {
          input.disabled = false;
          input.type = "checkbox"; // zmieniamy na checkboxy
          input.dataset.index = ansIndex;
          input.dataset.qIndex = questionElement.dataset.questionIndex;

          // tylko jedna odpowiedź na pytanie
          input.addEventListener('click', cbox => {
            const box = cbox.target;
            const questionIndex = box.dataset.qIndex;
            const answerIndex = box.dataset.index;

            const allQuestions = document.querySelectorAll(`[data-question-index]`);
            allQuestions.forEach(qEl => {
              if (qEl.dataset.questionIndex === questionIndex) {
                const answers = qEl.querySelectorAll('input');
                answers.forEach(answer => {
                  if (answer.dataset.index !== answerIndex) {
                    answer.checked = false;
                  }
                });
              }
            });
          });
        });

        questionElement.appendChild(tableWrapper);
      }

      // dodatkowa zawartość (np. obrazki)
      if (question.additional_content && question.additional_content.length > 0) {
        question.additional_content.forEach(extraHTML => {
          const div = document.createElement('div');
          div.innerHTML = extraHTML;
          questionElement.appendChild(div);
        });
      }

      quizContainer.appendChild(questionElement);
    });

    // przycisk sprawdzania wyników
    const checkAnswersButton = document.createElement('button');
    checkAnswersButton.innerText = 'Sprawdź wynik';
    checkAnswersButton.onclick = checkAnswers;
    checkAnswersButton.classList.add('check-answers');
    quizContainer.appendChild(checkAnswersButton);
  });

function getRandomItemsFromArray(arr, numItems) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, numItems);
}

export { questions };
