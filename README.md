# Cost Manager for AI

AI 제품 개발 과정에서 발생하는 **모델/API 비용을 계산하고 가격 전략을 설계**하기 위한 대시보드입니다.

## What’s Included
- 모델 티어별 **요청당 원가 계산** (토큰 구간/환율 반영)
- **마진 램프(5% → 10% → 20%)** 기반 가격 시뮬레이션
- **고객 규모(1k/10k/100k 요청)** 기준 월 비용 계산
- B2C 과금 방식(일회성/월정액/사용량) 가격 시뮬레이터
- Cheapest/Best-Quality/Most-Reasonable 모델 추천
- 모델 라우팅 가중치(예: 70/20/10) 시뮬레이션
- Pricing Snapshot 상세 페이지
- Price Decision Maker 서브페이지 (1안/2안/3안 가격 정책 추천)
- API 비용 절감 옵션 요약

## Local Preview
```bash
python3 -m http.server 8000 --directory src
```
- Dashboard: http://localhost:8000
- Pricing Snapshot: http://localhost:8000/pricing.html

## Assumptions
- 환율: **1 USD = 1,450 KRW (기본값, UI에서 변경 가능)**
- 토큰 구간: Small(1k/0.5k), Medium(5k/2k), Large(20k/5k)
- 가격 기준일: **As of 2026-02-03**

## Structure
- `src/index.html`: 메인 대시보드
- `src/pricing.html`: Pricing Snapshot 상세
- `src/assets/styles.css`: 스타일
- `src/assets/app.js`: 대시보드 로직
- `src/assets/pricing.js`: 상세 페이지 로직

## Next Ideas
- 최신 API 가격 자동 업데이트
- 실제 사용량 입력/저장 폼 추가
- 비용 추이/모델 비중 차트 추가
