import React from 'react';

import Button from '@/shared/Button';
import Text from '@/shared/Text';

type PlanCardProps = {
  type: string;
  price: string;
  features: string[];
  isRecommended?: boolean;
  onSelect: () => void;
};

const PlanCard: React.FC<PlanCardProps> = ({
  type,
  price,
  features,
  isRecommended = false,
  onSelect,
}) => (
  <div className="flex min-h-[260px] flex-col gap-4 rounded-2xl border border-[#F6F6F6] bg-[#FDFDFD] p-4 sm:p-6">
    {/* ── Header row ───────────────────────────────────────────── */}
    <div className="flex items-start justify-between">
      {/* Plan type + badge + mobile price */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Text
            variant="body"
            weight="bold"
            color="text-[#2D2C31]"
            className="text-base"
            fontFamily="font-figtree"
          >
            {type}
          </Text>

          {isRecommended && (
            <span className="rounded-full bg-[#EEF8F5] px-2 py-1 text-xs text-[#00A27B] text-xs font-normal ">
              Save 30%
            </span>
          )}
        </div>

        {/* Price (mobile only) */}
        <Text
          as="p"
          weight="bold"
          color="text-[#2D2C31]"
          fontFamily="font-figtree"
          className="text-3xl leading-none sm:hidden"
        >
          {price}{' '}
          <Text
            as="span"
            variant="caption"
            weight="normal"
            fontFamily="font-figtree"
            color="text-[#5E5E61]"
          >
            /month
          </Text>
        </Text>
      </div>

      {/* Select CTA (desktop / tablet only) */}
      <Button
        onClick={onSelect}
        backgroundColor="bg-neutral-900"
        color="text-white"
        className="hidden sm:flex w-auto h-auto px-5 py-2 items-center gap-2 rounded-full text-xs font-bold uppercase hover:bg-neutral-800 transition"
      >
        Select <span className="text-base">→</span>
      </Button>
    </div>

    {/* ── Feature list ─────────────────────────────────────────── */}
    <ul className="space-y-3">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
            ✓
          </span>
          <Text
            as="span"
            variant="body"
            fontFamily="font-figtree"
            color="text-[#2D2C31]"
            weight="normal"
            className="text-sm"
          >
            {feature}
          </Text>
        </li>
      ))}
    </ul>

    {/* ── Price (tablet/desktop only) ──────────────────────────── */}
    <div className="hidden justify-end sm:flex">
      <Text
        as="p"
        weight="bold"
        color="text-[#2D2C31]"
        fontFamily="font-figtree"
        className="text-3xl leading-none"
      >
        {price}{' '}
        <Text
          as="span"
          variant="caption"
          weight="medium"
          fontFamily="font-figtree"
          color="text-[#5E5E61] text-[13px]"
        >
          /month
        </Text>
      </Text>
    </div>

    {/* ── Select CTA (mobile only, full width) ─────────────────── */}
    <Button
      onClick={onSelect}
      backgroundColor="bg-neutral-900"
      color="text-white"
      className="sm:hidden w-full px-5 py-3 rounded-full text-xs font-bold uppercase hover:bg-neutral-800 transition"
    >
      Select <span className="text-base">→</span>
    </Button>
  </div>
);

export default PlanCard;
