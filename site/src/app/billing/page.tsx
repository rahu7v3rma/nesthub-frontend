'use client';

import moment from 'moment';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import PaymentMethods from '@/components/billing/paymentMethod';
import PlanCard from '@/components/billing/planCard';
import {
  createCheckout,
  getPaymentHistory,
  getPaymentMethods,
  cancelSubscription,
} from '@/services/api';
import Button from '@/shared/Button';
import Checkbox from '@/shared/Checkbox';
import Modal from '@/shared/Modal';
import Text from '@/shared/Text';

export interface PaymentMethod {
  id: string;
  brand: string;
  exp_month: string;
  exp_year: string;
  last4: string;
  is_default: boolean;
}

type PaymentStatus = 'Failed' | 'Pending' | 'Success';

export interface PaymentHistory {
  id: string;
  amount: string;
  date: string;
  status: PaymentStatus;
  stripe_id: string;
}

export default function BillingInformation() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    // {
    //   id: 1,
    //   brand: '/pngs/visa.png',
    //   text: 'Visa ending with 7856',
    //   expiry: '02/28',
    //   isDefault: true,
    // },
    // {
    //   id: 2,
    //   brand: '/pngs/mastercard.png',
    //   text: 'Mastercard ending with 6758',
    //   expiry: '08/25',
    //   isDefault: false,
    // },
  ]);

  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    getPaymentMethods()
      .then((res) => {
        setPaymentMethods(res);
      })
      .catch(() => {
        setPaymentMethods([]);
      });

    getPaymentHistory()
      .then((res) => {
        setPaymentHistory(res);
      })
      .catch(() => {
        setPaymentHistory([]);
      });
  }, []);

  useEffect(() => {
    if (success === 'true') {
      toast.success('Payment succeeded!');
      window.history.replaceState(null, '', window.location.pathname);
    } else if (success === 'false') {
      toast.error('Payment failed or was canceled.');
    }
  }, [success]);

  const handlePayment = async (planType: string) => {
    setLoading(true);
    try {
      const response = await createCheckout(planType);
      window.location.href = response.checkout_url;
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await cancelSubscription();
      toast.success(response.message || 'Subscription cancelled successfully');
      setShowCancelModal(false);
    } catch (error: any) {
      console.error('Cancel subscription failed:', error);
      toast.error(error?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const history = [
    { id: 1, amount: '$50', date: '11/06/2024', status: 'Failed' },
    { id: 2, amount: '$50', date: '11/06/2024', status: 'Pending' },
    { id: 3, amount: '$50', date: '11/06/2024', status: 'Success' },
  ];

  const statusColors = {
    Failed: 'text-red-500',
    Pending: 'text-orange-500',
    Success: 'text-green-600',
  };

  const reasons = [
    'Price is too high',
    'I don’t use the app',
    'Other',
  ] as const;

  const statusDot = {
    Failed: 'bg-[#DE2E42]',
    Pending: 'bg-[#E28700]',
    Success: 'bg-[#00A27B]',
  };

  const plans = [
    {
      type: 'Monthly',
      price: '$50',
      features: [
        'something-something',
        'something-something',
        'something-something',
        'something-something',
      ],
      isRecommended: false,
    },
    {
      type: 'Yearly',
      price: '$500',
      features: [
        'something-something',
        'something-something',
        'something-something',
        'something-something',
      ],
      isRecommended: true,
    },
  ];

  return (
    <>
      <div className="p-2 sm:p-6 md:p-8 space-y-8 bg-[#F9F9F9] min-h-screen">
        <div className="bg-[#F9F9F9] p-4 sm:p-6 rounded-xl">
          {/* Updated Membership header with button layout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <Text
              variant="h1"
              className="text-lg font-bold text-[20px] font-[Figtree]"
              color="text-[#2D2C31]"
              weight="bold"
            >
              Membership
            </Text>
            <div className="hidden lg:block mt-2 sm:mt-0">
              <Button
                onClick={() => setShowCancelModal(true)}
                backgroundColor="bg-neutral-900"
                color="text-white"
                className="w-auto h-auto px-5 py-2 text-xs font-bold uppercase flex items-center gap-2 rounded-full hover:bg-neutral-800 transition"
              >
                Cancel&nbsp;Membership
                <span className="text-white text-base">→</span>
              </Button>
            </div>
          </div>

          {/* Free Trial Message */}
          <div className="bg-[#FDFDFD] border border-[#F6F6F6] rounded-xl p-4 mt-6 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            {/* ── Mobile header row ─────────────────────────────── */}
            <div className="flex w-full items-center justify-between sm:hidden">
              <p className="text-sm font-bold text-[#2D2C31]">Free trial</p>

              {/* Badge – mobile inline */}
              <span className="bg-red-100 text-[#DE2E42] font-medium font-inter text-xs px-3 py-2 rounded-full">
                Expired on Jan&nbsp;13th
              </span>
            </div>

            {/* ── Full sentence for ≥ 640 px ────────────────────── */}
            <p className="hidden sm:block text-sm sm:text-base text-[#2D2C31]">
              <span className="font-bold font-figtree text-base">
                Free trial
              </span>{' '}
              — Your free trial has expired. Please choose a plan to continue
            </p>

            {/* Badge – desktop / tablet (unchanged) */}
            <span className="hidden sm:inline-block bg-red-100 w-[128px] h-[25px] text-[#DE2E42] font-[400] text-[12px] font-figtree px-2 py-1 rounded-full flex items-center justify-center text-center">
              Expired on Jan&nbsp;13th
            </span>

            {/* ── Explanatory line for mobile ───────────────────── */}
            <p className="sm:hidden text-sm text-[#2D2C31] mt-1">
              Your free trial has expired. Please choose a plan to continue
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.type}
                type={plan.type}
                price={plan.price}
                features={plan.features}
                isRecommended={plan.isRecommended}
                onSelect={() => handlePayment(plan.type.toLocaleLowerCase())}
              />
            ))}
          </div>
        </div>

        {/* Billing Section */}
        <div className="max-w-6xl mx-auto bg-[#FDFDFD] rounded-2xl p-4 sm:p-6 md:p-10 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-[#2D2C31] mb-4">
            Billing information
          </h2>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Payment Methods */}
            <div className="flex-1">
              <div className="space-y-4">
                <PaymentMethods
                  payments={paymentMethods}
                  onAdd={() => {} /* open “add card” modal */}
                  onRemove={(id) =>
                    setPaymentMethods((p) => p.filter((m: any) => m.id !== id))
                  }
                  onSetDefault={(id) =>
                    setPaymentMethods((p) =>
                      p.map((m) => ({ ...m, isDefault: m.id === id })),
                    )
                  }
                />
              </div>
            </div>

            {/* History */}
            <div className="flex-1 bg-[#FAFAFA] rounded-xl p-4">
              <h3 className="text-base font-bold text-[#2D2C31] mb-4">
                History
              </h3>

              {/* Scrollable Table for Mobile */}
              <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                  <div className="hidden sm:flex items-center text-[#A9A6B2] text-xs font-medium mb-2 font-figtree">
                    <div className="w-1/4">Amount</div>
                    <div className="w-1/3">Date</div>
                    <div className="w-1/3">Status</div>
                    <div className="w-[30px]"></div>
                  </div>
                  <div className="divide-y divide-[#F6F6F6] border border-[#F6F6F6] rounded-lg">
                    {paymentHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 text-sm min-w-[480px]"
                      >
                        <div className="w-1/4 font-bold text-[#2D2C31]">
                          ${item.amount}
                        </div>
                        <div className="w-1/3">
                          {moment(item.date).format('DD/MM/YYYY')}
                        </div>
                        <div className="w-1/3 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${statusDot[item.status]}`}
                          />
                          <span className={`${statusColors[item.status]}`}>
                            {item.status}
                          </span>
                        </div>
                        <button className="w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#F1F1F1]">
                          <Image
                            src="/pngs/comment.png"
                            alt="comment icon"
                            width={12}
                            height={12}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex sm:hidden mb-3 justify-center">
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-neutral-900 text-white px-5 py-2 rounded-full text-xs font-inter font-bold uppercase flex items-center gap-2 hover:bg-neutral-800 transition"
            >
              Cancel Membership
              <span className="text-white text-base">→</span>
            </button>
          </div>

          <div className="md:mt-8 text-sm text-[#A9A6B2] font-normal font-figtree">
            <hr className="border-t border-[#F6F6F6] mb-6 hidden md:block" />
            Reach out for Broker packages for your whole company{' '}
            <span className="font-semibold">xyz@gmail.com</span>
          </div>
        </div>
      </div>
      <Modal
        size="lg"
        onClose={() => setShowCancelModal(false)}
        isOpen={showCancelModal}
        modalTitle=""
        hideTopCloseButton={true}
        hideCloseButton
      >
        {/* All your modal content goes here directly */}
        <div className="relative rounded-[24px] bg-[#FFFFFF]">
          {/* Headings */}
          <div className="relative flex items-center justify-center">
            <Text
              as="h3"
              align="center"
              color="text-[#2D2C31]"
              weight="bold"
              fontFamily="font-figtree"
              className="text-base"
            >
              Cancel membership
            </Text>

            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute right-0 hidden sm:flex w-4 h-4 items-center justify-center"
            >
              <Image
                src="/pngs/closebtn.png"
                alt="Close"
                width={24}
                height={24}
                className="object-contain"
              />
            </button>
          </div>

          <div className="mt-5 space-y-2 h-[63px]">
            <Text
              // as="h2"
              align="center"
              color="text-[#2D2C31]"
              weight="bold"
              fontFamily="font-figtree"
              className="text-xl"
            >
              Sorry to see you go :(
            </Text>
            <Text
              align="center"
              color="text-[#5E5E61]"
              fontFamily="font-figtree"
              className="text-sm"
            >
              We are sorry you are thinking of why?
              <br />
              Leaving us. Would you tell us why?
            </Text>
          </div>

          {/* Reasons */}
          <div className="mt-10 space-y-5">
            {reasons.map((label) => {
              const isOn = checked[label];

              return (
                <div key={label} className="space-y-2">
                  <Checkbox
                    name={label}
                    value={!!isOn}
                    checkedColor="#2D2C31"
                    rounded="rounded-md"
                    onChange={() =>
                      setChecked((prev) => ({
                        ...prev,
                        [label]: !prev[label],
                      }))
                    }
                  >
                    <span className="text-sm text-[#A9A6B2] font-normal font-figtree">
                      {label}
                    </span>
                  </Checkbox>

                  {isOn && (
                    <input
                      type="text"
                      value={values[label] ?? ''}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [label]: e.target.value,
                        }))
                      }
                      className="w-full rounded-full bg-[#F6F6F6] px-4 py-5 text-sm outline-none mb-5"
                      autoFocus
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA buttons */}
          <div className="mt-10 mb-5 flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <Button
              backgroundColor="bg-[#F6F6F6]"
              onClick={() => setShowCancelModal(false)}
              color="text-[#111827]"
              className="hover:opacity-90 "
            >
              STAY A MEMBER
            </Button>

            <Button
              backgroundColor="bg-[#2D2C31]"
              onClick={handleCancelSubscription}
              className="hover:opacity-90"
            >
              CANCEL MEMBERSHIP
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
