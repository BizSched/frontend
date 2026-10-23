const OBJECT_URL_REVOKE_DELAY_MS = 1000;

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // NOTE: 클릭 직후 해제하면 Safari·Firefox에서 다운로드가 시작되기 전에 URL이 사라질 수 있다
  setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS);
};

export { downloadBlob };
