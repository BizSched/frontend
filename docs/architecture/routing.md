# 라우트 설정 (Route Config)

PATH는 별도 객체(`ROUTE_PATHS`)로 관리하며, 각 경로를 메서드 형태로 정의한다 (예: `ROUTE_PATHS.home()`, `ROUTE_PATHS.detail(id)`).

네비게이션 아이템(`NAV_ITEMS`)을 구성할 때는 `id`를 `ROUTE_PATHS`의 key와 동일하게 맞춰서, `ROUTE_PATHS[navItem.id]` 형태로 매핑할 수 있게 한다.
