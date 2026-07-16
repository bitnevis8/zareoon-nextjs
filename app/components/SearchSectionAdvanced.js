import SearchBoxAdvanced from './ui/SearchBox/SearchBoxAdvanced';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function SearchSectionAdvanced() {
  const tHome = await getTranslations('home');
  const tSite = await getTranslations('site');

  return (
    <div className="mb-12">
      <div className="flex justify-center items-center mb-4 gap-0">
        <div className="text-center">
          <h1 className="text-5xl font-bold  text-slate-700 ">
            {tSite('brandName')}
          </h1>
          <p className="text-xl right- relative bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 bg-clip-text text-transparent drop-shadow-md">
           TAGANEH
          </p>
        </div>
        <Image
          src="/logo.png"
          alt={tHome('logoAlt')}
          width={240}
          height={240}
          className="object-contain"
          priority
        />
      </div>
      <SearchBoxAdvanced />
    </div>
  );
}
