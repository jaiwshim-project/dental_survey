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
    const diagnosis2 = data.diagnosis2;
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
    const stages = revenueStages; // 1.data-revenue.js에서 가져옴
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
    // scores 배열이 있으면 사용
    if (scores && Object.keys(scores).length === 5) {
        const scoresArray = [scores[1] || scores['A'], scores[2] || scores['B'], scores[3] || scores['C'], scores[4] || scores['D'], scores[5] || scores['E']];
        return {
            scores: scores,
            analysis: {
                primary: getTypeInfo(Object.keys(scores)[0], Math.max(...Object.values(scores))),
                secondary: getTypeInfo(Object.keys(scores)[1], Object.values(scores).sort((a,b) => b-a)[1]),
                allScores: Object.entries(scores).map(([type, score]) => getTypeInfo(type, score))
            },
            primaryType: {type: Object.keys(scores)[0]},
            secondaryType: {type: Object.keys(scores)[1]}
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
    const types = typeDefinitions; // 2.data-type.js에서 가져옴
    // type이 숫자면 A-E로 변환
    const typeKey = typeof type === 'number' ? ['A', 'B', 'C', 'D', 'E'][type - 1] : type;
    const info = types[typeKey];
    return {...info, type: typeKey, score};
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
