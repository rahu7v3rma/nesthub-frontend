import clsx from 'clsx';
import Image from 'next/image';
import React, { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

export interface TaxReturnFileUploadProps {
  className?: string;
  files: File | null;
  maxSize: number; // bytes
  disabled?: boolean;
  handleChange: (files: FileList | File) => void;
  types: string[]; // MIME types
  title: string;
  percent?: string;
  loading?: boolean;
  onCancelClick?: () => void;
}

const TaxReturnFileUpload: React.FC<TaxReturnFileUploadProps> = ({
  className,
  files,
  handleChange,
  types,
  disabled,
  maxSize,
  title,
  percent,
  loading,
  onCancelClick,
}) => {
  const onFileInputChange = useCallback(
    (file: File) => {
      if (!types.includes(file.type)) {
        toast.error(
          'Unsupported file type. ' +
            `Please select a (${types?.map((t) => t.split('/')[1]).join(',')}) file.`,
        );
        return;
      }

      if (file.size > maxSize) {
        toast.error(
          `File size exceeds the limit of ${Math.round(maxSize / 1024 / 1024)}mb. ` +
            'Please select a smaller file.',
        );
        return;
      }

      handleChange(file);
    },
    [handleChange, maxSize, types],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clickFileInput = useCallback(() => fileInputRef.current?.click(), []);

  return (
    <div className={clsx('flex flex-col gap-6', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.length) {
            onFileInputChange(e.target.files[0]);
          }
        }}
        disabled={disabled}
        className="hidden"
        accept={types.join(',')}
      />
      <div className="flex items-center justify-between gap-[8px] rounded-[12px] min-w-0">
        <div className="flex flex-col gap-[4px] min-w-0 flex-1">
          {title && (
            <span className="text-extrabold-900 text-[#242052] text-[14px] tracking-[0.6px]">
              {title}
            </span>
          )}
          {files ? (
            loading ? null : (
              <span
                className="text-liberty text-[13px] tracking-[0.6px] leading-[15px] mt-[4px] inline-block"
                onClick={clickFileInput}
              >
                <span className="border-b border-liberty cursor-pointer">
                  Choose new file
                </span>
              </span>
            )
          ) : (
            <span
              className="text-bold-600 text-chinese_oragne text-[13px] tracking-[0.6px] leading-[15px] mt-[4px] cursor-pointer inline-block"
              onClick={clickFileInput}
            >
              <span className="border-b border-chinese_oragne">
                Upload file
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center shrink-0 mt-[4px]">
          {files && (
            <span className="text-medium-500 text-[#969495] text-[13px] tracking-[0.6px] mr-[10px] truncate max-w-[200px]">
              {files.name} {loading && '• ' + percent}
            </span>
          )}
          {files && loading ? (
            <div className="w-[40px] h-[40px] bg-[#ED694312] rounded-[115px] flex flex-col item-center justify-center shrink-0">
              <Image
                src="/svgs/loader.svg"
                width={6}
                className="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-chinese_oragne ml-[7px]"
                height={6}
                alt="Loader"
              />
            </div>
          ) : (
            <Image
              src={files ? '/svgs/document.svg' : '/svgs/upload.svg'}
              alt="upload-icon"
              width={40}
              height={40}
              onClick={clickFileInput}
              className="cursor-pointer shrink-0"
            />
          )}
        </div>
      </div>
      {files && loading && (
        <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div
            className="bg-chinese_oragne h-1 rounded-full dark:bg-chinese_oragne"
            style={{ width: percent }}
          />
        </div>
      )}
    </div>
  );
};

export default TaxReturnFileUpload;
