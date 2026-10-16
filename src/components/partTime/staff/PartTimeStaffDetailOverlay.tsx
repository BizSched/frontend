'use client';

import {
  overlay,
  type OverlayControllerComponent,
  useOverlayData,
} from 'overlay-kit';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  PartTimeStaffDetailPanel,
  type PartTimeStaffDetailPanelProps,
} from '@components/partTime/staff/PartTimeStaffDetailPanel';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

type PartTimeStaffDetailOverlayProps = Omit<
  PartTimeStaffDetailPanelProps,
  'stackIndex' | 'isObscured' | 'onExitComplete'
>;

const createPanelStore = (initialProps: PartTimeStaffDetailOverlayProps) => {
  let snapshot = initialProps;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update: (props: PartTimeStaffDetailOverlayProps) => {
      snapshot = props;
      listeners.forEach((listener) => listener());
    },
  };
};

interface PartTimeStaffDetailControllerProps {
  store: ReturnType<typeof createPanelStore>;
  overlayId: string;
  isOpen: boolean;
  onExitComplete: () => void;
}

function PartTimeStaffDetailController({
  store,
  overlayId,
  isOpen,
  onExitComplete,
}: PartTimeStaffDetailControllerProps) {
  const props = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const stackIndex = useOverlayStackIndex(overlayId);
  const overlays = useOverlayData();
  const isObscured = Object.values(overlays)
    .slice(stackIndex + 1)
    .some(({ isMounted }) => isMounted);

  return (
    <PartTimeStaffDetailPanel
      {...props}
      open={props.open && isOpen}
      stackIndex={stackIndex}
      isObscured={isObscured}
      onExitComplete={onExitComplete}
    />
  );
}

function PartTimeStaffDetailOverlay(props: PartTimeStaffDetailOverlayProps) {
  // NOTE: overlay-kit에 보관된 컨트롤러에도 URL·쿼리·mutation의 최신 props를 전달한다.
  const [store] = useState(() => createPanelStore(props));
  const overlayId = useRef<string | undefined>(undefined);

  useLayoutEffect(() => store.update(props), [props, store]);

  useEffect(() => {
    if (!props.open) {
      if (overlayId.current) overlay.close(overlayId.current);
      return;
    }

    if (overlayId.current) overlay.unmount(overlayId.current);
    const controller: OverlayControllerComponent = ({
      overlayId: id,
      isOpen,
      unmount,
    }) => (
      <PartTimeStaffDetailController
        store={store}
        overlayId={id}
        isOpen={isOpen}
        onExitComplete={() => {
          if (overlayId.current === id) overlayId.current = undefined;
          unmount();
        }}
      />
    );
    overlayId.current = overlay.open(controller);
  }, [props.open, store]);

  useEffect(
    () => () => {
      if (overlayId.current) {
        overlay.unmount(overlayId.current);
        overlayId.current = undefined;
      }
    },
    [],
  );

  return null;
}

export { PartTimeStaffDetailOverlay };
