'use client'
import Link from "next/link";
import { useRouter } from 'next/navigation'

const menuItems = [
  {
    title: "Карточки с вопросами",
    href: "/questions",
  },
];

export default function Home() {
  const router = useRouter();
  
  if (menuItems.length === 1) {
    router.push(menuItems[0].href);
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      {menuItems.map((item) => (
        <Link href={item.href} className="group">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
