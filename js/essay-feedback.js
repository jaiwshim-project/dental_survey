// 주관식 답변 키워드 분석 및 맞춤형 피드백 생성

// 키워드 데이터베이스
const keywordDatabase = {
    // Q26: 현재 고민 키워드
    concerns: {
        '환자유치': ['환자 유치', '신환', '신규 환자', '환자 모집', '환자 확보', '환자 증가', '내원 감소'],
        '직원관리': ['직원 관리', '인력', '직원 교육', '간호사', '상담사', '채용', '이직', '팀워크', '직원 역량'],
        '수익개선': ['수익', '매출', '수익성', '결정률', '치료 결정', '상담 전환', '케이스 수락률'],
        '상담효율': ['상담', '상담 시간', '상담 효율', '설명', '환자 설득', '커뮤니케이션'],
        '진료시스템': ['진료 시스템', '프로세스', '시스템화', '체계', '운영 효율', '업무 효율'],
        '마케팅': ['마케팅', '홍보', '광고', '브랜딩', '온라인', 'SNS', '블로그'],
        '장비시설': ['장비', '시설', '인테리어', '공간', '환경'],
        '환자만족': ['환자 만족', '환자 경험', '서비스 품질', '재방문', '후기', '입소문'],
        '경쟁': ['경쟁', '타 병원', '차별화', '비교']
    },

    // Q27: 3년 후 비전 키워드
    vision: {
        '확장성장': ['확장', '성장', '분원', '규모', '대형화'],
        '지역대표': ['지역', '대표', '유명', '1위', '최고'],
        '전문화': ['전문', '전문성', '기술', '임플란트', '심미', '교정'],
        '브랜드': ['브랜드', '인지도', '이미지', '신뢰'],
        '환자중심': ['환자 중심', '환자 만족', '추천', '충성도'],
        '직원만족': ['직원', '팀', '일하기 좋은', '자부심', '조직 문화'],
        '시스템화': ['시스템', '체계', '안정', '표준화'],
        '사회기여': ['사회', '지역 사회', '문화', '기여', '봉사'],
        '수익안정': ['안정', '수익', '지속 가능']
    },

    // Q28: 투자 우선순위 키워드
    investment: {
        '장비투자': ['장비', '기계', '디지털', 'CT', '스캐너', '레이저'],
        '인력투자': ['인력', '인재', '직원', '채용', '간호사', '상담사'],
        '마케팅투자': ['마케팅', '광고', '홍보', 'SNS', '온라인'],
        '교육투자': ['교육', '연수', '세미나', '학회', '코칭', '컨설팅', '훈련'],
        '인테리어': ['인테리어', '리모델링', '공간', '환경', '시설', '분위기'],
        '시스템투자': ['시스템', '소프트웨어', '프로그램', '자동화', 'AI', '디지털화'],
        '환자경험': ['환자 경험', '환자 만족', '서비스', '편의']
    }
};

// 키워드별 맞춤 피드백
const feedbackDatabase = {
    concerns: {
        '환자유치': {
            problem: '신규 환자 유치에 어려움을 겪고 계시는군요.',
            solution: '통합 마케팅 전략과 함께 기존 환자의 추천율을 높이는 것이 가장 효과적입니다. 5단계 환자 상담 프로세스로 환자 만족도를 극대화하면, 환자들이 자발적으로 병원을 추천하게 되어 마케팅 비용 대비 신환 유입 효율이 크게 향상됩니다.',
            action: '▸ 1단계: 기존 환자 만족도 향상 → 추천율 증대\n▸ 2단계: 원장 브랜딩(신문기사/영상)으로 신뢰도 구축\n▸ 3단계: 통합 온라인 마케팅으로 타겟 신환 유입'
        },
        '직원관리': {
            problem: '직원 관리와 역량 강화가 필요한 시점입니다.',
            solution: '직원들의 환자 응대 역량이 병원 수익과 직결됩니다. 원장님이 먼저 5단계 상담 프로세스를 체득하신 후, 동일한 프로세스를 직원들에게 전수하면 팀 전체의 역량이 균질화되고 일관된 고품질 서비스를 제공할 수 있습니다.',
            action: '▸ 1단계: 원장님 상담 코칭 및 내재화\n▸ 2단계: 간호사·상담사 대상 동일 프로세스 교육\n▸ 3단계: 표준 매뉴얼화 및 정기 피드백 체계 구축'
        },
        '수익개선': {
            problem: '수익성 개선이 시급한 과제로 보입니다.',
            solution: '수익 개선의 핵심은 치료 결정률 향상입니다. 5단계 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계)를 적용하면, 같은 시간 투입으로도 결정률이 20-30% 향상되어 즉각적인 수익 증대 효과를 볼 수 있습니다.',
            action: '▸ 1단계: 상담 프로세스 최적화로 결정률 향상\n▸ 2단계: 데이터 기반 상담 관리 시스템 도입\n▸ 3단계: KPI 모니터링 및 지속적 개선'
        },
        '상담효율': {
            problem: '상담 효율성 개선이 필요한 상황이군요.',
            solution: '상담 시간 대비 결과가 좋지 않다면, 상담 구조 자체를 개선해야 합니다. 5단계 상담 프로세스는 환자의 결정 심리를 과학적으로 설계하여, 상담 시간은 단축하면서도 결정률은 높이는 효과가 있습니다.',
            action: '▸ 1단계: 5단계 상담 프로세스 집중 코칭\n▸ 2단계: 상담 스크립트 및 자료 최적화\n▸ 3단계: AI 상담 분석 도구로 개선점 파악'
        },
        '진료시스템': {
            problem: '진료 시스템 체계화가 필요합니다.',
            solution: '체계적인 시스템은 운영 효율을 높이고 직원 부담을 줄입니다. 환자 상담 프로세스를 먼저 표준화한 후, 단계적으로 전체 진료 프로세스를 시스템화하면 예측 가능한 운영이 가능해집니다.',
            action: '▸ 1단계: 상담 프로세스 표준화 및 문서화\n▸ 2단계: 환자 여정 전체 프로세스 설계\n▸ 3단계: 디지털 시스템 도입 및 자동화'
        },
        '마케팅': {
            problem: '마케팅 강화가 필요한 시기입니다.',
            solution: '마케팅은 단순 노출이 아니라 신뢰 구축입니다. 원장님의 철학과 가치관을 담은 브랜딩(신문기사/영상)을 먼저 진행하고, 이를 기반으로 통합 온라인 마케팅을 전개하면 단순 광고보다 훨씬 높은 전환율을 얻을 수 있습니다.',
            action: '▸ 1단계: 원장 브랜딩(철학·가치관 콘텐츠 제작)\n▸ 2단계: 환자 후기 및 사례 체계적 관리\n▸ 3단계: 통합 온라인 마케팅(검색·SNS·블로그)'
        },
        '장비시설': {
            problem: '장비와 시설 개선을 고려하고 계시는군요.',
            solution: '장비 투자는 필요하지만, 그보다 먼저 현재 장비로 가능한 진료의 결정률을 높이는 것이 우선입니다. 상담 역량을 먼저 강화하면 장비 투자 대비 ROI가 훨씬 높아집니다.',
            action: '▸ 1단계: 현재 진료 역량의 결정률 최대화\n▸ 2단계: ROI 분석 후 장비 투자 우선순위 결정\n▸ 3단계: 신규 장비 도입 시 마케팅과 연계'
        },
        '환자만족': {
            problem: '환자 만족도 향상이 중요한 과제입니다.',
            solution: '환자 만족의 핵심은 진료 결과뿐 아니라 전체 경험입니다. 상담부터 치료, 사후 관리까지 일관된 고품질 경험을 제공하면 재방문율과 추천율이 크게 향상됩니다.',
            action: '▸ 1단계: 5단계 상담으로 신뢰 기반 관계 구축\n▸ 2단계: 환자 여정 전체 경험 설계 및 최적화\n▸ 3단계: 환자 피드백 시스템 구축 및 지속 개선'
        },
        '경쟁': {
            problem: '타 병원과의 경쟁이 치열한 상황입니다.',
            solution: '가격 경쟁이 아닌 가치 경쟁으로 전환해야 합니다. 원장님만의 철학과 전문성을 브랜딩하고, 환자 경험을 차별화하면 "가장 비싸도 가고 싶은 치과"가 될 수 있습니다.',
            action: '▸ 1단계: 원장 브랜딩으로 차별화된 가치 제시\n▸ 2단계: AI 갤러리 등 독특한 환자 경험 제공\n▸ 3단계: 지역 사회 문화 기여로 브랜드 이미지 구축'
        }
    },

    vision: {
        '확장성장': {
            vision: '빠른 확장과 성장을 목표로 하시는군요.',
            strategy: '확장 전에 현재 병원의 시스템을 완벽하게 구축하는 것이 중요합니다. 표준화된 상담·진료 프로세스와 검증된 수익 모델이 있어야 분원 확장 시에도 동일한 품질을 유지하고 성공 확률을 높일 수 있습니다.',
            priority: '현재 병원 시스템화 → 수익 모델 검증 → 확장 전략 수립'
        },
        '지역대표': {
            vision: '지역을 대표하는 치과가 되고자 하시는군요.',
            strategy: '지역 대표 치과는 단순 규모가 아니라 신뢰와 브랜드로 만들어집니다. 원장 브랜딩, 환자 경험 차별화, 지역 사회 기여 활동을 통해 "이 지역 최고의 치과"라는 포지셔닝을 확립할 수 있습니다.',
            priority: '원장 브랜딩 → 환자 만족도 극대화 → 지역 사회 기여 활동'
        },
        '전문화': {
            vision: '특정 분야 전문화를 지향하시는군요.',
            strategy: '전문화는 강력한 차별화 전략입니다. 전문 분야에서 원장님의 실력과 철학을 브랜딩하고, 해당 분야 환자들에게 최고의 경험을 제공하면 지역을 넘어 광역 환자 유입이 가능합니다.',
            priority: '전문 분야 브랜딩 → 전문 상담 프로세스 구축 → 특화 마케팅'
        },
        '브랜드': {
            vision: '강력한 브랜드 구축을 목표로 하시는군요.',
            strategy: '브랜드는 광고가 아니라 일관된 경험과 가치로 만들어집니다. 원장님의 철학을 담은 콘텐츠(신문기사/영상), 차별화된 환자 경험(AI 갤러리 등), 일관된 고품질 서비스가 결합되어야 합니다.',
            priority: '원장 철학 콘텐츠화 → 차별화 경험 구축 → 환자 후기 관리'
        },
        '환자중심': {
            vision: '환자 중심 병원을 만들고자 하시는군요.',
            strategy: '환자 중심은 단순 친절이 아니라 환자가 진정으로 원하는 것을 이해하고 제공하는 것입니다. 5단계 상담 프로세스로 환자 니즈를 깊이 파악하고, 맞춤형 솔루션을 제공하면 환자 추천율이 크게 높아집니다.',
            priority: '환자 니즈 파악 역량 강화 → 맞춤형 서비스 설계 → 사후 케어 체계화'
        },
        '직원만족': {
            vision: '직원들도 만족하는 조직을 만들고자 하시는군요.',
            strategy: '직원 만족의 핵심은 명확한 비전, 체계적 교육, 공정한 평가입니다. 원장님의 철학을 직원들과 공유하고, 역량 개발 기회를 제공하며, 성과를 인정하는 문화를 만들어야 합니다.',
            priority: '비전 공유 → 체계적 교육 프로그램 → 성과 인정 문화'
        },
        '시스템화': {
            vision: '체계적인 시스템 구축을 목표로 하시는군요.',
            strategy: '시스템화는 안정적 성장의 기반입니다. 상담·진료·관리 프로세스를 표준화하고, 데이터 기반으로 의사결정하며, 누가 해도 일정 수준 이상의 결과가 나오는 체계를 만들어야 합니다.',
            priority: '핵심 프로세스 표준화 → 데이터 관리 체계 → 지속 개선 시스템'
        },
        '사회기여': {
            vision: '지역 사회에 기여하는 치과가 되고자 하시는군요.',
            strategy: '사회 기여는 브랜드 가치를 높이는 강력한 전략입니다. AI 갤러리를 지역에 공개하거나, 의료 봉사, 문화 행사 지원 등을 통해 "우리 지역의 자랑스러운 치과"로 포지셔닝할 수 있습니다.',
            priority: '문화 기여 활동(AI 갤러리 등) → 지역 사회 연계 → 브랜드 홍보'
        },
        '수익안정': {
            vision: '안정적이고 지속 가능한 수익을 추구하시는군요.',
            strategy: '수익 안정은 시스템과 신뢰에서 나옵니다. 일회성 마케팅보다는 재방문율과 추천율을 높여 안정적인 환자 기반을 구축하고, 체계적 운영으로 예측 가능한 수익 구조를 만들어야 합니다.',
            priority: '재방문·추천 체계 구축 → 시스템 기반 운영 → 데이터 기반 예측'
        }
    },

    investment: {
        '장비투자': {
            priority: '장비 투자를 우선순위로 두고 계시는군요.',
            advice: '장비는 필요하지만, 장비만으로는 수익이 보장되지 않습니다. 장비 투자 전에 현재 진료 역량의 상담 결정률을 먼저 높이면, 같은 장비 투자로도 훨씬 높은 ROI를 달성할 수 있습니다.',
            sequence: '1순위: 상담 역량 강화 → 2순위: ROI 높은 장비 선택 투자 → 3순위: 장비 활용 마케팅'
        },
        '인력투자': {
            priority: '인력 투자를 중요하게 생각하시는군요.',
            advice: '우수한 인력은 병원의 자산입니다. 하지만 채용보다 중요한 것은 기존 인력의 역량 강화입니다. 체계적 교육으로 현재 직원들이 성장하면, 신규 채용의 필요성도 줄어들고 팀 안정성도 높아집니다.',
            sequence: '1순위: 기존 직원 교육 및 역량 강화 → 2순위: 표준 프로세스 구축 → 3순위: 필요 시 신규 채용'
        },
        '마케팅투자': {
            priority: '마케팅 투자를 고려하고 계시는군요.',
            advice: '마케팅 투자 전에 내부 역량을 먼저 강화해야 합니다. 마케팅으로 환자가 와도 상담 결정률이 낮으면 비용만 증가합니다. 상담 프로세스를 먼저 최적화한 후 마케팅하면 투자 대비 효과가 극대화됩니다.',
            sequence: '1순위: 상담 결정률 향상 → 2순위: 원장 브랜딩 → 3순위: 통합 마케팅 전개'
        },
        '교육투자': {
            priority: '교육 투자를 우선시하시는군요.',
            advice: '교육 투자는 가장 ROI가 높은 투자입니다. 특히 원장님이 먼저 5단계 상담 프로세스를 체득하고, 이를 직원들에게 전수하면 팀 전체의 역량이 단기간에 크게 향상되어 즉각적인 수익 개선 효과를 볼 수 있습니다.',
            sequence: '1순위: 원장 상담 코칭 → 2순위: 직원 교육 프로그램 → 3순위: 지속적 역량 개발 체계'
        },
        '인테리어': {
            priority: '인테리어 투자를 계획하고 계시는군요.',
            advice: '인테리어는 환자 경험에 중요하지만, 단순 미관보다는 차별화가 핵심입니다. AI 갤러리 & AI 아트 시네마 같은 독특한 요소를 도입하면, 인테리어가 곧 브랜딩이 되어 환자 심리 안정과 마케팅 효과를 동시에 얻을 수 있습니다.',
            sequence: '1순위: 차별화 요소 기획(AI 갤러리 등) → 2순위: 환자 동선 최적화 설계 → 3순위: 인테리어 실행 및 홍보'
        },
        '시스템투자': {
            priority: '디지털 시스템 투자를 고려하시는군요.',
            advice: '시스템 투자는 장기적으로 효율을 높입니다. AI 기반 상담 분석 시스템, 환자 관리 시스템 등을 단계적으로 도입하되, 먼저 프로세스를 표준화한 후 시스템화해야 실효성이 높습니다.',
            sequence: '1순위: 프로세스 표준화 → 2순위: 핵심 시스템 도입(상담 분석 등) → 3순위: 전체 시스템 통합'
        },
        '환자경험': {
            priority: '환자 경험 투자를 우선시하시는군요.',
            advice: '환자 경험 투자는 재방문율과 추천율을 직접 높이는 최고의 투자입니다. 상담 프로세스 개선, 대기 환경 차별화, 사후 케어 강화를 통합적으로 진행하면 마케팅 비용을 줄이면서도 환자가 늘어나는 선순환이 만들어집니다.',
            sequence: '1순위: 상담 경험 혁신 → 2순위: 대기·치료 환경 차별화 → 3순위: 사후 케어 체계화'
        }
    }
};

// 키워드 추출 함수
function extractKeywords(text, category) {
    if (!text || text.trim().length === 0) return [];

    const keywords = [];
    const lowerText = text.toLowerCase();

    const categoryKeywords = keywordDatabase[category];

    for (const [key, patterns] of Object.entries(categoryKeywords)) {
        for (const pattern of patterns) {
            if (lowerText.includes(pattern.toLowerCase())) {
                keywords.push(key);
                break;
            }
        }
    }

    return [...new Set(keywords)]; // 중복 제거
}

// 맞춤형 피드백 생성 함수
function generateCustomFeedback(essayAnswers, primaryType, secondaryType) {
    if (!essayAnswers || essayAnswers.length !== 3) {
        return null;
    }

    // 각 답변에서 키워드 추출
    const concernKeywords = extractKeywords(essayAnswers[0], 'concerns');
    const visionKeywords = extractKeywords(essayAnswers[1], 'vision');
    const investmentKeywords = extractKeywords(essayAnswers[2], 'investment');

    // 키워드가 하나도 없으면 null 반환
    if (concernKeywords.length === 0 && visionKeywords.length === 0 && investmentKeywords.length === 0) {
        return null;
    }

    // 피드백 생성
    const feedback = {
        hasFeedback: true,
        concerns: [],
        vision: [],
        investment: [],
        overallMessage: '',
        actionPlan: []
    };

    // Q26 피드백
    concernKeywords.forEach(keyword => {
        if (feedbackDatabase.concerns[keyword]) {
            feedback.concerns.push(feedbackDatabase.concerns[keyword]);
        }
    });

    // Q27 피드백
    visionKeywords.forEach(keyword => {
        if (feedbackDatabase.vision[keyword]) {
            feedback.vision.push(feedbackDatabase.vision[keyword]);
        }
    });

    // Q28 피드백
    investmentKeywords.forEach(keyword => {
        if (feedbackDatabase.investment[keyword]) {
            feedback.investment.push(feedbackDatabase.investment[keyword]);
        }
    });

    // 종합 메시지 생성
    feedback.overallMessage = generateOverallMessage(
        concernKeywords,
        visionKeywords,
        investmentKeywords,
        primaryType,
        secondaryType
    );

    // 통합 액션 플랜 생성
    feedback.actionPlan = generateIntegratedActionPlan(
        concernKeywords,
        visionKeywords,
        investmentKeywords,
        primaryType
    );

    return feedback;
}

// 종합 메시지 생성
function generateOverallMessage(concernKeywords, visionKeywords, investmentKeywords, primaryType, secondaryType) {
    let message = `<strong>${primaryType.fullName}</strong>을 주 유형으로 가진 원장님의 답변을 분석한 결과, `;

    // 현재 고민 요약
    if (concernKeywords.length > 0) {
        const concerns = concernKeywords.slice(0, 2).map(k => {
            const names = {
                '환자유치': '신환 유치',
                '직원관리': '직원 역량 관리',
                '수익개선': '수익성 개선',
                '상담효율': '상담 효율성',
                '진료시스템': '진료 시스템 체계화',
                '마케팅': '마케팅 강화',
                '장비시설': '장비·시설 개선',
                '환자만족': '환자 만족도 향상',
                '경쟁': '경쟁 대응'
            };
            return names[k] || k;
        });
        message += `<strong style="color: #f59e0b;">${concerns.join(', ')}</strong>에 대한 고민이 있으시며, `;
    }

    // 비전 요약
    if (visionKeywords.length > 0) {
        const visions = visionKeywords.slice(0, 2).map(k => {
            const names = {
                '확장성장': '확장과 성장',
                '지역대표': '지역 대표 치과',
                '전문화': '전문화',
                '브랜드': '브랜드 구축',
                '환자중심': '환자 중심 병원',
                '직원만족': '직원 만족도',
                '시스템화': '시스템화',
                '사회기여': '사회 기여',
                '수익안정': '안정적 수익'
            };
            return names[k] || k;
        });
        message += `<strong style="color: #8b5cf6;">${visions.join('과 ')}</strong>을 목표로 하고 계십니다. `;
    }

    // 투자 우선순위 요약
    if (investmentKeywords.length > 0) {
        const investments = investmentKeywords.slice(0, 2).map(k => {
            const names = {
                '장비투자': '장비',
                '인력투자': '인력',
                '마케팅투자': '마케팅',
                '교육투자': '교육',
                '인테리어': '인테리어',
                '시스템투자': '시스템',
                '환자경험': '환자 경험'
            };
            return names[k] || k;
        });
        message += `투자 우선순위는 <strong style="color: #10b981;">${investments.join('과 ')}</strong>으로 파악됩니다.`;
    }

    return message;
}

// 통합 액션 플랜 생성
function generateIntegratedActionPlan(concernKeywords, visionKeywords, investmentKeywords, primaryType) {
    const plan = [];

    // 원장님 답변 기반으로 맞춤형 플랜 생성

    // 1단계: 항상 포함 - 원장 역량 강화
    plan.push({
        phase: '1단계',
        title: '원장님 상담 역량 집중 강화',
        content: '5단계 환자 상담 프로세스(공감→이해→결정권 제공→가치 전달→신뢰 관계 형성)를 완전히 체득하여, 현재의 고민을 해결하는 핵심 역량을 확보합니다. 이는 모든 개선의 출발점입니다.',
        duration: '2-4주',
        expectedResult: '상담 결정률 20-30% 향상, 환자 신뢰도 증대'
    });

    // 2단계: 고민 키워드 기반
    let phase2Content = '';
    if (concernKeywords.includes('직원관리')) {
        phase2Content = '원장님이 체득한 5단계 상담 프로세스를 간호사·상담사에게 전수하고, 팀 전체의 환자 응대 역량을 균질화합니다. 표준 매뉴얼을 작성하여 일관된 고품질 서비스를 제공하는 체계를 구축합니다.';
    } else if (concernKeywords.includes('상담효율') || concernKeywords.includes('수익개선')) {
        phase2Content = '원장님이 체득한 상담 프로세스를 간호사·상담사에게 전수하고, 데이터 기반 상담 관리 시스템을 도입하여 상담 효율과 결정률을 동시에 향상시킵니다.';
    } else {
        phase2Content = '원장님이 체득한 5단계 상담 프로세스를 간호사·상담사에게 전수하고, 팀 전체가 동일한 수준의 상담 역량을 갖추도록 교육합니다.';
    }

    plan.push({
        phase: '2단계',
        title: '팀 역량 확산 및 시스템화',
        content: phase2Content,
        duration: '1-2개월',
        expectedResult: '팀 전체 상담 품질 향상, 운영 효율 개선'
    });

    // 3단계: 비전 & 투자 키워드 기반
    let phase3Content = '';
    if (visionKeywords.includes('브랜드') || concernKeywords.includes('마케팅')) {
        phase3Content = '원장님의 철학과 가치관을 담은 콘텐츠(신문기사/영상)를 제작하여 원장 브랜딩을 시작합니다. ';
        if (investmentKeywords.includes('인테리어')) {
            phase3Content += 'AI 갤러리 & AI 아트 시네마를 설치하여 환자 심리 안정 공간을 구축하고, 지역 사회에 공개하여 문화 기여 브랜딩을 전개합니다.';
        } else {
            phase3Content += '환자 후기 관리를 체계화하고, 통합 온라인 마케팅으로 브랜드 인지도를 확산시킵니다.';
        }
    } else if (visionKeywords.includes('환자중심') || investmentKeywords.includes('환자경험')) {
        phase3Content = '환자 여정 전체(상담→치료→사후 관리)를 재설계하여 차별화된 환자 경험을 제공합니다. 환자 피드백 시스템을 구축하고, AI 갤러리 같은 독특한 요소로 환자 만족도를 극대화합니다.';
    } else if (visionKeywords.includes('시스템화') || concernKeywords.includes('진료시스템')) {
        phase3Content = '상담·진료·관리 프로세스를 완전히 표준화하고, 데이터 기반 의사결정 시스템을 구축하여 예측 가능하고 안정적인 운영 체계를 완성합니다.';
    } else {
        phase3Content = '원장 브랜딩(철학·가치관 콘텐츠)을 진행하고, 차별화된 환자 경험 요소(AI 갤러리 등)를 도입하여 브랜드 가치를 높입니다.';
    }

    plan.push({
        phase: '3단계',
        title: '차별화 브랜딩 구축',
        content: phase3Content,
        duration: '2-3개월',
        expectedResult: '브랜드 인지도 상승, 환자 만족도 극대화'
    });

    // 4단계: 항상 포함 - 성장 가속화
    let phase4Content = '통합 마케팅으로 타겟 신환을 유입하고, 5단계 상담 프로세스로 고정 환자로 전환합니다. ';
    if (visionKeywords.includes('확장성장')) {
        phase4Content += '현재 병원의 시스템과 수익 모델이 검증되면, 분원 확장 등 성장 전략을 본격적으로 실행합니다.';
    } else if (visionKeywords.includes('지역대표')) {
        phase4Content += '지역 사회와의 연계를 강화하고, "이 지역 최고의 치과"로 확고한 브랜드 포지셔닝을 완성합니다.';
    } else {
        phase4Content += '데이터 기반으로 지속적으로 최적화하여 안정적이고 지속 가능한 성장 체계를 구축합니다.';
    }

    plan.push({
        phase: '4단계',
        title: '성장 가속화 및 목표 달성',
        content: phase4Content,
        duration: '3-6개월',
        expectedResult: '신환 유입 증가, 재방문율·추천율 향상, 목표 달성'
    });

    return plan;
}
