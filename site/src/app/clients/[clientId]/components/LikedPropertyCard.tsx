import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { Property } from '@/interfaces/property';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

type LikedPropertyCardProps = {
  property: Property;
};

export function LikedPropertyCard({ property }: LikedPropertyCardProps) {
  const router = useRouter();
  const params = useParams();

  const { clientId } = params;

  const handleCardClick = () => {
    localStorage.setItem(
      'realtor_property_id',
      (property?.realtor_property_id || '') as string,
    );
    localStorage.setItem('clientId', (clientId || '') as string);
    localStorage.removeItem('properties_page');
    router?.push(`/properties/${property.id}`);
  };

  return (
    <article
      className="flex-shrink-0 lg:w-64 md:w-72 cursor-pointer mb-3 md:mb-0"
      onClick={handleCardClick}
    >
      <div className="relative h-40 w-full">
        <Image
          alt={property.name || 'Liked property image'}
          src={property.image || '/images/placeholder-property.jpg'}
          layout="fill"
          objectFit="cover"
          className="rounded-2xl"
        />
      </div>
      <div className="mt-3">
        <p className="font-semibold text-lg text-gray-900">
          {formatPrice(property.price)}
        </p>
        <p className="text-sm text-gray-600 truncate">{property.address}</p>
      </div>
    </article>
  );
}
