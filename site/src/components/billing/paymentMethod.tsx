import { startCase } from 'lodash';
import Image from 'next/image';
import React from 'react';

import { PaymentMethod } from '@/app/billing/page';
import Button from '@/shared/Button';
import Text from '@/shared/Text';

type PaymentMethodsProps = {
  payments?: PaymentMethod[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  onSetDefault?: (id: string) => void;
};

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  payments = [],
  onAdd,
  onRemove,
  onSetDefault,
}) => (
  <div className="flex-1">
    {/* ── Heading + add card ─────────────────────────── */}
    <div className="flex items-center mb-4">
      <Text
        as="h3"
        weight="bold"
        className="text-base"
        fontFamily="font-figtree"
        color="text-[#2D2C31]"
      >
        Payment methods
      </Text>

      <button
        onClick={onAdd}
        className="w-6 h-6 items-center mb-2 ml-1 justify-center rounded-full bg-[#F9F9F9]"
      >
        <span className="text-[#2D2C31] font-bold">+</span>
      </button>
    </div>

    {/* ── Card list ──────────────────────────────────── */}
    <div className="space-y-4">
      {payments.map((m) => (
        <div
          key={m.id}
          className="relative bg-[#FDFDFD] rounded-xl pt-4 pb-4 px-4 flex flex-col sm:flex-row sm:items-center justify-between"
        >
          {/* Default badge (top‑right) */}
          {m.is_default && (
            <span className="absolute top-[-10px] right-0 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium sm:hidden">
              Default
            </span>
          )}

          {/* Brand + info */}
          <div className="flex gap-2 items-center">
            <div className="w-24 h-16 rounded-xl bg-[#F6F6F6] flex items-center justify-center">
              <Image
                src={`/pngs/${m.brand}.png`}
                alt={`${m.brand} logo`}
                width={40}
                height={24}
              />
            </div>

            <div>
              {/* Line with label and inline “Set as default” (desktop) */}
              <div className="flex items-center gap-2">
                <Text
                  weight="bold"
                  className="text-sm"
                  color="text-[#2D2C31]"
                  fontFamily="font-figtree"
                >
                  {`${startCase(m.brand)} ending with ${m.last4}`}
                </Text>
                {/* Default badge (top‑right) */}
                {m.is_default && (
                  <span className="hidden sm:inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                    Default
                  </span>
                )}

                {!m.is_default && (
                  <Button
                    onClick={() => onSetDefault?.(m.id)}
                    backgroundColor="bg-transparent"
                    color="text-gray-600"
                    className="hidden sm:inline-flex underline text-xs w-auto h-auto p-0"
                  >
                    Set as default
                  </Button>
                )}
              </div>

              {/* Expiry */}
              <Text
                as="p"
                className="text-sm mt-1"
                color="text-[#A9A6B2]"
                fontFamily="font-figtree"
              >
                Expires on {m.exp_month}/{m.exp_year}
              </Text>
            </div>
          </div>

          {/* Bottom‑right “Set as default” (mobile) */}
          {!m.is_default && (
            <div className="sm:hidden flex justify-end mt-3">
              <Button
                onClick={() => onSetDefault?.(m.id)}
                backgroundColor="bg-transparent"
                color="text-gray-600"
                className="underline text-xs w-auto h-auto p-0"
              >
                Set as default
              </Button>
            </div>
          )}

          {/* Remove (×) – desktop only */}
          <button
            onClick={() => onRemove?.(m.id)}
            className="hidden sm:flex w-6 h-6 items-center justify-center rounded-full bg-[#f9f9f9] mb-5"
          >
            <p className="text-[#2D2C31] text-xl font-bold pb-1">×</p>
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default PaymentMethods;
