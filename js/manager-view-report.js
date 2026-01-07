// 매니저 대시보드에서 선택한 진단 결과를 통합 표시

document.addEventListener('DOMContentLoaded', function() {
    // sessionStorage에서 선택한 진단 데이터 가져오기
    const selectedDiagnosisJSON = sessionStorage.getItem('selectedDiagnosis');

    if (!selectedDiagnosisJSON) {
        alert('진단 데이터가 없습니다. 대시보드로 돌아갑니다.');
        window.location.href = 'manager-dashboard.html';
        return;
    }

    const data = JSON.parse(selectedDiagnosisJSON);

    // 병원 정보 표시
    displayHospitalInfo(data);

    // 이메일 요청 정보 표시
    displayEmailRequests(data);

    // 1번 진단 결과 표시
    if (data.diagnosis1) {
        displayDiagnosis1(data);
    } else {
        document.getElementById('diagnosis1Section').innerHTML = `
            <div style="background: #f9fafb; padding: 40px; text-align: center; color: #6b7280; border-radius: 12px;">
                💰 1번 진단(병원 수익 단계별 진단)이 완료되지 않았습니다.
            </div>
        `;
    }

    // 2번 진단 결과 표시
    if (data.diagnosis2) {
        console.log('=== 2번 진단 데이터 확인 ===');
        console.log('data.diagnosis2:', data.diagnosis2);
        console.log('essayAnswers:', data.diagnosis2.essayAnswers);

        // 강제로 메시지 표시 (디버깅용)
        const feedbackContent = document.getElementById('customFeedbackContent');
        const essayContent = document.getElementById('essayAnswersContent');

        if (feedbackContent) {
            feedbackContent.innerHTML = '<div style="background: #d1fae5; padding: 20px; border-radius: 8px; color: #065f46;">🟢 DOMContentLoaded에서 데이터 확인됨!<br><br>essayAnswers: ' + (data.diagnosis2.essayAnswers ? '있음 (' + data.diagnosis2.essayAnswers.length + '개)' : '없음') + '</div>';
        }

        if (essayContent) {
            essayContent.innerHTML = '<div style="background: #d1fae5; padding: 20px; border-radius: 8px; color: #065f46;">🟢 주관식 답변 섹션 확인됨!</div>';
        }

        displayDiagnosis2(data);
    } else {
        document.getElementById('diagnosis2Section').innerHTML = `
            <div style="background: #f9fafb; padding: 40px; text-align: center; color: #6b7280; border-radius: 12px;">
                🏥 2번 진단(원장 스타일 진단)이 완료되지 않았습니다.
            </div>
        `;
    }
});

// 병원 정보 표시
function displayHospitalInfo(data) {
    let clinicNameNoSpace = data.clinicName.replace(/\s+/g, '');
    document.getElementById('hospitalInfo').textContent = `${clinicNameNoSpace} ${data.directorName} 원장`;

    let detailParts = [];
    if (data.region) detailParts.push(data.region);
    if (data.doctorCount && data.nurseCount) {
        let staffInfo = `의사 ${data.doctorCount}명, 간호사 ${data.nurseCount}명`;
        if (data.counselorCount) staffInfo += `, 상담사 ${data.counselorCount}명`;
        detailParts.push(staffInfo);
    }
    if (detailParts.length > 0) {
        document.getElementById('hospitalDetail').textContent = detailParts.join(' | ');
    }

    if (data.date) {
        document.getElementById('diagnosisDate').textContent = '진단 일자: ' + data.date;
    }
}

// 이메일 요청 정보 표시
function displayEmailRequests(data) {
    const emailRequests = data.emailRequests;

    // 이메일 요청이 없으면 섹션 숨김
    if (!emailRequests || (!emailRequests.diagnosis1 && !emailRequests.diagnosis2)) {
        document.getElementById('emailRequestsSection').style.display = 'none';
        return;
    }

    // 이메일 요청이 있으면 표시
    document.getElementById('emailRequestsSection').style.display = 'block';

    let content = '';

    // 1번 진단 이메일 요청
    if (emailRequests.diagnosis1) {
        const req1 = emailRequests.diagnosis1;
        const requestDate = new Date(req1.requestDate);
        const formattedDate = requestDate.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        content += `
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                <h4 style="color: #2563eb; font-size: 1.1rem; margin-bottom: 12px;">💰 1번 진단 이메일 요청</h4>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; font-size: 0.95rem;">
                    <div style="color: #6b7280; font-weight: 600;">요청 일시:</div>
                    <div style="color: #1f2937;">${formattedDate}</div>

                    <div style="color: #6b7280; font-weight: 600;">이메일:</div>
                    <div style="color: #1f2937;">${req1.email}</div>

                    <div style="color: #6b7280; font-weight: 600;">휴대폰:</div>
                    <div style="color: #1f2937;">${req1.phone}</div>

                    ${req1.message ? `
                        <div style="color: #6b7280; font-weight: 600;">추가 요청:</div>
                        <div style="color: #1f2937; line-height: 1.6;">${req1.message}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 2번 진단 이메일 요청
    if (emailRequests.diagnosis2) {
        const req2 = emailRequests.diagnosis2;
        const requestDate = new Date(req2.requestDate);
        const formattedDate = requestDate.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        content += `
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                <h4 style="color: #8b5cf6; font-size: 1.1rem; margin-bottom: 12px;">🏥 2번 진단 이메일 요청</h4>
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; font-size: 0.95rem;">
                    <div style="color: #6b7280; font-weight: 600;">요청 일시:</div>
                    <div style="color: #1f2937;">${formattedDate}</div>

                    <div style="color: #6b7280; font-weight: 600;">이메일:</div>
                    <div style="color: #1f2937;">${req2.email}</div>

                    <div style="color: #6b7280; font-weight: 600;">휴대폰:</div>
                    <div style="color: #1f2937;">${req2.phone}</div>

                    ${req2.message ? `
                        <div style="color: #6b7280; font-weight: 600;">추가 요청:</div>
                        <div style="color: #1f2937; line-height: 1.6;">${req2.message}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    document.getElementById('emailRequestsContent').innerHTML = content;
}

// 1번 진단 결과 표시
function displayDiagnosis1(data) {
    const diagnosis1 = data.diagnosis1;
    const result = analyzeRevenueAnswers(diagnosis1.answers, diagnosis1.scores);

    // 개요
    displayRevenueSummary(result.analysis, data.directorName);

    // 레이더 차트
    displayRevenueRadarChart(result);

    // 점수 요약
    displayRevenueScoreSummary(result);

    // 주 단계
    displayRevenuePrimaryStage(result.analysis.primary);

    // 보조 단계
    displayRevenueSecondaryStage(result.analysis.secondary);

    // 제안
    displayRevenueProposal(result.analysis);

    // 로드맵
    displayRevenueRoadmap(result.analysis);
}

// 2번 진단 결과 표시
function displayDiagnosis2(data) {
    try {
        console.log('=== displayDiagnosis2 호출 ===');
        console.log('data.diagnosis2:', data.diagnosis2);

        const diagnosis2 = data.diagnosis2;

        console.log('essayAnswers:', diagnosis2.essayAnswers);
        console.log('essayAnswers 타입:', typeof diagnosis2.essayAnswers);
        console.log('essayAnswers 배열 여부:', Array.isArray(diagnosis2.essayAnswers));

        const result = analyzeTypeAnswers(diagnosis2.answers, diagnosis2.scores);

    // 개요
    displayTypeSummary(result.analysis, data.directorName);

    // 레이더 차트
    displayTypeRadarChart(result);

    // 점수 요약
    displayTypeScoreSummary(result);

    // 주 유형
    displayTypePrimaryType(result.analysis.primary);

    // 보조 유형
    displayTypeSecondaryType(result.analysis.secondary);

    // 제안
    displayTypeProposal(result.analysis);

    // 로드맵
    displayTypeRoadmap(result.analysis);

    // AI 맞춤형 피드백
    const feedbackSection = document.getElementById('customFeedbackSection');
    const feedbackContent = document.getElementById('customFeedbackContent');

    if (feedbackSection && feedbackContent) {
        feedbackSection.style.display = 'block';
        displayManagerCustomFeedback(result.analysis, diagnosis2.essayAnswers);
    }

    // 주관식 답변
    const essaySection = document.getElementById('essayAnswersSection');
    const essayContent = document.getElementById('essayAnswersContent');

    if (essaySection && essayContent) {
        essaySection.style.display = 'block';
        displayEssayAnswers(diagnosis2.essayAnswers);
    }

    } catch (error) {
        console.error('displayDiagnosis2 에러:', error);
        // 에러 발생시 사용자에게 간단히 알림
        const feedbackContent = document.getElementById('customFeedbackContent');
        if (feedbackContent) {
            feedbackContent.innerHTML = '<div style="background: #fee2e2; padding: 20px; border-radius: 8px; color: #991b1b;">데이터 로드 중 오류가 발생했습니다.</div>';
        }
    }
}

// AI 맞춤형 피드백 표시 (매니저용)
function displayManagerCustomFeedback(analysis, essayAnswers) {
    const section = document.getElementById('customFeedbackSection');
    const content = document.getElementById('customFeedbackContent');

    // essayAnswers 체크
    if (!essayAnswers || !Array.isArray(essayAnswers) || essayAnswers.length === 0) {
        section.style.display = 'none';
        return;
    }

    // essay-feedback.js의 함수가 있는지 확인
    if (typeof generateCustomFeedback !== 'function') {
        content.innerHTML = '<div style="background: #fee2e2; padding: 20px; border-radius: 8px; color: #991b1b;">피드백 생성 기능을 로드할 수 없습니다.</div>';
        section.style.display = 'block';
        return;
    }

    // essay-feedback.js의 함수 사용
    const feedback = generateCustomFeedback(
        essayAnswers,
        analysis.primary,
        analysis.secondary
    );

    if (!feedback || !feedback.hasFeedback) {
        section.style.display = 'none';
        return;
    }

    // 2.report-type.js와 동일한 HTML 생성 로직 (복사)
    let html = '';

    // 종합 메시지
    html += `
        <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-left: 5px solid #2563eb; padding: 25px 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
            <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 1.2rem; font-weight: bold;">💡 종합 분석</h3>
            <p style="font-size: 1.05rem; line-height: 1.9; color: #1f2937;">${feedback.overallMessage}</p>
        </div>
    `;

    // Q26 피드백 (현재 고민)
    if (feedback.concerns.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h3 style="color: #f59e0b; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold;">📋 현재 고민에 대한 맞춤 피드백</h3>`;

        feedback.concerns.forEach((concern, index) => {
            html += `
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 5px solid #f59e0b; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
                    <p style="color: #92400e; font-weight: 600; margin-bottom: 10px; font-size: 1.05rem;">▸ ${concern.problem}</p>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">${concern.solution}</p>
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                        <p style="color: #92400e; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">실행 방안:</p>
                        <p style="color: #1f2937; line-height: 1.7; white-space: pre-line; font-size: 0.95rem;">${concern.action}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Q27 피드백 (비전)
    if (feedback.vision.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h3 style="color: #8b5cf6; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold;">🎯 비전 달성 전략</h3>`;

        feedback.vision.forEach((vision, index) => {
            html += `
                <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-left: 5px solid #8b5cf6; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);">
                    <p style="color: #6b21a8; font-weight: 600; margin-bottom: 10px; font-size: 1.05rem;">▸ ${vision.vision}</p>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">${vision.strategy}</p>
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #8b5cf6;">
                        <p style="color: #6b21a8; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">추진 우선순위:</p>
                        <p style="color: #1f2937; line-height: 1.7; font-size: 0.95rem;">${vision.priority}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Q28 피드백 (투자 우선순위)
    if (feedback.investment.length > 0) {
        html += `<div style="margin-bottom: 30px;">`;
        html += `<h3 style="color: #10b981; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold;">💰 투자 우선순위 가이드</h3>`;

        feedback.investment.forEach((investment, index) => {
            html += `
                <div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-left: 5px solid #10b981; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);">
                    <p style="color: #065f46; font-weight: 600; margin-bottom: 10px; font-size: 1.05rem;">▸ ${investment.priority}</p>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">${investment.advice}</p>
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 15px; border-radius: 8px; border-left: 3px solid #10b981;">
                        <p style="color: #065f46; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">권장 순서:</p>
                        <p style="color: #1f2937; line-height: 1.7; font-size: 0.95rem;">${investment.sequence}</p>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // 통합 액션 플랜
    if (feedback.actionPlan && feedback.actionPlan.length > 0) {
        html += `<div style="margin-top: 40px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 3px solid #10b981; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">`;
        html += `<h3 style="color: #065f46; margin-bottom: 25px; font-size: 1.3rem; font-weight: bold; text-align: center;">🚀 통합 액션 플랜</h3>`;
        html += `<p style="color: #047857; text-align: center; margin-bottom: 30px; font-size: 1.05rem;">원장님의 고민, 비전, 투자 우선순위를 종합한 실행 로드맵입니다.</p>`;

        feedback.actionPlan.forEach(plan => {
            html += `
                <div style="background: white; border-left: 5px solid #10b981; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 14px; border-radius: 50%; margin-right: 15px; font-weight: bold; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
                            ${plan.phase}
                        </span>
                        <h4 style="color: #065f46; font-size: 1.15rem; font-weight: bold; margin: 0;">${plan.title}</h4>
                    </div>
                    <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px; margin-left: 50px;">${plan.content}</p>
                    <div style="display: flex; gap: 20px; margin-left: 50px; font-size: 0.9rem;">
                        <div style="background: #ecfdf5; padding: 8px 15px; border-radius: 6px;">
                            <span style="color: #047857; font-weight: 600;">소요 기간:</span>
                            <span style="color: #1f2937; margin-left: 5px;">${plan.duration}</span>
                        </div>
                        <div style="background: #dbeafe; padding: 8px 15px; border-radius: 6px; flex: 1;">
                            <span style="color: #1e40af; font-weight: 600;">기대 결과:</span>
                            <span style="color: #1f2937; margin-left: 5px;">${plan.expectedResult}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    }

    document.getElementById('customFeedbackContent').innerHTML = html;
    document.getElementById('customFeedbackSection').style.display = 'block';
}

// 주관식 답변 표시
function displayEssayAnswers(essayAnswers) {
    const section = document.getElementById('essayAnswersSection');
    const content = document.getElementById('essayAnswersContent');

    // 맨 처음에 무조건 메시지 표시 (함수가 호출되었는지 확인용)
    content.innerHTML = '<div style="background: #fef3c7; padding: 20px; border-radius: 8px; color: #92400e;">✅ 주관식 답변 함수 호출됨!</div>';

    if (!essayAnswers) {
        content.innerHTML = '<div style="background: #fee2e2; padding: 20px; border-radius: 8px; color: #991b1b;">❌ essayAnswers가 없습니다.</div>';
        section.style.display = 'block';
        return;
    }

    // 최소 1개 이상 답변이 있는지 확인
    const hasAnswers = essayAnswers.some(answer => answer && answer.trim().length > 0);

    if (!hasAnswers) {
        content.innerHTML = '<div style="background: #fee2e2; padding: 20px; border-radius: 8px; color: #991b1b;">❌ 주관식 답변이 비어있습니다.</div>';
        section.style.display = 'block';
        return;
    }

    // 주관식 질문 정의
    const essayQuestions = [
        '현재 병원 운영에서 가장 고민되거나 해결하고 싶은 문제는 무엇인가요?',
        '3년 후 우리 병원이 어떤 모습이 되기를 원하시나요?',
        '시간과 예산이 충분하다면, 병원의 어떤 부분에 가장 투자하고 싶으신가요?'
    ];

    let html = '';
    essayAnswers.forEach((answer, index) => {
        if (answer && answer.trim().length > 0) {
            html += `
                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 5px solid #f59e0b; padding: 20px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
                    <h3 style="color: #92400e; margin-bottom: 12px; font-weight: bold; font-size: 1.05rem;">
                        📝 Q${26 + index}. ${essayQuestions[index]}
                    </h3>
                    <p style="color: #1f2937; line-height: 1.8; font-size: 1.05rem; white-space: pre-wrap; background: rgba(255, 255, 255, 0.5); padding: 15px; border-radius: 8px;">
                        ${answer}
                    </p>
                </div>
            `;
        }
    });

    if (html) {
        document.getElementById('essayAnswersContent').innerHTML = html;
        document.getElementById('essayAnswersSection').style.display = 'block';
    } else {
        document.getElementById('essayAnswersSection').style.display = 'none';
    }
}

// ===== 1번 진단 표시 함수들 =====

function analyzeRevenueAnswers(answers, scores) {
    // scores 배열이 있으면 사용, 없으면 answers에서 계산
    if (scores && scores.length === 5) {
        return {
            scores: scores,
            analysis: {
                primary: getRevenueStageInfo(scores.indexOf(Math.max(...scores)) + 1, Math.max(...scores)),
                secondary: getRevenueStageInfo(scores.indexOf([...scores].sort((a,b) => b-a)[1]) + 1, [...scores].sort((a,b) => b-a)[1]),
                allScores: scores.map((score, i) => getRevenueStageInfo(i + 1, score))
            }
        };
    }

    // 기본 로직: answers에서 계산
    const stageScores = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    answers.forEach(answer => {
        if (!answer) return;
        const primary = parseInt(answer[0]);
        const secondary = answer[1] ? parseInt(answer[1]) : null;
        if (primary) stageScores[primary] += 2;
        if (secondary) stageScores[secondary] += 1;
    });

    const sortedStages = Object.entries(stageScores)
        .map(([stage, score]) => ({stage: parseInt(stage), score}))
        .sort((a, b) => b.score - a.score);

    return {
        scores: [stageScores[1], stageScores[2], stageScores[3], stageScores[4], stageScores[5]],
        analysis: {
            primary: getRevenueStageInfo(sortedStages[0].stage, sortedStages[0].score),
            secondary: getRevenueStageInfo(sortedStages[1].stage, sortedStages[1].score),
            allScores: sortedStages.map(s => getRevenueStageInfo(s.stage, s.score))
        }
    };
}

function getRevenueStageInfo(stage, score) {
    const stages = revenueTypeDefinitions; // 1.analysis-revenue.js에서 가져옴
    const info = stages[stage];
    return {...info, stage, score};
}

function displayRevenueSummary(analysis, directorName) {
    const primary = analysis.primary;
    const secondary = analysis.secondary;

    let summary = `<strong>${directorName} 원장님의 병원</strong>은 `;
    summary += `<strong style="color: #2563eb;">${primary.fullName}(${primary.stage}형, ${primary.score}점)</strong>을 주 단계로, `;
    summary += `<strong style="color: #10b981;">${secondary.fullName}(${secondary.stage}형, ${secondary.score}점)</strong>을 보조 단계로 가지고 있습니다. `;
    summary += generateRevenueCombinationDescription(primary, secondary);

    const recommendation = generateRevenueRecommendation(primary, secondary);
    summary += `<br><br><strong style="color: #2563eb;">💡 추천 전략:</strong> ${recommendation.strategy}`;

    const actionPlan = generateRevenueActionPlan(primary, secondary);
    summary += `<br><br><strong style="color: #f59e0b;">📋 실행안:</strong> ${actionPlan}`;
    summary += `<br><br><strong style="color: #10b981;">🎯 기대 효과:</strong> ${recommendation.effect}`;

    document.getElementById('diagnosisSummary1').innerHTML = summary;
}

function generateRevenueCombinationDescription(primary, secondary) {
    // 1.report-revenue.js의 로직 참조
    const combKey = `${primary.stage}-${secondary.stage}`;
    const descriptions = {
        '3-1': `${primary.keyword}를 우선적으로 해결하면서 ${secondary.keyword}에 대한 대응도 필요한 상황으로, 체계적인 단계별 개선이 필요합니다.`,
        '1-2': `${primary.keyword}가 주요 과제이며 ${secondary.keyword}도 함께 나타나고 있어, 즉각적인 개선 조치가 필요합니다.`
    };
    return descriptions[combKey] || `${primary.keyword}를 중심으로 ${secondary.keyword}도 함께 고려하는 개선 전략이 필요합니다.`;
}

function generateRevenueRecommendation(primary, secondary) {
    // 기본 추천사항
    return {
        strategy: '병원의 현재 상황에 맞는 맞춤형 솔루션을 단계적으로 도입하여 수익 구조를 개선하시길 권장합니다.',
        effect: '체계적인 개선을 통해 안정적인 수익 증대와 지속 가능한 성장을 달성할 수 있습니다.'
    };
}

function generateRevenueActionPlan(primary, secondary) {
    // 기본 실행안
    return '<strong>1단계:</strong> 현황 진단 및 목표 설정 → <strong>2단계:</strong> 핵심 솔루션 도입 → <strong>3단계:</strong> 효과 측정 및 최적화 → <strong>4단계:</strong> 지속 가능한 성장 체계 구축';
}

function displayRevenueRadarChart(result) {
    const ctx = document.getElementById('radarChart1').getContext('2d');
    const labels = ['1형\n정체·감소', '2형\n유지·불안정', '3형\n원장과부하', '4형\n안정·확장', '5형\n브랜드형'];

    const primaryIndex = result.scores.indexOf(Math.max(...result.scores));
    const sortedScores = [...result.scores].sort((a, b) => b - a);
    const secondaryScore = sortedScores[1];
    const secondaryIndex = result.scores.indexOf(secondaryScore);

    const pointBackgroundColors = result.scores.map((score, index) => {
        if (index === primaryIndex) return '#2563eb';
        if (index === secondaryIndex) return '#10b981';
        return '#9ca3af';
    });

    const pointRadius = result.scores.map((score, index) => {
        if (index === primaryIndex || index === secondaryIndex) return 6;
        return 4;
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '수익 단계별 점수',
                data: result.scores,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                borderWidth: 2,
                pointBackgroundColor: pointBackgroundColors,
                pointBorderColor: pointBackgroundColors,
                pointBorderWidth: 2,
                pointRadius: pointRadius,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: '병원 수익 단계별 5유형 분석',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: Math.max(...result.scores) + 5,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

function displayRevenueScoreSummary(result) {
    const container = document.getElementById('scoreSummary1');
    let html = '';
    result.analysis.allScores.forEach((item, index) => {
        const isPrimary = index === 0;
        const isSecondary = index === 1;
        const className = isPrimary ? 'primary' : (isSecondary ? 'secondary' : '');
        html += `
            <div class="score-item ${className}">
                <div class="score-label">${item.stage}형 - ${item.name}</div>
                <div class="score-value">${item.score}점</div>
                ${isPrimary ? '<div style="margin-top: 3px; color: #2563eb; font-weight: bold; font-size: 0.7rem;">주 단계</div>' : ''}
                ${isSecondary ? '<div style="margin-top: 3px; color: #10b981; font-weight: bold; font-size: 0.7rem;">보조 단계</div>' : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

function displayRevenuePrimaryStage(primary) {
    document.getElementById('primaryStageName').textContent = `${primary.stage}형 - ${primary.fullName} (${primary.score}점)`;
    document.getElementById('primaryStageDescription').textContent = primary.description;

    const charList = document.getElementById('primaryCharacteristics1');
    charList.innerHTML = primary.characteristics.map(char => `<li>${char}</li>`).join('');

    const keywords = document.getElementById('primaryKeywords1');
    keywords.innerHTML = primary.proposalKeywords.map(keyword => `
        <span style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 10px 18px; border-radius: 20px; font-size: 0.95rem; font-weight: 500; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3); display: inline-block;">
            ${keyword}
        </span>
    `).join('');
}

function displayRevenueSecondaryStage(secondary) {
    document.getElementById('secondaryStageName').textContent = `${secondary.stage}형 - ${secondary.fullName} (${secondary.score}점)`;
    document.getElementById('secondaryStageDescription').textContent = secondary.description;

    const charList = document.getElementById('secondaryCharacteristics1');
    charList.innerHTML = secondary.characteristics.map(char => `<li>${char}</li>`).join('');
}

function displayRevenueProposal(analysis) {
    const message = generateRevenueProposalMessage(analysis);
    document.getElementById('proposalMessage1').innerHTML = message;
}

function generateRevenueProposalMessage(analysis) {
    return `${analysis.primary.fullName}에서 ${analysis.secondary.fullName}로 발전하기 위한 맞춤형 솔루션을 제안합니다.`;
}

function displayRevenueRoadmap(analysis) {
    const roadmap = generateRevenueRoadmapSteps(analysis);
    const container = document.getElementById('roadmapContainer1');

    let html = '';
    roadmap.forEach(step => {
        html += `
            <div style="margin-bottom: 20px; padding: 20px 25px; background: linear-gradient(135deg, #f9fafb, #ffffff); border-left: 5px solid #2563eb; border-radius: 10px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);">
                <h3 style="color: #2563eb; margin-bottom: 12px; font-weight: bold; font-size: 1.1rem;">
                    <span style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 6px 14px; border-radius: 50%; margin-right: 12px; font-size: 0.95rem; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);">
                        ${step.step}
                    </span>
                    ${step.title}
                </h3>
                <p style="margin-left: 50px; line-height: 1.8; color: #4b5563; font-size: 1.05rem;">
                    ${step.content}
                </p>
            </div>
        `;
    });

    container.innerHTML = html;
}

function generateRevenueRoadmapSteps(analysis) {
    return [
        { step: 1, title: '현황 진단 및 분석', content: '현재 병원의 수익 구조와 운영 현황을 정확히 파악합니다.' },
        { step: 2, title: '핵심 솔루션 도입', content: '병원 상황에 맞는 맞춤형 솔루션을 단계적으로 도입합니다.' },
        { step: 3, title: '효과 측정 및 최적화', content: '도입한 솔루션의 효과를 측정하고 지속적으로 최적화합니다.' },
        { step: 4, title: '지속 가능한 성장 체계 구축', content: '안정적이고 지속 가능한 수익 구조를 확립합니다.' }
    ];
}

// ===== 2번 진단 표시 함수들 =====

function analyzeTypeAnswers(answers, scores) {
    console.log('analyzeTypeAnswers 호출:', 'scores=', scores);

    // scores가 객체이고 A, B, C, D, E 키를 가지고 있으면 사용
    if (scores && typeof scores === 'object' && scores.A !== undefined) {
        console.log('scores 객체 모드 사용');

        // 점수를 내림차순으로 정렬
        const sortedEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const primaryType = sortedEntries[0][0]; // 가장 높은 점수의 타입 (예: 'D')
        const primaryScore = sortedEntries[0][1];
        const secondaryType = sortedEntries[1][0];
        const secondaryScore = sortedEntries[1][1];

        console.log('Primary:', primaryType, primaryScore);
        console.log('Secondary:', secondaryType, secondaryScore);

        return {
            scores: scores,
            analysis: {
                primary: getTypeInfo(primaryType, primaryScore),
                secondary: getTypeInfo(secondaryType, secondaryScore),
                allScores: sortedEntries.map(([type, score]) => getTypeInfo(type, score))
            },
            primaryType: {type: primaryType},
            secondaryType: {type: secondaryType}
        };
    }

    // 기본 로직
    const typeScores = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    answers.forEach(answer => {
        if (!answer) return;
        const primary = parseInt(answer[0]);
        const secondary = answer[1] ? parseInt(answer[1]) : null;
        if (primary) typeScores[primary] += 2;
        if (secondary) typeScores[secondary] += 1;
    });

    const sortedTypes = Object.entries(typeScores)
        .map(([type, score]) => ({type: parseInt(type), score}))
        .sort((a, b) => b.score - a.score);

    return {
        scores: typeScores,
        analysis: {
            primary: getTypeInfo(sortedTypes[0].type, sortedTypes[0].score),
            secondary: getTypeInfo(sortedTypes[1].type, sortedTypes[1].score),
            allScores: sortedTypes.map(t => getTypeInfo(t.type, t.score))
        },
        primaryType: {type: sortedTypes[0].type},
        secondaryType: {type: sortedTypes[1].type}
    };
}

function getTypeInfo(type, score) {
    console.log('getTypeInfo 호출:', 'type=', type, 'typeof=', typeof type);

    // 2.analysis-type.js에서 typeInfo를 가져옴
    // type이 숫자면 그대로 사용 (1, 2, 3, 4, 5)
    const typeKey = typeof type === 'number' ? type : ['A', 'B', 'C', 'D', 'E'].indexOf(type) + 1;

    console.log('typeKey:', typeKey);
    console.log('typeInfo[typeKey]:', typeInfo[typeKey]);

    const info = typeInfo[typeKey];

    if (!info) {
        alert('❌ typeInfo에서 typeKey를 찾을 수 없습니다!\n\ntypeKey: ' + typeKey + '\ntype: ' + type + '\ntypeof type: ' + typeof type);
        throw new Error('typeInfo[' + typeKey + ']가 undefined입니다.');
    }

    // code를 type으로 사용 (A, B, C, D, E)
    return {
        ...info,
        type: info.code,
        score: score
    };
}

function displayTypeSummary(analysis, directorName) {
    const primary = analysis.primary;
    const secondary = analysis.secondary;

    let summary = `<strong>${directorName} 원장님</strong>은 `;
    summary += `<strong style="color: #2563eb;">${primary.fullName}(${primary.type}형, ${primary.score}점)</strong>을 주 유형으로, `;
    summary += `<strong style="color: #10b981;">${secondary.fullName}(${secondary.type}형, ${secondary.score}점)</strong>을 보조 유형으로 가지고 계십니다. `;
    summary += `${primary.keyword}를 중심으로 ${secondary.keyword}를 보완적으로 활용하는 운영 스타일을 보이고 계십니다.`;

    document.getElementById('diagnosisSummary2').innerHTML = summary;
}

function displayTypeRadarChart(result) {
    const ctx = document.getElementById('radarChart2').getContext('2d');
    const labels = ['A형\n결단·속도', 'B형\n구조·안정', 'C형\n팀·교육', 'D형\n수익·경영', 'E형\n환자·신뢰'];

    // scores가 객체일 수 있으므로 배열로 변환
    let scoresArray = [];
    if (Array.isArray(result.scores)) {
        scoresArray = result.scores;
    } else {
        scoresArray = [result.scores[1] || result.scores['A'], result.scores[2] || result.scores['B'], result.scores[3] || result.scores['C'], result.scores[4] || result.scores['D'], result.scores[5] || result.scores['E']];
    }

    const primaryIndex = scoresArray.indexOf(Math.max(...scoresArray));
    const sortedScores = [...scoresArray].sort((a, b) => b - a);
    const secondaryScore = sortedScores[1];
    const secondaryIndex = scoresArray.indexOf(secondaryScore);

    const pointBackgroundColors = scoresArray.map((score, index) => {
        if (index === primaryIndex) return '#8b5cf6';
        if (index === secondaryIndex) return '#10b981';
        return '#9ca3af';
    });

    const pointRadius = scoresArray.map((score, index) => {
        if (index === primaryIndex || index === secondaryIndex) return 6;
        return 4;
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '원장 스타일 점수',
                data: scoresArray,
                fill: true,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
                pointBackgroundColor: pointBackgroundColors,
                pointBorderColor: pointBackgroundColors,
                pointBorderWidth: 2,
                pointRadius: pointRadius,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: '원장 스타일 5유형 분석',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: Math.max(...scoresArray) + 5,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

function displayTypeScoreSummary(result) {
    const container = document.getElementById('scoreSummary2');
    let html = '';
    result.analysis.allScores.forEach((item, index) => {
        const isPrimary = index === 0;
        const isSecondary = index === 1;
        const className = isPrimary ? 'primary' : (isSecondary ? 'secondary' : '');
        html += `
            <div class="score-item ${className}">
                <div class="score-label">${item.type}형 - ${item.name}</div>
                <div class="score-value">${item.score}점</div>
                ${isPrimary ? '<div style="margin-top: 3px; color: #2563eb; font-weight: bold; font-size: 0.7rem;">주 유형</div>' : ''}
                ${isSecondary ? '<div style="margin-top: 3px; color: #10b981; font-weight: bold; font-size: 0.7rem;">보조 유형</div>' : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

function displayTypePrimaryType(primary) {
    document.getElementById('primaryTypeName').textContent = `${primary.type}형 - ${primary.fullName} (${primary.score}점)`;
    document.getElementById('primaryTypeDescription').textContent = primary.description;

    const charList = document.getElementById('primaryCharacteristics2');
    charList.innerHTML = primary.characteristics.map(char => `<li>${char}</li>`).join('');

    const keywords = document.getElementById('primaryKeywords2');
    keywords.innerHTML = primary.proposalKeywords.map(keyword => `
        <span style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 10px 18px; border-radius: 20px; font-size: 0.95rem; font-weight: 500; box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3); display: inline-block;">
            ${keyword}
        </span>
    `).join('');
}

function displayTypeSecondaryType(secondary) {
    document.getElementById('secondaryTypeName').textContent = `${secondary.type}형 - ${secondary.fullName} (${secondary.score}점)`;
    document.getElementById('secondaryTypeDescription').textContent = secondary.description;

    const charList = document.getElementById('secondaryCharacteristics2');
    charList.innerHTML = secondary.characteristics.map(char => `<li>${char}</li>`).join('');
}

function displayTypeProposal(analysis) {
    const message = `${analysis.primary.fullName}의 강점을 살리면서 ${analysis.secondary.fullName}의 특성을 보완하는 맞춤형 솔루션을 제안합니다.`;
    document.getElementById('proposalMessage2').innerHTML = message;
}

function displayTypeRoadmap(analysis) {
    const roadmap = [
        { step: 1, title: '원장 역량 강화', content: '원장님의 스타일에 맞는 리더십과 경영 역량을 강화합니다.' },
        { step: 2, title: '팀 역량 확산', content: '원장님의 철학과 가치관을 팀 전체에 확산시킵니다.' },
        { step: 3, title: '차별화 브랜딩', content: '병원만의 차별화된 브랜드 이미지를 구축합니다.' },
        { step: 4, title: '성장 가속화', content: '통합 마케팅과 체계적인 관리로 지속 가능한 성장을 실현합니다.' }
    ];

    const container = document.getElementById('roadmapContainer2');
    let html = '';
    roadmap.forEach(step => {
        html += `
            <div style="margin-bottom: 20px; padding: 20px 25px; background: linear-gradient(135deg, #f9fafb, #ffffff); border-left: 5px solid #8b5cf6; border-radius: 10px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);">
                <h3 style="color: #8b5cf6; margin-bottom: 12px; font-weight: bold; font-size: 1.1rem;">
                    <span style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 6px 14px; border-radius: 50%; margin-right: 12px; font-size: 0.95rem; box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);">
                        ${step.step}
                    </span>
                    ${step.title}
                </h3>
                <p style="margin-left: 50px; line-height: 1.8; color: #4b5563; font-size: 1.05rem;">
                    ${step.content}
                </p>
            </div>
        `;
    });
    container.innerHTML = html;
}
