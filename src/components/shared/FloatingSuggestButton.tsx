"use client";

import { useState } from "react";
import { Plus, X, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import SuggestModal from "./SuggestModal";

export default function FloatingSuggestButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"course" | "professor">("course");

  const handleOpenModal = (type: "course" | "professor") => {
    setModalType(type);
    setModalOpen(true);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Floating Button Group */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
        {/* Sub buttons - only show when expanded */}
        {isExpanded && (
          <>
            <button
              onClick={() => handleOpenModal("course")}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all animate-in slide-in-from-bottom-2 duration-200"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Ders Öner</span>
            </button>
            <button
              onClick={() => handleOpenModal("professor")}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all animate-in slide-in-from-bottom-2 duration-200 delay-75"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Hoca Öner</span>
            </button>
          </>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
            isExpanded
              ? "bg-muted text-muted-foreground rotate-45"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={isExpanded ? "Kapat" : "Eksik ders veya hoca bildir"}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Modal */}
      <SuggestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
      />
    </>
  );
}
