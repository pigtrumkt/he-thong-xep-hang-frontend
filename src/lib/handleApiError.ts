export function handleApiError(
  res: { status: number },
  showMessage: (msg: string) => void,
  router: any // hoặc bỏ luôn type
) {
  if (res.status === 0) {
    showMessage("Mất kết nối mạng hoặc máy chủ không phản hồi.");
    return;
  }

  if (res.status === 401) {
    router.push("/login");
    return;
  }

  if (res.status >= 500) {
    showMessage("Lỗi hệ thống. Vui lòng thử lại sau.");
    return;
  }
}
