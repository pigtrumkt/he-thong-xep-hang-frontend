"use client";

import { useGlobalParams } from "@/components/ClientWrapper";
import { usePopup } from "@/components/popup/PopupContext";
import { API_BASE, apiUploadWithProgress } from "@/lib/api";
import { handleApiError } from "@/lib/handleApiError";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ImagesAdvertisementComponent({
  onHandlesRef,
  initialConfig,
  onSuccessSubmit,
}: {
  onHandlesRef: any;
  initialConfig: {
    slideDuration: number;
    objectFit: number;
    filenames: string[];
  } | null;
  onSuccessSubmit?: () => void;
}) {
  const { showLoading, hideLoading, setProgress } = useGlobalParams();
  const router = useRouter();
  const { popupMessage } = usePopup();
  const [objectFit, setObjectFit] = useState<string>("1");
  const [slideDuration, setSlideDuration] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const handlePickImageFiles = () => imageInputRef.current?.click();

  const uploadedNewFilesRef = useRef<File[]>([]); // những file mới upload
  const [imagesPreview, setImagesPreview] = useState<string[]>([]); // link hiển thị cho thẻ img
  const [imagesFilename, setImagesFilename] = useState<string[]>([]); // lưu tên file để đưa lên server

  const filenameIndex = useRef(0);

  // init load
  useEffect(() => {
    if (initialConfig) {
      // 👉 set lại slideDuration và objectFit
      setSlideDuration(initialConfig.slideDuration);
      setObjectFit(String(initialConfig.objectFit));

      // 👉 Tạo URL từ ảnh đã upload (không thêm vào uploadedFilesRef)
      const baseUrl = `${API_BASE}/advertising/images/`;
      const urls = initialConfig.filenames.map((name) => `${baseUrl}${name}`);
      setImagesPreview(urls);
      setImagesFilename(initialConfig.filenames);

      // 👉 Reset current index
      setCurrentIndex(0);
    }
  }, [initialConfig]);

  const onImagesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (let i = 0; i < files.length; i++) {
      const isImage = files[i].type.startsWith("image/");
      if (!isImage) {
        popupMessage({
          description: `File không hợp lệ: ${files[i].name}`,
        });

        return;
      }

      if (files[i].name.includes(",")) {
        popupMessage({
          description: `Tên file không được chứa dấu phẩy: ${files[i].name}`,
        });

        return;
      }

      if (files[i].size > 20 * 1024 * 1024) {
        popupMessage({
          description: `File ${files[i].name} vượt quá 20MB.`,
        });
        return;
      }
    }

    const renamedFiles = files.map((file) => {
      const ext = file.name.substring(file.name.lastIndexOf("."));
      const newName = `image-${filenameIndex.current++}${ext}`;
      return new File([file], newName, { type: file.type });
    });

    uploadedNewFilesRef.current.push(...renamedFiles);

    const newFilenames = renamedFiles.map((file) => file.name);
    setImagesFilename((prev) => [...prev, ...newFilenames]);

    const urls = renamedFiles.map((f) => URL.createObjectURL(f));
    setImagesPreview((prev) => {
      const next = [...prev, ...urls];
      setCurrentIndex(next.length - 1); // chuyển preview tới ảnh cuối
      return next;
    });

    e.target.value = "";
  };

  const removeUploadedImage = (idx: number) => {
    const removedUrl = imagesPreview[idx];

    if (removedUrl) {
      // ✅ Revoke object URL
      URL.revokeObjectURL(removedUrl);

      // ✅ Xoá đúng File tương ứng (theo vị trí ảnh hiện tại)
      uploadedNewFilesRef.current.splice(idx, 1);
    }

    // ✅ Xoá filename khỏi danh sách
    setImagesFilename((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });

    // ✅ Xoá ảnh khỏi danh sách
    setImagesPreview((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });

    // ✅ Reset preview
    setCurrentIndex(0);
  };

  const clearAll = () => {
    imagesPreview.forEach((u) => URL.revokeObjectURL(u));
    setImagesPreview([]);
    uploadedNewFilesRef.current = [];
    setImagesFilename([]);
    setCurrentIndex(0);
  };

  // Map object-fit -> class
  const objectFitClass =
    (
      {
        "0": "object-contain",
        "1": "object-cover",
        "2": "object-fill",
        "3": "object-none",
        "4": "object-scale-down",
      } as const
    )[objectFit] || "object-cover";

  const handleDragStart = (index: number) => {
    setDragIndex(index);
    document.body.style.cursor = "grabbing";
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // cho phép drop
  };

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  const handleDrop = () => {
    if (
      dragIndex !== null &&
      dragOverIndex !== null &&
      dragIndex !== dragOverIndex
    ) {
      setImagesPreview((prev) => reorder(prev, dragIndex, dragOverIndex));
      uploadedNewFilesRef.current = reorder(
        uploadedNewFilesRef.current,
        dragIndex,
        dragOverIndex
      );

      setImagesFilename((prev) => reorder(prev, dragIndex, dragOverIndex));
      setCurrentIndex(dragOverIndex);
    }

    setDragIndex(null);
    setDragOverIndex(null);
    document.body.style.cursor = "default";
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    document.body.style.cursor = "default";
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // gửi file mới up
      const files = uploadedNewFilesRef.current;
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      // Tên ảnh gốc (dùng để map lại trong NestJS service)
      formData.append("filenames", JSON.stringify(imagesFilename));

      formData.append("slideDuration", String(slideDuration));
      formData.append("objectFit", objectFit);

      showLoading(0, "Đang tải lên...");
      const res = await apiUploadWithProgress(
        "/advertising/counter-screen/images",
        formData,
        (percent) => setProgress(percent)
      );
      if (![201, 400].includes(res.status)) {
        handleApiError(res, popupMessage, router);
      }

      if (res.status === 201) {
        imagesPreview.forEach((u) => URL.revokeObjectURL(u));
        setImagesPreview([]);
        uploadedNewFilesRef.current = [];
        setImagesFilename([]);
        setCurrentIndex(0);

        onSuccessSubmit?.();
        popupMessage({ description: "Cập nhật thành công" });
      } else {
        popupMessage({ description: "Cập nhật thất bại" });
      }
    } catch (err) {
      popupMessage({ description: "Lỗi mạng hoặc máy chủ không phản hồi." });
    } finally {
      hideLoading();
    }
  };

  // Auto slideshow
  useEffect(() => {
    const total = imagesPreview.length;
    if (total > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
      }, slideDuration * 1000);
      return () => clearInterval(timer);
    }
  }, [slideDuration, imagesPreview.length]);

  useEffect(() => {
    if (imagesPreview.length && currentIndex >= imagesPreview.length) {
      setCurrentIndex(imagesPreview.length - 1);
    }
  }, [imagesPreview]);

  useEffect(() => {
    if (onHandlesRef) onHandlesRef.current = { handleSubmit };
    return () => {
      if (onHandlesRef) onHandlesRef.current = null;
    };
  }, [handleSubmit]);

  useEffect(() => {
    return () => {
      imagesPreview.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  return (
    <>
      {/* các input ẩn để chọn file */}
      <input
        ref={imageInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        onChange={onImagesSelected}
        className="hidden"
      />

      <div className="grid w-full gap-8 grid-cols-[4fr_3fr]">
        {/* Preview */}
        <div>
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-blue-700">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Xem trước
          </h3>

          <div className="relative w-full overflow-hidden border border-blue-200 shadow-inner aspect-video rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            {imagesPreview.length > 0 ? (
              <>
                <img
                  src={imagesPreview[currentIndex]}
                  alt="Preview"
                  className={`w-full h-full transition-all duration-500 ${objectFitClass}`}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="p-2 rounded-full bg-black/30 backdrop-blur-sm">
                    <div className="flex gap-1">
                      {imagesPreview.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            idx === currentIndex
                              ? "bg-white flex-1"
                              : "bg-white/50 w-1"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid w-full h-full text-blue-600 place-items-center">
                Chưa có ảnh để hiển thị.
              </div>
            )}
          </div>
        </div>

        <div>
          {/*  Settings */}
          <h4 className="flex items-center gap-2 mb-4 font-bold text-blue-700 text-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-blue-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.31-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .7.4 1.31 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .7.4 1.31 1 1.51h.09a2 2 0 0 1 0 4h-.09c-.7 0-1.31.4-1.51 1z" />
            </svg>
            Cài đặt
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-3 text-sm font-semibold text-blue-700">
                Kiểu hiển thị
              </label>
              <select
                value={objectFit}
                onChange={(e) => setObjectFit(e.target.value)}
                className="w-full px-4 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="0">Hiện toàn bộ</option>
                <option value="1">Phủ đầy khung</option>
                <option value="2">Kéo giãn đầy khung</option>
                <option value="3">Kích thước gốc</option>
                <option value="4">Tự động co lại</option>
              </select>
            </div>
            <div>
              <label className="block mb-3 text-sm font-semibold text-blue-700">
                Thời gian chuyển slide (giây)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={slideDuration}
                  onChange={(e) =>
                    setSlideDuration(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full px-4 py-3 font-medium text-gray-700 transition-all duration-200 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
          {/* danh sach tai len image */}
          <div>
            <div className="flex items-center justify-between mt-8 mb-4 text-blue-700">
              <h4 className="flex items-center gap-2 font-bold text-md">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 17H17.01M15.6 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H8.4M12 15V4M12 4L15 7M12 4L9 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Danh sách tải lên
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-2 text-xs font-semibold text-red-400 border border-red-400 rounded-lg hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                  aria-label="Xóa tất cả"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {imagesPreview.map((url, idx) => {
                const globalIndex = idx; // uploaded trước
                return (
                  <div
                    key={`uploaded-${idx}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    className={`select-none relative group rounded-xl overflow-hidden border-2 hover:scale-105 cursor-move
    ${
      globalIndex === currentIndex
        ? "border-blue-500 shadow-lg shadow-blue-500/25"
        : "border-blue-200 hover:border-blue-400"
    }
    ${dragIndex === idx ? "opacity-50 ring-2 ring-blue-300" : ""}
    ${
      dragOverIndex === idx && dragIndex !== idx
        ? "outline-3 outline-dashed outline-blue-400"
        : ""
    }
  `}
                    onClick={() => setCurrentIndex(globalIndex)}
                    style={{ width: 96, height: 96 }}
                    title={`Ảnh đã tải lên ${idx + 1}`}
                  >
                    {/* ...img & nút xoá của bạn giữ nguyên... */}
                    <img
                      src={url}
                      alt={`Uploaded ${idx + 1}`}
                      className={`w-full h-full ${objectFitClass} bg-gray-100`}
                      draggable={false}
                    />
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeUploadedImage(idx);
                      }}
                      className="absolute flex items-center justify-center w-6 h-6 text-sm font-bold text-white transition bg-red-500 rounded-full top-1 right-1 hover:bg-red-600"
                      aria-label="Xoá ảnh"
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              {/* Ô cuối cùng: nút tải lên */}
              {imagesPreview.length < 30 && (
                <button
                  type="button"
                  onClick={handlePickImageFiles}
                  className="flex items-center justify-center transition-all duration-200 border-2 border-blue-300 border-dashed select-none rounded-xl hover:border-blue-500 hover:bg-blue-50"
                  style={{ width: 96, height: 96 }}
                  title="Tải lên ảnh"
                >
                  <div className="flex flex-col items-center justify-center gap-1 text-blue-600">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="text-xs font-semibold">Tải lên</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
