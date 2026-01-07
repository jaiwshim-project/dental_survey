// 병원 수익 단계별 5유형 진단 질문 데이터

const revenueQuestions = [
    // 1️⃣ 수익·환자 흐름 진단 (Q1~Q4)
    {
        id: 1,
        category: "수익·환자 흐름 진단",
        question: "최근 6개월간 병원 상황을 가장 잘 표현한 문장은 무엇입니까?",
        options: [
            { type: '1', text: "환자가 눈에 띄게 줄었거나, 예전 같지 않다고 느낀다" },
            { type: '2', text: "어떤 달은 괜찮고, 어떤 달은 불안하다" },
            { type: '3', text: "환자는 많은데 하루가 너무 버겁다" },
            { type: '4', text: "매출은 안정적이고, 다음 단계를 고민 중이다" },
            { type: '5', text: "매출보다 병원 이미지와 신뢰가 더 중요하다" }
        ]
    },
    {
        id: 2,
        category: "수익·환자 흐름 진단",
        question: "요즘 병원에서 가장 신경 쓰이는 것은 무엇입니까?",
        options: [
            { type: '1', text: "왜 환자가 안 오는지 모르겠다" },
            { type: '2', text: "상담 결과가 들쑥날쑥하다" },
            { type: '3', text: "상담과 설명에 너무 많은 에너지가 든다" },
            { type: '4', text: "이 구조로 확장해도 괜찮을지 고민된다" },
            { type: '5', text: "지금의 신뢰 이미지를 어떻게 유지할지 고민된다" }
        ]
    },
    {
        id: 3,
        category: "수익·환자 흐름 진단",
        question: "매출 흐름을 한 단어로 표현한다면?",
        options: [
            { type: '1', text: "감소" },
            { type: '2', text: "변동" },
            { type: '3', text: "과부하" },
            { type: '4', text: "안정" },
            { type: '5', text: "선택적" }
        ]
    },
    {
        id: 4,
        category: "수익·환자 흐름 진단",
        question: "현재 가장 두려운 상황은 무엇입니까?",
        options: [
            { type: '1', text: "환자가 더 줄어드는 것" },
            { type: '2', text: "매출이 예측 불가능해지는 것" },
            { type: '3', text: "내가 빠지면 병원이 흔들리는 것" },
            { type: '4', text: "확장 후 품질이 무너지는 것" },
            { type: '5', text: "신뢰 이미지가 훼손되는 것" }
        ]
    },
    // 2️⃣ 상담·운영 구조 진단 (Q5~Q9)
    {
        id: 5,
        category: "상담·운영 구조 진단",
        question: "상담 결과가 좋지 않을 때 가장 먼저 떠오르는 이유는?",
        options: [
            { type: '1', text: "환자가 비용 부담을 느낀 것 같다" },
            { type: '2', text: "상담사마다 설명이 다르다" },
            { type: '3', text: "설명할 시간이 부족하다" },
            { type: '4', text: "기준이 명확히 정리되지 않았다" },
            { type: '5', text: "환자가 충분히 신뢰하지 못했다" }
        ]
    },
    {
        id: 6,
        category: "상담·운영 구조 진단",
        question: "상담 과정에서 원장님의 개입 정도는?",
        options: [
            { type: '1', text: "거의 혼자 다 한다" },
            { type: '2', text: "상황에 따라 다르다" },
            { type: '3', text: "자주 개입해야 마음이 놓인다" },
            { type: '4', text: "기준만 잡아주고 빠지는 편이다" },
            { type: '5', text: "웬만하면 개입하지 않는다" }
        ]
    },
    {
        id: 7,
        category: "상담·운영 구조 진단",
        question: "상담이 끝난 뒤 가장 자주 드는 생각은?",
        options: [
            { type: '1', text: '"왜 안 했을까…"' },
            { type: '2', text: '"이번엔 누가 상담했지?"' },
            { type: '3', text: '"이걸 내가 또 설명했네"' },
            { type: '4', text: '"이 구조로 커도 괜찮을까?"' },
            { type: '5', text: '"환자가 어떻게 느꼈을까?"' }
        ]
    },
    {
        id: 8,
        category: "상담·운영 구조 진단",
        question: "직원 상담 역량에 대한 생각은?",
        options: [
            { type: '1', text: "솔직히 많이 불안하다" },
            { type: '2', text: "사람마다 차이가 크다" },
            { type: '3', text: "교육해도 유지가 안 된다" },
            { type: '4', text: "기준만 있으면 해결될 문제다" },
            { type: '5', text: "태도와 공감이 가장 중요하다" }
        ]
    },
    {
        id: 9,
        category: "상담·운영 구조 진단",
        question: "상담 개선의 1차 목표는 무엇입니까?",
        options: [
            { type: '1', text: "환자 이탈을 줄이는 것" },
            { type: '2', text: "상담 결과를 일정하게 만드는 것" },
            { type: '3', text: "원장 부담을 줄이는 것" },
            { type: '4', text: "확장 가능한 구조를 만드는 것" },
            { type: '5', text: "환자 신뢰 경험을 지키는 것" }
        ]
    },
    // 3️⃣ AI·솔루션 수용도 진단 (Q10~Q12)
    {
        id: 10,
        category: "AI·솔루션 수용도 진단",
        question: "AI·시스템 도입을 고려하는 가장 큰 이유는?",
        options: [
            { type: '1', text: "환자를 다시 붙잡고 싶어서" },
            { type: '2', text: "상담 편차를 줄이고 싶어서" },
            { type: '3', text: "반복 설명을 줄이고 싶어서" },
            { type: '4', text: "병원 구조를 키우기 위해" },
            { type: '5', text: "상담의 질을 지키기 위해" }
        ]
    },
    {
        id: 11,
        category: "AI·솔루션 수용도 진단",
        question: "AI 도입에 대한 현재 감정은?",
        options: [
            { type: '1', text: "솔직히 절박하다" },
            { type: '2', text: "필요성은 느낀다" },
            { type: '3', text: "도움이 된다면 환영" },
            { type: '4', text: "확장에 필요하다" },
            { type: '5', text: "신중하게 검토하고 싶다" }
        ]
    },
    {
        id: 12,
        category: "AI·솔루션 수용도 진단",
        question: "이 솔루션을 도입한다면 가장 기대되는 변화는?",
        options: [
            { type: '1', text: "환자가 다시 선택해주는 것" },
            { type: '2', text: "상담 결과가 안정되는 것" },
            { type: '3', text: "내가 덜 개입해도 되는 것" },
            { type: '4', text: "확장 가능한 기준이 생기는 것" },
            { type: '5', text: "병원 신뢰가 더 단단해지는 것" }
        ]
    }
];
