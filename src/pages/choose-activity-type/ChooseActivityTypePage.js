import PageWrapper from "../../components/page-wrapper/PageWrapper";
import ButtonChooseActivityType from "../../components/button-choose-activity-type/ButtonChooseActivityType";
import { RefreshCcw, BookOpen, Headphones, PencilLine, Mic } from "lucide-react";

export default function ChooseActivityTypePage() {
  return (
    <PageWrapper>
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white min-h-screen flex flex-col">

        <header className="p-4">
          <a href="index.html" className="text-xl font-bold text-white hover:text-yellow-300 transition">Loomyz</a>
        </header>

        <main className="flex items-center flex justify-center px-4 py-10">
          <div className="bg-white text-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Choose your activity</h1>

            <div className="space-y-4">
              <button
                className="w-full flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg transition">
                <RefreshCcw className="w-5 h-5 mt-1" />
                <div className="text-left leading-tight">
                  <span className="block font-medium text-base">Review</span>
                  <span className="block text-xs text-white/80">18 cards for review</span>
                </div>
              </button>

              <ButtonChooseActivityType
                icon={BookOpen}
                bgClass="bg-green-600 hover:bg-green-700"
                name="Reading"
              />

              <ButtonChooseActivityType
                icon={Headphones}
                bgClass="bg-blue-600 hover:bg-blue-700"
                name="Listening"
              />

              <ButtonChooseActivityType
                icon={PencilLine}
                bgClass="bg-yellow-500 hover:bg-yellow-600"
                name="Writing"
              />

              <ButtonChooseActivityType
                icon={Mic}
                bgClass="bg-pink-600 hover:bg-pink-700"
                name="Speaking"
              />

            </div>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}