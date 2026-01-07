// 병원 수익 단계별 진단 설문 로직

let currentQuestion = 0;
let answers = new Array(revenueQuestions.length).fill(null);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 세션 스토리지에서 병원 정보 가져오기
    const clinicName = sessionStorage.getItem('clinicName');
    const directorName = sessionStorage.getItem('directorName');

    if (!clinicName || !directorName) {
        alert('병원 정보가 없습니다. 처음부터 다시 시작해 주세요.');
        window.location.href = '1.index-revenue.html';
        return;
    }

    // 병원 정보 표시
    document.getElementById('clinicInfo').textContent = `${clinicName} | ${directorName} 원장님`;

    // 첫 번째 질문 표시
    displayQuestion(0);
});

// 질문 표시 함수
function displayQuestion(index) {
    const question = revenueQuestions[index];

    // 질문 번호와 카테고리
    document.getElementById('questionNumber').innerHTML =
        `<strong>Q${question.id}</strong> | ${question.category}`;

    // 질문 텍스트
    document.getElementById('questionText').textContent = question.question;

    // 선택지 표시
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.setAttribute('data-type', option.type);
        optionDiv.innerHTML = `
            <div class="option-badge">${option.type}</div>
            <div>${option.text}</div>
        `;

        // 이미 선택된 답변이 있으면 표시
        if (answers[index]) {
            const [primary, secondary] = answers[index].split('');

            if (option.type === primary) {
                optionDiv.classList.add('selected-primary');
                optionDiv.querySelector('.option-badge').textContent = '○';
            } else if (option.type === secondary) {
                optionDiv.classList.add('selected-secondary');
                optionDiv.querySelector('.option-badge').textContent = '△';
            }
        }

        // 클릭 이벤트
        optionDiv.addEventListener('click', function() {
            selectOption(index, option.type);
        });

        optionsContainer.appendChild(optionDiv);
    });

    // 진행률 업데이트
    updateProgress();

    // 버튼 상태 업데이트
    updateButtons();
}

// 선택지 선택 함수
function selectOption(questionIndex, type) {
    const currentAnswer = answers[questionIndex];
    const options = document.querySelectorAll('.option');
    const clickedOption = document.querySelector(`[data-type="${type}"]`);

    // 이미 1순위로 선택된 경우 - 선택 해제
    if (currentAnswer && currentAnswer[0] === type) {
        answers[questionIndex] = currentAnswer[1] ? currentAnswer[1] : null;
        clickedOption.classList.remove('selected-primary');
        clickedOption.querySelector('.option-badge').textContent = type;

        // 2순위가 있었다면 1순위로 승격
        if (currentAnswer[1]) {
            const secondOption = document.querySelector(`[data-type="${currentAnswer[1]}"]`);
            secondOption.classList.remove('selected-secondary');
            secondOption.classList.add('selected-primary');
            secondOption.querySelector('.option-badge').textContent = '○';
            answers[questionIndex] = currentAnswer[1];
        }
    }
    // 이미 2순위로 선택된 경우 - 선택 해제
    else if (currentAnswer && currentAnswer.length === 2 && currentAnswer[1] === type) {
        answers[questionIndex] = currentAnswer[0];
        clickedOption.classList.remove('selected-secondary');
        clickedOption.querySelector('.option-badge').textContent = type;
    }
    // 새로운 선택
    else {
        if (!currentAnswer) {
            // 첫 번째 선택 (1순위)
            answers[questionIndex] = type;
            clickedOption.classList.add('selected-primary');
            clickedOption.querySelector('.option-badge').textContent = '○';
        } else if (currentAnswer.length === 1) {
            // 두 번째 선택 (2순위)
            answers[questionIndex] = currentAnswer + type;
            clickedOption.classList.add('selected-secondary');
            clickedOption.querySelector('.option-badge').textContent = '△';
        } else {
            // 이미 2개가 선택된 경우 - 기존 2순위를 새로운 2순위로 교체
            const oldSecondary = document.querySelector(`[data-type="${currentAnswer[1]}"]`);
            oldSecondary.classList.remove('selected-secondary');
            oldSecondary.querySelector('.option-badge').textContent = currentAnswer[1];

            answers[questionIndex] = currentAnswer[0] + type;
            clickedOption.classList.add('selected-secondary');
            clickedOption.querySelector('.option-badge').textContent = '△';
        }
    }

    updateButtons();
    updateProgress();
}

// 진행률 업데이트
function updateProgress() {
    const answeredCount = answers.filter(a => a && a.length === 2).length;
    const percentage = Math.round((answeredCount / revenueQuestions.length) * 100);

    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent =
        `진행률: ${answeredCount}/${revenueQuestions.length} (${percentage}%)`;
}

// 버튼 상태 업데이트
function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // 이전 버튼
    if (currentQuestion === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // 현재 질문에 2개 답변이 완료되었는지 확인
    const hasAnswer = answers[currentQuestion] && answers[currentQuestion].length === 2;

    // 마지막 질문인지 확인
    if (currentQuestion === revenueQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        submitBtn.disabled = !hasAnswer;
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        nextBtn.disabled = !hasAnswer;
    }
}

// 다음 질문
function nextQuestion() {
    if (currentQuestion < revenueQuestions.length - 1) {
        currentQuestion++;
        displayQuestion(currentQuestion);

        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 이전 질문
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion(currentQuestion);

        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 설문 제출
function submitSurvey() {
    // 모든 질문에 2개씩 답변했는지 확인
    const unansweredCount = answers.filter(a => !a || a.length !== 2).length;

    if (unansweredCount > 0) {
        alert(`아직 ${unansweredCount}개의 질문에 답변하지 않았습니다. 각 질문마다 2개를 선택해 주세요.`);
        return;
    }

    // 답변을 세션 스토리지에 저장
    sessionStorage.setItem('revenueAnswers', JSON.stringify(answers));

    // 진단 일자 저장
    const today = new Date();
    const diagnosisDate = today.getFullYear() + '년 ' +
                          (today.getMonth() + 1) + '월 ' +
                          today.getDate() + '일';
    sessionStorage.setItem('revenueDiagnosisDate', diagnosisDate);

    // 결과 페이지로 이동
    window.location.href = '1.result-revenue.html';
}
