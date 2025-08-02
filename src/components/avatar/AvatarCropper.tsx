"use client";

import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

type Props = {
  imageUrl: string;
  onCancel: () => void;
  onCropDone: (blob: Blob) => void;
};

export default function AvatarCropper({
  imageUrl,
  onCancel,
  onCropDone,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    const image = await createImage(imageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, x, y } = croppedAreaPixels;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (blob) onCropDone(blob);
    }, "image/jpeg");
  }, [croppedAreaPixels, imageUrl, onCropDone]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
      <div className="w-full max-w-lg p-6 space-y-4 bg-white shadow-xl rounded-xl">
        <h2 className="text-lg font-bold text-blue-700">Cắt ảnh đại diện</h2>

        <div className="relative w-full bg-gray-100 aspect-square">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-2">
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(value) => setZoom(value as number)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={getCroppedImage}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
  });
}
