// 병원 수익 단계별 진단 결과 리포트 생성

document.addEventListener('DOMContentLoaded', function() {
    // 세션 스토리지에서 데이터 가져오기
    const clinicName = sessionStorage.getItem('clinicName');
    const directorName = sessionStorage.getItem('directorName');
    const region = sessionStorage.getItem('region');
    const diagnosisDate = sessionStorage.getItem('revenueDiagnosisDate');
    const answersJSON = sessionStorage.getItem('revenueAnswers');

    if (!clinicName || !directorName || !answersJSON) {
        alert('진단 데이터가 없습니다. 처음부터 다시 시작해 주세요.');
        window.location.href = 'index-revenue.html';
        return;
    }

    const answers = JSON.parse(answersJSON);

    // 병원 정보 표시 (2줄로 나누기)
    let clinicNameNoSpace = clinicName.replace(/\s+/g, '');
    let hospitalInfoText = `${clinicNameNoSpace} ${directorName} 원장`;
    document.getElementById('hospitalInfo').textContent = hospitalInfoText;

    // 두 번째 줄: 지역
    if (region) {
        document.getElementById('hospitalDetail').textContent = region;
    }

    // 진단 일자 표시
    if (diagnosisDate) {
        document.getElementById('diagnosisDate').textContent = '진단 일자: ' + diagnosisDate;
    }

    // 답변 분석
    const result = analyzeRevenueAnswers(answers);

    // 결과 표시
    displaySummary(result, directorName);
    displayRadarChart(result);
    displayScoreSummary(result);
    displayPrimaryStage(result.analysis.primary);
    displaySecondaryStage(result.analysis.secondary);
    displayProposal(result.analysis);
    displayRoadmap(result.analysis.primary);

    // 콘솔에 디버깅 정보 출력
    console.log('진단 결과:', result);
    console.log('답변 데이터:', answers);

    // 진단 결과를 localStorage에 저장 (매니저 대시보드용)
    saveDiagnosisToHistory({
        clinicName: clinicName,
        directorName: directorName,
        region: region,
        date: diagnosisDate,
        diagnosis1: {
            answers: answers,
            scores: result.scores,
            primaryType: {
                type: result.analysis.primary.type,
                name: result.analysis.primary.name,
                fullName: result.analysis.primary.fullName,
                score: result.analysis.primary.score
            },
            secondaryType: {
                type: result.analysis.secondary.type,
                name: result.analysis.secondary.name,
                fullName: result.analysis.secondary.fullName,
                score: result.analysis.secondary.score
            }
        }
    });
});

// 진단 기록 저장 함수
function saveDiagnosisToHistory(diagnosisData) {
    try {
        // localStorage에서 기존 기록 가져오기
        let history = JSON.parse(localStorage.getItem('diagnosisHistory') || '[]');

        // 병원명과 원장명으로 기존 기록 찾기
        const existingIndex = history.findIndex(h =>
            h.clinicName === diagnosisData.clinicName &&
            h.directorName === diagnosisData.directorName
        );

        const doctorCount = sessionStorage.getItem('doctorCount');
        const nurseCount = sessionStorage.getItem('nurseCount');
        const counselorCount = sessionStorage.getItem('counselorCount');

        if (existingIndex >= 0) {
            // 기존 기록이 있으면 업데이트
            history[existingIndex].diagnosis1 = diagnosisData.diagnosis1;
            history[existingIndex].date = diagnosisData.date;
            history[existingIndex].region = diagnosisData.region;
            history[existingIndex].doctorCount = doctorCount;
            history[existingIndex].nurseCount = nurseCount;
            history[existingIndex].counselorCount = counselorCount;
            history[existingIndex].timestamp = Date.now();
        } else {
            // 새로운 기록 추가
            const newRecord = {
                id: 'diag_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
                clinicName: diagnosisData.clinicName,
                directorName: diagnosisData.directorName,
                region: diagnosisData.region,
                doctorCount: doctorCount,
                nurseCount: nurseCount,
                counselorCount: counselorCount,
                date: diagnosisData.date,
                diagnosis1: diagnosisData.diagnosis1,
                diagnosis2: null
            };
            history.push(newRecord);
        }

        // localStorage에 저장
        localStorage.setItem('diagnosisHistory', JSON.stringify(history));
        console.log('진단 기록 저장 완료:', history);
    } catch (error) {
        console.error('진단 기록 저장 실패:', error);
    }
}

// 진단 결과 개요 표시
function displaySummary(result, directorName) {
    const primary = result.analysis.primary;
    const secondary = result.analysis.secondary;

    let summary = `<strong>${directorName} 원장님</strong> 병원의 현재 상황은 `;
    summary += `<strong style="color: #2563eb;">${primary.fullName}(${primary.type}형, ${primary.score}점)</strong>이 주 증상이며, `;
    summary += `<strong style="color: #10b981;">${secondary.fullName}(${secondary.type}형, ${secondary.score}점)</strong>의 특징도 함께 나타나고 있습니다. `;
    summary += `<br><br>`;

    // 주 단계 핵심 문제 설명
    summary += `<strong style="color: #dc2626;">🔍 현재 병원이 직면한 핵심 문제:</strong><br>`;
    summary += `${primary.problem}<br>`;
    summary += `"${primary.coreMessage}"가 필요한 시점입니다.`;

    // 주 단계와 보조 단계의 조합에 따른 상황 진단
    summary += `<br><br>`;
    summary += generateCombinationDescription(primary, secondary);

    // 추천사항과 기대효과 추가
    const recommendation = generateRecommendation(primary, secondary);
    summary += `<br><br><strong style="color: #2563eb;">💡 권장 솔루션:</strong> ${recommendation.strategy}`;

    // 실행안 추가
    const actionPlan = generateActionPlan(primary, secondary);
    summary += `<br><br><strong style="color: #f59e0b;">📋 실행 로드맵:</strong> ${actionPlan}`;

    summary += `<br><br><strong style="color: #10b981;">🎯 예상 개선 효과:</strong> ${recommendation.effect}`;

    document.getElementById('diagnosisSummary').innerHTML = summary;
}

// 단계 조합에 따른 상황 진단 생성
function generateCombinationDescription(primary, secondary) {
    const combKey = `${primary.type}-${secondary.type}`;

    // 주요 조합에 대한 병원 상황 진단
    const descriptions = {
        '1-2': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자 수가 감소하고 있으며, 달마다 매출 변동성도 커서 이중고를 겪고 있습니다. 광고를 늘려도 효과가 미미하고, 어떤 달은 괜찮다가도 갑자기 환자가 줄어드는 패턴이 반복됩니다. 상담 결과가 직원에 따라 달라 더욱 불안정한 상황입니다.`,
        '1-3': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자 수는 줄어들고 있는데 원장님의 업무 부담은 오히려 늘어나고 있습니다. 남은 환자들을 붙잡기 위해 원장님이 상담과 설명에 더 많이 개입하면서 체력 소모가 심각합니다. 바쁘지만 수익은 줄어드는 모순된 상황입니다.`,
        '1-4': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 최근 환자 이탈이 발생하고 있지만, 병원의 기본 체계는 갖춰져 있습니다. 시스템은 있는데 상담에서 환자가 선택하지 않는 패턴이 나타납니다. 확장을 준비 중이었지만 이탈 문제를 먼저 해결해야 하는 시점입니다.`,
        '1-5': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자들의 만족도와 신뢰는 높지만 신규 환자 유입이 줄어들고 있습니다. 기존 환자는 만족하지만 새로운 환자가 상담 후 결정하지 않는 경향이 나타납니다. 브랜드는 좋은데 매출이 정체된 아이러니한 상황입니다.`,
        '2-1': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 매출이 불안정하고 어떤 환자는 이탈하는 이중 문제를 겪고 있습니다. 달마다 환자 수도 매출도 예측이 안 되며, 좋을 때는 괜찮다가도 갑자기 환자가 줄어드는 패턴이 반복됩니다. 구조적 안정성 확보가 시급합니다.`,
        '2-3': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 매출 변동성이 크고 원장님의 상담 부담도 큽니다. 직원별로 상담 결과가 달라서 원장님이 계속 개입해야 하는 상황입니다. 원장님이 있을 때와 없을 때 병원 운영 품질이 크게 차이 납니다. 시스템 부재로 인한 이중 부담이 발생하고 있습니다.`,
        '2-4': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 기본 체계는 갖춰져 있지만 상담 결과의 편차가 커서 매출이 불안정합니다. 시스템은 있는데 실행 단계에서 일관성이 떨어집니다. 확장을 준비 중이지만 현재의 변동성부터 해결해야 안정적 성장이 가능합니다.`,
        '2-5': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자 만족도는 높지만 매출이 들쑥날쑥합니다. 브랜드는 좋은데 상담 결과가 직원에 따라 달라 수익 예측이 어렵습니다. 신뢰 기반은 있지만 일관된 상담 품질 확보가 필요한 상태입니다.`,
        '3-1': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 원장님의 과부하가 심각하고 환자 이탈까지 발생하고 있습니다. 원장님이 상담과 설명에 많은 시간을 쏟지만 환자는 오히려 줄어드는 악순환이 발생합니다. 체력적으로나 수익적으로나 가장 어려운 단계입니다.`,
        '3-2': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 원장님의 업무 부담이 크고 매출도 불안정합니다. 직원들의 상담 편차가 커서 원장님이 계속 개입해야 하고, 그래서 원장님 시간이 부족하며, 그러다 보니 매출도 들쑥날쑥합니다. 악순환의 고리를 끊어야 합니다.`,
        '3-4': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 병원은 성장하고 있지만 모든 것이 원장님에게 집중되어 있습니다. 확장을 원하지만 원장님이 빠지면 돌아가지 않는 구조여서 확장이 어렵습니다. 성장의 발목을 잡는 것은 원장님의 개입 의존도입니다.`,
        '3-5': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자들의 만족도는 높지만 원장님의 직접 개입으로 만들어진 신뢰입니다. 환자는 원장님을 믿지만 원장님 시간이 부족해 확장이 어렵습니다. 브랜드는 좋은데 원장님 체력이 한계입니다.`,
        '4-1': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 전체적으로 안정적이지만 최근 환자 이탈 징후가 보입니다. 시스템은 잘 돌아가는데 상담에서 환자가 선택하지 않는 새로운 문제가 나타나고 있습니다. 확장 전에 이탈 원인을 파악하고 해결해야 합니다.`,
        '4-2': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 기본 체계는 갖춰져 있지만 완전히 안정적이지는 않습니다. 시스템은 있는데 실행 일관성이 부족해 간혹 편차가 발생합니다. 확장을 위해서는 더욱 견고한 기준과 구조가 필요한 단계입니다.`,
        '4-3': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 병원은 성장 중이지만 원장님의 업무 부담도 함께 증가하고 있습니다. 확장을 원하는데 원장님의 개입이 계속 필요한 구조여서 성장이 더딥니다. 시스템은 있지만 원장 의존도를 낮춰야 합니다.`,
        '4-5': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 수익도 안정적이고 환자 신뢰도 높은 이상적인 단계입니다. 시스템도 갖춰져 있고 브랜드 가치도 확보되어 있어, 지속 가능한 확장이 가능한 최적의 상태입니다. 현재 체계를 더욱 고도화하면 고수익 브랜드형으로 도약할 수 있습니다.`,
        '5-1': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 브랜드와 신뢰도는 높지만 최근 신규 환자 유입이 감소하고 있습니다. 기존 환자는 만족하지만 새로운 환자가 상담 후 결정하지 않습니다. 평판은 좋은데 매출이 정체되는 모순이 발생합니다.`,
        '5-2': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자 신뢰도는 높지만 상담 결과의 일관성이 부족합니다. 브랜드는 좋은데 직원별 상담 편차로 인해 매출이 불안정합니다. 높은 신뢰를 안정적 수익으로 전환하는 체계가 필요합니다.`,
        '5-3': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 환자 만족도는 매우 높지만 원장님의 직접 개입으로 만들어진 신뢰입니다. 브랜드를 지키려면 원장님이 계속 개입해야 하는 구조여서 확장이 어렵습니다. 신뢰를 지키면서 원장님 부담을 줄이는 것이 과제입니다.`,
        '5-4': `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> 높은 브랜드 가치와 안정적 시스템을 모두 갖춘 이상적인 상태입니다. 환자 신뢰도 높고 운영 체계도 갖춰져 있어, 신뢰를 유지하며 효율적으로 확장할 수 있는 최고의 단계입니다.`
    };

    // 조합별 설명이 있으면 사용, 없으면 기본 설명
    if (descriptions[combKey]) {
        return descriptions[combKey];
    } else {
        return `<strong style="color: #dc2626;">🏥 현재 병원 상황:</strong> ${primary.description} 동시에 ${secondary.name}의 특성도 일부 나타나고 있어 복합적인 상황입니다.`;
    }
}

// 단계 조합에 따른 추천사항 생성
function generateRecommendation(primary, secondary) {
    const combKey = `${primary.type}-${secondary.type}`;

    const recommendations = {
        '1-2': {
            strategy: '환자 이탈 원인을 데이터로 분석하고, 체계적인 상담 프로세스를 도입하여 환자 결정률을 높이는 것을 우선 추진하십시오. AI 기반 상담 분석으로 이탈 패턴을 파악하고, 5단계 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 형성)를 체계화하여 일관된 품질을 확보하십시오.',
            effect: '환자 이탈률 감소와 결정률 15-25% 향상으로 수익 회복이 가능하며, 체계적 운영으로 안정성도 확보할 수 있습니다. 3-6개월 내 가시적 개선 효과를 경험할 수 있습니다.'
        },
        '1-3': {
            strategy: '원장님의 상담 부담을 줄이면서 환자 결정률을 높이는 AI 상담 시스템을 도입하고, 직원 역량 강화를 통해 업무를 분산하십시오. 5단계 상담 프로세스를 원장님부터 내재화한 후 팀원에게 전수하여 일관된 상담 품질을 만드십시오.',
            effect: '원장님의 상담 시간 30% 단축하면서도 결정률 20% 이상 향상되어, 원장님 부담 감소와 수익 회복을 동시에 달성할 수 있습니다.'
        },
        '1-4': {
            strategy: '수익 정체를 돌파하기 위한 체계적 접근이 필요합니다. 데이터 기반으로 이탈 원인을 파악하고, 확장 준비를 위한 표준 프로세스를 구축하십시오. 5단계 상담 체계와 함께 성과 측정 시스템을 도입하여 빠르게 성장 단계로 전환하십시오.',
            effect: '체계적 개선으로 2-3개월 내 수익 회복 시작, 6개월 내 안정·확장 단계로 도약 가능합니다.'
        },
        '1-5': {
            strategy: '높은 환자 신뢰를 활용하여 수익을 회복하는 전략이 효과적입니다. 환자 후기와 추천을 체계적으로 관리하고, 신뢰 기반의 상담 프로세스를 강화하여 결정률을 높이십시오. 브랜드 가치를 수익으로 전환하는 시스템을 구축하십시오.',
            effect: '신뢰 기반 마케팅과 상담 개선으로 신규 환자 유입 증가 및 결정률 25% 이상 향상을 기대할 수 있습니다.'
        },
        '2-3': {
            strategy: '수익 변동성을 줄이고 원장님의 부담을 동시에 해결하기 위해 표준화된 상담 프로세스와 직원 교육 시스템을 구축하십시오. 5단계 상담 프로세스를 체계화하고 팀 전체에 확산하여 일관된 품질을 만드십시오.',
            effect: '수익 변동성 감소와 원장님 업무 부담 30% 감소를 동시에 달성하여 안정적 운영 기반을 마련할 수 있습니다.'
        },
        '2-4': {
            strategy: '불안정한 수익을 안정화하고 확장을 준비하기 위해 체계적인 프로세스와 데이터 관리 시스템을 구축하십시오. KPI 중심의 성과 관리와 5단계 상담 체계를 도입하여 예측 가능한 수익 구조를 만드십시오.',
            effect: '수익 변동폭 50% 감소, 평균 결정률 20% 향상으로 안정적 성장 기반을 확보할 수 있습니다.'
        },
        '2-5': {
            strategy: '환자 신뢰를 기반으로 수익 안정화 전략을 추진하십시오. 일관된 고품질 서비스 제공으로 변동성을 줄이고, 환자 경험 관리 시스템을 통해 재방문율을 높이십시오.',
            effect: '재방문율 증가로 수익 변동폭 감소, 신뢰 기반 추천으로 안정적 신규 환자 유입을 달성할 수 있습니다.'
        },
        '3-4': {
            strategy: '원장님의 과부하를 줄이면서 확장을 준비하기 위해 업무 자동화와 직원 역량 강화를 동시에 추진하십시오. AI 상담 시스템으로 효율을 높이고, 체계적인 직원 교육으로 업무를 분산하십시오.',
            effect: '원장님 업무 시간 40% 감소하면서도 수익은 유지·증가하여, 지속 가능한 성장 체계를 마련할 수 있습니다.'
        },
        '3-5': {
            strategy: '높은 환자 신뢰를 유지하면서 원장님의 부담을 줄이는 전략이 핵심입니다. 직원들이 환자 경험을 일관되게 제공할 수 있도록 교육하고, 원장님은 핵심 업무에 집중할 수 있도록 체계를 만드십시오.',
            effect: '원장님 부담 감소와 환자 만족도 유지를 동시에 달성하여, 브랜드 가치를 지키며 효율적으로 운영할 수 있습니다.'
        },
        '4-5': {
            strategy: '안정적 확장과 브랜드 강화를 동시에 추구하십시오. 데이터 기반 의사결정 체계를 유지하면서 환자 경험을 더욱 개선하고, 지역 내 최고의 브랜드로 포지셔닝하는 전략을 실행하십시오.',
            effect: '수익성과 브랜드 가치를 동시에 높여 지속 가능한 고수익 구조를 완성할 수 있습니다. 지역 대표 브랜드로 확고히 자리잡을 수 있습니다.'
        },
        '5-4': {
            strategy: '브랜드 가치를 바탕으로 체계적 확장을 추진하십시오. 환자 신뢰를 해치지 않으면서 운영 효율을 높이고, 데이터로 검증된 성장 전략을 실행하십시오.',
            effect: '환자 만족도를 유지하며 수익성을 높여, 신뢰와 수익을 모두 확보한 이상적 운영 체계를 달성할 수 있습니다.'
        }
    };

    // 조합별 추천사항이 있으면 사용, 없으면 주 단계 기반 추천
    if (recommendations[combKey]) {
        return recommendations[combKey];
    } else {
        // 주 단계 기반 기본 추천
        const defaultRecommendations = {
            1: {
                strategy: '환자 이탈 원인을 분석하고 5단계 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 형성)를 도입하여 결정률을 높이는 것을 최우선으로 추진하십시오. AI 기반 상담 분석으로 개선점을 빠르게 파악하고 적용하십시오.',
                effect: '3-6개월 내 환자 이탈률 감소 및 결정률 20% 이상 향상으로 수익 회복을 경험할 수 있습니다.'
            },
            2: {
                strategy: '수익 변동성을 줄이기 위해 체계적인 상담 프로세스와 성과 관리 시스템을 구축하십시오. 5단계 상담 체계를 표준화하고 일관된 품질을 확보하십시오.',
                effect: '수익 변동폭 50% 감소, 예측 가능한 매출 구조 확립으로 안정적 운영이 가능해집니다.'
            },
            3: {
                strategy: '원장님의 업무 부담을 줄이기 위해 AI 상담 시스템과 직원 역량 강화를 동시에 추진하십시오. 5단계 상담 프로세스를 팀 전체에 전수하여 업무를 효과적으로 분산하십시오.',
                effect: '원장님 업무 시간 30-40% 감소하면서도 수익은 유지·증가하여 지속 가능한 운영 체계를 마련할 수 있습니다.'
            },
            4: {
                strategy: '안정적 기반을 활용하여 체계적 확장을 추진하십시오. 데이터 기반 의사결정 체계와 5단계 상담 프로세스를 더욱 고도화하고, 성과 측정 시스템을 강화하십시오.',
                effect: '안정성을 유지하며 수익 20-30% 성장을 달성하고, 지속 가능한 확장 기반을 완성할 수 있습니다.'
            },
            5: {
                strategy: '높은 브랜드 가치를 더욱 강화하고 활용하십시오. 환자 경험을 극대화하는 시스템을 구축하고, 지역 사회와의 연계를 통해 브랜드 영향력을 확대하십시오.',
                effect: '브랜드 신뢰도 상승으로 자연스러운 환자 유입 증가, 마케팅 비용 절감, 지역 대표 브랜드로 확고한 포지셔닝을 달성할 수 있습니다.'
            }
        };

        return defaultRecommendations[primary.type] || {
            strategy: '병원의 현재 단계에 맞는 맞춤형 전략을 단계적으로 실행하여 지속 가능한 성장 기반을 마련하십시오.',
            effect: '체계적 개선을 통해 운영 효율성 향상과 안정적 수익 성장을 달성할 수 있습니다.'
        };
    }
}

// 단계 조합에 따른 실행안 생성
function generateActionPlan(primary, secondary) {
    const combKey = `${primary.type}-${secondary.type}`;

    const actionPlans = {
        '1-2': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 형성) 코칭 + 환자 이탈 원인 데이터 분석 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 표준 상담 기준 수립 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 체계적인 상담 관리 시스템 도입 + 데이터 기반 성과 추적 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정적 수익 구조 확립',
        '1-3': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 집중 코칭으로 효율성 극대화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육으로 원장님 업무 분산 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (업무 최적화):</strong> AI 상담 시스템 도입으로 원장님 상담 시간 단축 + 팀 역량 강화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 원장님 부담 없는 수익 회복',
        '1-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 이탈 원인 분석 및 개선 전략 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 체계적 프로세스 구축 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 데이터 기반 성과 관리 시스템 도입 + 확장 준비 체계 확립 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정·확장 단계로 도약',
        '1-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭으로 신뢰 기반 상담 강화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 환자 후기·추천 관리 시스템 구축 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (브랜드 활용):</strong> 신뢰 기반 마케팅 강화 + 환자 경험 최적화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 브랜드 가치 기반 수익 회복',
        '2-3': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 표준 프로세스 설계 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육으로 업무 분산 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (안정화):</strong> 일관된 상담 품질로 변동성 감소 + 원장님 부담 경감 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정적 운영 체계 완성',
        '2-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 데이터 기반 분석 체계 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 체계적 프로세스 문서화 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> KPI 중심 성과 관리 시스템 도입 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정·확장 단계 진입',
        '2-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭으로 신뢰 기반 상담 강화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 환자 경험 관리 시스템 구축 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (안정화):</strong> 일관된 고품질 서비스로 변동성 감소 + 재방문율 향상 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 신뢰 기반 안정적 수익 구조',
        '3-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 업무 효율화 전략 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육으로 업무 분산 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (자동화):</strong> AI 상담 시스템 도입으로 원장님 부담 감소 + 확장 준비 체계 구축 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속 가능한 성장 체계',
        '3-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭으로 핵심 업무 집중 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육으로 환자 경험 일관성 확보 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (업무 최적화):</strong> 팀 역량 강화로 원장님 부담 경감 + 브랜드 가치 유지 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 원장님 부담 없는 브랜드 성장',
        '4-5': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 고도화 코칭 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 고급 프로세스 교육 + 환자 경험 극대화 전략 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (브랜드 강화):</strong> 데이터 기반 의사결정 체계 고도화 + 지역 대표 브랜드 포지셔닝 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 고수익 브랜드형 완성',
        '5-4': '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 고도화 코칭으로 브랜드 가치 극대화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 고급 프로세스 교육 + 체계적 확장 준비 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 고도화):</strong> 브랜드 가치 유지하며 운영 효율 극대화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 신뢰와 수익 모두 확보한 이상적 체계'
    };

    if (actionPlans[combKey]) {
        return actionPlans[combKey];
    } else {
        // 주 단계 기반 기본 실행안
        const defaultPlans = {
            1: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 환자 이탈 원인 분석 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 상담 품질 관리 시스템 도입 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 수익 회복',
            2: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 표준 프로세스 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 프로세스 문서화 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (안정화):</strong> 일관된 상담 품질로 변동성 감소 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 안정적 수익 구조',
            3: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 + 효율화 전략 수립 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육으로 업무 분산 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (자동화):</strong> AI 시스템 도입으로 원장님 부담 경감 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속 가능한 운영',
            4: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 고도화 코칭 + 성과 지표 설정 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 고급 프로세스 교육 + 데이터 기반 관리 체계 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 고도화):</strong> KPI 중심 성과 관리 최적화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 체계적 확장 완성',
            5: '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 고도화 코칭으로 브랜드 가치 극대화 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 고급 프로세스 교육 + 환자 경험 최적화 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (브랜드 강화):</strong> 지역 대표 브랜드 포지셔닝 전략 실행 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 고수익 브랜드 완성'
        };

        return defaultPlans[primary.type] || '<strong>1단계 (원장 역량 강화):</strong> 원장님 대상 5단계 환자 상담 프로세스 코칭 및 현황 진단 → <strong>2단계 (팀 역량 확산):</strong> 간호사·상담사 대상 동일 프로세스 교육 + 원장 브랜딩(철학·가치관 신문기사/영상) → <strong>3단계 (시스템 구축):</strong> 맞춤형 솔루션 도입 및 최적화 → <strong>4단계 (성장 가속화):</strong> 통합 마케팅으로 신환 유입 + 5단계 상담으로 고정 환자 전환 + 지속 가능한 성장 체계 구축';
    }
}

// 레이더 차트 생성
function displayRadarChart(result) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    // 유형 이름과 점수 데이터 준비
    const labels = [
        '1형\n정체·감소',
        '2형\n유지·불안정',
        '3형\n원장 과부하',
        '4형\n안정·확장',
        '5형\n브랜드형'
    ];

    const scores = [
        result.scores['1'],
        result.scores['2'],
        result.scores['3'],
        result.scores['4'],
        result.scores['5']
    ];

    // 주 단계와 보조 단계의 인덱스
    const primaryIndex = parseInt(result.primaryType.type) - 1;
    const secondaryIndex = parseInt(result.secondaryType.type) - 1;

    // 각 포인트의 색상 설정 (주 단계: 파란색, 보조 단계: 초록색, 나머지: 회색)
    const pointBackgroundColors = scores.map((score, index) => {
        if (index === primaryIndex) return '#2563eb';
        if (index === secondaryIndex) return '#10b981';
        return '#9ca3af';
    });

    const pointBorderColors = pointBackgroundColors;
    const pointRadius = scores.map((score, index) => {
        if (index === primaryIndex || index === secondaryIndex) return 6;
        return 4;
    });

    // 레이블 색상 설정 (주 단계: 파란색, 보조 단계: 초록색, 나머지: 회색)
    const labelColors = scores.map((score, index) => {
        if (index === primaryIndex) return '#2563eb';
        if (index === secondaryIndex) return '#10b981';
        return '#4b5563';
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '수익 단계별 점수',
                data: scores,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                borderWidth: 2,
                pointBackgroundColor: pointBackgroundColors,
                pointBorderColor: pointBorderColors,
                pointBorderWidth: 2,
                pointRadius: pointRadius,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '병원 수익 단계별 5유형 분석',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `점수: ${context.parsed.r}점`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: Math.max(...scores) + 5,
                    ticks: {
                        stepSize: 5,
                        font: {
                            size: 11
                        }
                    },
                    pointLabels: {
                        font: function(context) {
                            const index = context.index;
                            if (index === primaryIndex || index === secondaryIndex) {
                                return {
                                    size: 13,
                                    weight: 'bold'
                                };
                            }
                            return {
                                size: 12,
                                weight: 'normal'
                            };
                        },
                        color: function(context) {
                            return labelColors[context.index];
                        }
                    }
                }
            }
        }
    });
}

// 점수 분포 카드 표시
function displayScoreSummary(result) {
    const container = document.getElementById('scoreSummary');

    const types = ['1', '2', '3', '4', '5'];
    const names = ['정체·감소', '유지·불안정', '원장 과부하', '안정·확장', '브랜드형'];
    const primaryType = result.primaryType.type;
    const secondaryType = result.secondaryType.type;

    let html = '';
    types.forEach((type, index) => {
        const isPrimary = (type === primaryType);
        const isSecondary = (type === secondaryType);
        let className = '';
        if (isPrimary) className = 'primary';
        else if (isSecondary) className = 'secondary';

        const score = result.scores[type];

        html += `
            <div class="score-item ${className}">
                <div class="score-label">${type}형 - ${names[index]}</div>
                <div class="score-value">${score}점</div>
                ${isPrimary ? '<div style="margin-top: 3px; color: #2563eb; font-weight: bold; font-size: 0.7rem;">주 단계</div>' : ''}
                ${isSecondary ? '<div style="margin-top: 3px; color: #10b981; font-weight: bold; font-size: 0.7rem;">보조 단계</div>' : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

// 주 단계 표시
function displayPrimaryStage(primary) {
    document.getElementById('primaryStageName').textContent = primary.fullName;
    document.getElementById('primaryStageDescription').textContent = primary.description;

    // 주요 특징 목록
    const charList = document.getElementById('primaryCharacteristics');
    charList.innerHTML = primary.characteristics
        .map(char => `<li>${char}</li>`)
        .join('');

    // 제안 키워드
    const keywordsContainer = document.getElementById('primaryKeywords');
    keywordsContainer.innerHTML = primary.proposalKeywords
        .map(keyword => `
            <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe);
                        border: 2px solid #2563eb;
                        padding: 10px 20px;
                        border-radius: 20px;
                        color: #2563eb;
                        font-weight: bold;
                        font-size: 0.95rem;">
                ${keyword}
            </div>
        `)
        .join('');
}

// 보조 단계 표시
function displaySecondaryStage(secondary) {
    document.getElementById('secondaryStageName').textContent = secondary.fullName;
    document.getElementById('secondaryStageDescription').textContent = secondary.description;

    // 보조 특징 목록
    const charList = document.getElementById('secondaryCharacteristics');
    charList.innerHTML = secondary.characteristics
        .map(char => `<li>${char}</li>`)
        .join('');
}

// 맞춤 제안 메시지 표시
function displayProposal(analysis) {
    const primary = analysis.primary;
    const secondary = analysis.secondary;

    let proposalMessage = `원장님의 병원은 기본적으로 <strong>${primary.keyword}</strong>을 중심으로 하면서도, `;
    proposalMessage += `<strong>${secondary.keyword}</strong>에 대한 관심도 높은 상태입니다.<br><br>`;
    proposalMessage += `그래서 ${primary.name.split('·')[0]}의 장점을 살리면서도 `;
    proposalMessage += `${secondary.name.split('·')[0]}의 요소를 함께 고려하는 방식이 가장 효과적입니다.`;

    document.getElementById('proposalMessage').innerHTML = proposalMessage;
}

// 전략 로드맵 표시
function displayRoadmap(primary) {
    const roadmap = revenueRoadmaps[primary.type];
    const container = document.getElementById('roadmapContainer');

    let html = '';
    roadmap.forEach(step => {
        html += `
            <div style="margin-bottom: 25px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #ffffff); border-left: 4px solid #2563eb; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="background: linear-gradient(135deg, #2563eb, #1e40af); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; margin-right: 15px; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);">
                        ${step.step}
                    </div>
                    <h4 style="margin: 0; color: #2563eb; font-size: 1.15rem; font-weight: bold;">${step.title}</h4>
                </div>
                <p style="margin: 0 0 0 51px; color: #4b5563; line-height: 1.7; font-size: 1rem;">${step.content}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 인쇄 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @media print {
        .btn-primary, .btn-secondary {
            display: none !important;
        }
        footer {
            page-break-before: avoid;
        }
        .report-section {
            page-break-inside: avoid;
        }
        .report-section:first-of-type {
            page-break-before: always;
        }
        #diagnosisSummaryBox {
            page-break-after: always;
        }
    }
`;
document.head.appendChild(style);
