import { contactSupport } from '@/services/email';
import Text from '@/shared/Text';

const SupportText = () => {
  return (
    <div className="flex justify-center items-center mt-4">
      <Text className="text-spanish_gray !text-[13px]">
        For any questions, contact our&nbsp;
        <span
          onClick={contactSupport}
          className="text-[#4353A4] !text-sm font-bold underline cursor-pointer"
        >
          Support Team
        </span>
      </Text>
    </div>
  );
};

export default SupportText;
