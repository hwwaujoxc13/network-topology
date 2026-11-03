# Network Topology Designer

Spring Boot(H2) 백엔드와 Next.js(React Flow) 프론트로 네트워크 토폴로지를 그리고 저장하는 로컬 웹 서비스입니다.

## 구조

```text
network/
  backend/   Spring Boot REST API (port 8080)
  frontend/  Next.js UI (port 3000)
```

## 사전 요구

- Java 17+
- Node.js 18+ 및 npm
- Gradle (시스템에 설치된 `gradle` 명령 — wrapper JAR 미포함 시)

## 백엔드 실행

```powershell
cd backend
gradle bootRun
```

- API: `http://localhost:8080`
- H2 콘솔: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/topology`
  - User: `sa`, Password: (비움)
- DB 파일: `backend/data/` (Git 제외)

### REST API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/topologies` | 목록 |
| GET | `/api/topologies/{id}` | 상세 + canvas JSON |
| POST | `/api/topologies` | 생성 `{ "name": "...", "canvasData": null }` |
| PUT | `/api/topologies/{id}` | 갱신 `{ "name", "canvasData" }` |
| DELETE | `/api/topologies/{id}` | 삭제 |

`canvasData` 형식: `{ "nodes": [], "edges": [], "viewport": { "x", "y", "zoom" } }`

CORS: `http://localhost:3000` 허용

## 프론트엔드 실행

```powershell
cd frontend
copy .env.example .env.local   # 최초 1회
npm install
npm run dev
```

브라우저: `http://localhost:3000`

환경 변수:

- `NEXT_PUBLIC_API_URL` — 기본 `http://localhost:8080`

## 사용 방법

1. 백엔드를 먼저 실행합니다.
2. 프론트에서 **새 토폴로지** → 에디터에서 좌측 팔레트로 장비 추가.
3. 좌측 **Links** 에서 기본 링크 타입을 고른 뒤, 노드 핸들을 드래그해 연결합니다.
4. 노드를 선택해 상단 **Label** 을 수정합니다.
5. 연결선을 선택해 상단에서 **Link** 타입·라벨(예: 10G, DWDM)을 변경합니다.
6. **저장** 후 목록에서 다시 열어 복원을 확인합니다.

`Delete` / `Backspace` 로 선택한 노드·연결선 삭제.

### 장비 타입

| 카테고리 | 종류 |
|----------|------|
| Endpoint | PC, Server |
| Security | IPS, WIPS, IDS, Firewall, VPN |
| Cloud | Cloud |
| Network | Router, Switch, Gateway, Load Balancer, Access Point, Modem, SD-WAN, Proxy |

### 장비 IP · 패킷 추적

- 장비 클릭 → **우측 패널**에서 이름·IP 입력 (저장 시 `nodes[].data.ipAddress`에 포함)
- **패킷 추적 모드** → 출발지 장비 클릭 → 목적지 장비 클릭 → 최단 홉 경로 하이라이트 (연결 그래프 BFS)

### 링크(회선) 타입

Ethernet, 1G / 10G / 100G, Aggregation (LAG), DWDM, Trunk, Wireless, VPN tunnel, WAN/Internet — 타입별 색·굵기·점선/애니메이션이 다릅니다.

기존에 저장된 토폴로지의 연결선은 **Ethernet** 으로 표시됩니다.

## 빌드

```powershell
cd backend
gradle build

cd ../frontend
npm run build
```
