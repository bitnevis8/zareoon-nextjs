import SearchBox from './ui/SearchBox/SearchBox';
import Image from 'next/image';

export default function SearchSection() {
  return (
    <div className="mb-12">
      {/* Logo and Title */}
      <div className="flex justify-center items-center mb-0 gap-0">
        {/* <div className="text-center">
          <h1 className="text-5xl font-bold  text-slate-700 ">
            تگانه
          </h1>
          <p className="text-xl right- relative bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 bg-clip-text text-transparent drop-shadow-md">
           TAGANEH
          </p>
        </div> */}
        <Image
          src="/logo.png"
          alt="لوگو سایت"
          width={240}
          height={240}
          className="object-contain"
          priority
        />
      </div>
      
      {/* Search Box */}
      <SearchBox />
    </div>
  );
} 