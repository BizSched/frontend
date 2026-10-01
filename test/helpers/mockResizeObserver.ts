interface ContainerSize {
  width: number;
  height: number;
}

// jsdom은 레이아웃을 계산하지 않아 크기가 0이다. recharts ResponsiveContainer는 크기가 0이면
// 차트를 그리지 않으므로, observe 시점에 브라우저처럼 컨테이너 크기를 알려 준다.
const mockResizeObserver = ({ width, height }: ContainerSize) => {
  class ResizeObserverMock {
    constructor(private callback: ResizeObserverCallback) {}

    observe() {
      this.callback(
        [{ contentRect: { width, height } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }

    unobserve() {}

    disconnect() {}
  }

  global.ResizeObserver = ResizeObserverMock;
};

export { mockResizeObserver };
