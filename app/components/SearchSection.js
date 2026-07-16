import SearchBox from './ui/SearchBox/SearchBox';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function SearchSection() {
  const t = await getTranslations('home');

  return (
    <div className="mb-12">
      <div className="flex justify-center items-center mb-0 gap-0">
        <Image
          src="/logo.png"
          alt={t('logoAlt')}
          width={240}
          height={240}
          className="object-contain"
          priority
        />
      </div>
      <SearchBox />
    </div>
  );
}
