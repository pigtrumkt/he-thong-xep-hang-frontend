import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function handleApiError(
  res: { status: number },
  showMessage: (options: { title?: string; description?: string }) => void,
  router: AppRouterInstance
) {
  if (res.status === 0) {
    showMessage({
      title: "Mất kết nối",
      description: "Mạng không ổn định hoặc máy chủ không phản hồi.",
    });
    return;
  }

  if (res.status === 401) {
    router.push("/login");
    return;
  }

  if (res.status >= 500) {
    showMessage({
      title: "Lỗi hệ thống",
      description: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    });
    return;
  }
}
