import Link from "next/link";
import { MENU_ITEMS } from "@/config/constants";

export function AdminMenu() {
  return (
    <div className="container mx-auto p-8">
      {MENU_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} className="group block mb-4">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
} 