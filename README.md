# AI Pricing Simulator

AI 제품의 **모델/API 비용을 계산하고 가격 정책을 설계**하기 위한 대시보드입니다.  
토큰 단가와 퀄리티를 연결해 **가격/마진/과금 정책(One-time · Monthly · Usage)**을 한 번에 비교할 수 있습니다.

## Key Features
- 모델별 **입력/출력 토큰 단가** + 퀄리티(Leaderboard) 매트릭스
- 토큰 구간별 **요청당 원가** 자동 계산
- **마진 램프(5% → 10% → 20%)** 가격 시뮬레이션
- **고객 규모(1k/10k/100k 요청)** 기준 월 비용 계산
- B2C 과금 방식(One-time/Monthly/Usage) 가격 시뮬레이터
- Cheapest / Best‑Quality / Most‑Reasonable 모델 추천
- **모델 라우팅 가중치(예: 70/20/10)** 시뮬레이션
- Pricing Snapshot 상세 페이지
- **Price Decision Maker**: 코드/명세 입력 → 1안/2안/3안 가격 정책 추천 + 사유
- 비용 절감 레버(라우팅, 캐시, 배치 등) 요약

## Pages
- `/index.html`: 메인 대시보드
- `/pricing.html`: Pricing Snapshot
- `/decision.html`: Price Decision Maker

## Local Preview
```bash
python3 -m http.server 8000 --directory src
```
- Dashboard: `http://localhost:8000`
- Pricing Snapshot: `http://localhost:8000/pricing.html`
- Price Decision Maker: `http://localhost:8000/decision.html`

## Deployment
- Vercel: `https://ai-pricing-simulator-qqih.vercel.app/`

## Assumptions
- 환율: **1 USD = 1,450 KRW (기본값, UI에서 변경 가능)**
- 토큰 구간: Small(1k/0.5k), Medium(5k/2k), Large(20k/5k)
- 가격 기준일: **As of 2026-02-03**

## Data & Logic
- `src/assets/data.js`: 모델 단가/퀄리티 데이터
- `src/assets/app.js`: 대시보드 로직
- `src/assets/pricing.js`: Pricing Snapshot 로직
- `src/assets/decision.js`: Price Decision Maker 로직
- `src/assets/styles.css`: 공통 스타일

## Next Ideas
- 최신 API 가격 자동 업데이트
- 실제 사용량 입력/저장 폼 추가
- 비용 추이/모델 비중 차트 추가
